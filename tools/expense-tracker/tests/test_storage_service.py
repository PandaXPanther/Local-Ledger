import tempfile
import unittest
from datetime import date
from decimal import Decimal
from pathlib import Path

from expense_tracker.service import ExpenseService, NotFoundError
from expense_tracker.storage import JsonStore, StorageError


def make_service(tmpdir: str) -> ExpenseService:
    return ExpenseService(JsonStore(Path(tmpdir) / "expenses.json"))


class StorageTests(unittest.TestCase):
    def test_load_missing_file_returns_empty(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(JsonStore(Path(tmp) / "nope.json").load(), [])

    def test_corrupt_json_raises_storage_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "expenses.json"
            path.write_text("{not json", encoding="utf-8")
            with self.assertRaises(StorageError):
                JsonStore(path).load()

    def test_wrong_schema_version_raises(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "expenses.json"
            path.write_text('{"version": 99, "expenses": []}', encoding="utf-8")
            with self.assertRaises(StorageError):
                JsonStore(path).load()


class ServiceTests(unittest.TestCase):
    def test_add_assigns_sequential_ids_and_persists(self):
        with tempfile.TemporaryDirectory() as tmp:
            service = make_service(tmp)
            a = service.add(Decimal("5.00"), "food", "coffee", date(2026, 7, 1))
            b = service.add(Decimal("9.99"), "books", "novel", date(2026, 7, 2))
            self.assertEqual((a.id, b.id), (1, 2))
            # Fresh service instance reads the same file back.
            reread = make_service(tmp).list()
            self.assertEqual(len(reread), 2)
            self.assertEqual(reread[0].description, "novel")  # newest first

    def test_ids_not_reused_after_delete(self):
        with tempfile.TemporaryDirectory() as tmp:
            service = make_service(tmp)
            service.add(Decimal("1.00"), "a", "", date(2026, 7, 1))
            second = service.add(Decimal("2.00"), "b", "", date(2026, 7, 1))
            service.delete(second.id)
            third = service.add(Decimal("3.00"), "c", "", date(2026, 7, 1))
            self.assertEqual(third.id, 3)

    def test_list_filters_by_category_month_and_limit(self):
        with tempfile.TemporaryDirectory() as tmp:
            service = make_service(tmp)
            service.add(Decimal("10.00"), "food", "june lunch", date(2026, 6, 15))
            service.add(Decimal("20.00"), "food", "july lunch", date(2026, 7, 1))
            service.add(Decimal("30.00"), "rent", "july rent", date(2026, 7, 1))
            self.assertEqual(len(service.list(category="food")), 2)
            self.assertEqual(len(service.list(month="2026-07")), 2)
            only = service.list(category="food", month="2026-07")
            self.assertEqual([e.description for e in only], ["july lunch"])
            self.assertEqual(len(service.list(limit=1)), 1)

    def test_delete_missing_id_raises(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(NotFoundError):
                make_service(tmp).delete(42)

    def test_monthly_summary_totals_and_shares(self):
        with tempfile.TemporaryDirectory() as tmp:
            service = make_service(tmp)
            service.add(Decimal("10.00"), "food", "", date(2026, 7, 1))
            service.add(Decimal("30.00"), "rent", "", date(2026, 7, 2))
            service.add(Decimal("99.00"), "food", "", date(2026, 6, 1))  # other month
            summary = service.monthly_summary("2026-07")
            self.assertEqual(summary.total, Decimal("40.00"))
            self.assertEqual(summary.count, 2)
            self.assertEqual(
                [(c.category, c.total) for c in summary.by_category],
                [("rent", Decimal("30.00")), ("food", Decimal("10.00"))],
            )


if __name__ == "__main__":
    unittest.main()
