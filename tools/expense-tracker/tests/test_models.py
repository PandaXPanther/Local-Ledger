import unittest
from datetime import date
from decimal import Decimal

from expense_tracker.models import (
    Expense,
    ValidationError,
    normalize_category,
    parse_amount,
    parse_date,
    parse_month,
)


class ParseAmountTests(unittest.TestCase):
    def test_accepts_plain_and_dollar_and_commas(self):
        self.assertEqual(parse_amount("12.50"), Decimal("12.50"))
        self.assertEqual(parse_amount("$1,250"), Decimal("1250.00"))
        self.assertEqual(parse_amount("7"), Decimal("7.00"))

    def test_rejects_garbage_zero_negative_and_subcent(self):
        for bad in ["abc", "0", "-5", "1.234", "", "nan", "inf", "-inf"]:
            with self.assertRaises(ValidationError, msg=bad):
                parse_amount(bad)


class CategoryTests(unittest.TestCase):
    def test_normalizes_case_and_spaces(self):
        self.assertEqual(normalize_category("Car Repair"), "car-repair")
        self.assertEqual(normalize_category("FOOD"), "food")

    def test_rejects_bad_slugs(self):
        for bad in ["", "-food", "f/ood", "  "]:
            with self.assertRaises(ValidationError, msg=bad):
                normalize_category(bad)


class DateTests(unittest.TestCase):
    def test_parse_date_and_month(self):
        self.assertEqual(parse_date("2026-07-04"), date(2026, 7, 4))
        self.assertEqual(parse_month("2026-07"), "2026-07")
        with self.assertRaises(ValidationError):
            parse_date("07/04/2026")
        with self.assertRaises(ValidationError):
            parse_month("2026-13")


class ExpenseRoundtripTests(unittest.TestCase):
    def test_json_roundtrip_preserves_cents(self):
        original = Expense(
            id=3,
            amount=Decimal("10.10"),
            category="food",
            description="lunch",
            spent_on=date(2026, 7, 1),
        )
        restored = Expense.from_json(original.to_json())
        self.assertEqual(restored, original)
        self.assertEqual(original.to_json()["amount"], "10.10")

    def test_malformed_record_raises(self):
        with self.assertRaises(ValidationError):
            Expense.from_json({"id": "x"})


if __name__ == "__main__":
    unittest.main()
