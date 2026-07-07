import contextlib
import io
import os
import tempfile
import unittest
from pathlib import Path

from expense_tracker.cli import main


class CliTests(unittest.TestCase):
    """End-to-end through main(), with the data file redirected to a temp dir."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        os.environ["EXPENSE_TRACKER_FILE"] = str(Path(self._tmp.name) / "expenses.json")
        self.addCleanup(os.environ.pop, "EXPENSE_TRACKER_FILE", None)

    def run_cli(self, *argv):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = main(list(argv))
        return code, out.getvalue(), err.getvalue()

    def test_add_list_summary_delete_flow(self):
        code, out, _ = self.run_cli("add", "12.50", "Food", "lunch", "downtown", "--date", "2026-07-03")
        self.assertEqual(code, 0)
        self.assertIn("Added #1: $12.50 on food (lunch downtown)", out)

        self.run_cli("add", "800", "rent", "--date", "2026-07-01")
        code, out, _ = self.run_cli("list", "--month", "2026-07")
        self.assertEqual(code, 0)
        self.assertIn("lunch downtown", out)
        self.assertIn("total $812.50", out)

        code, out, _ = self.run_cli("summary", "--month", "2026-07")
        self.assertEqual(code, 0)
        self.assertIn("rent", out)
        self.assertIn("$800.00", out)
        self.assertIn("98.5%", out)

        code, out, _ = self.run_cli("delete", "1")
        self.assertEqual(code, 0)
        code, out, _ = self.run_cli("list", "--category", "food")
        self.assertIn("No expenses for category food", out)

    def test_bad_amount_exits_1_with_message(self):
        code, _, err = self.run_cli("add", "twelve", "food")
        self.assertEqual(code, 1)
        self.assertIn("invalid amount", err)

    def test_delete_missing_exits_1(self):
        code, _, err = self.run_cli("delete", "99")
        self.assertEqual(code, 1)
        self.assertIn("no expense with id 99", err)

    def test_corrupt_file_exits_2(self):
        Path(os.environ["EXPENSE_TRACKER_FILE"]).write_text("{broken", encoding="utf-8")
        code, _, err = self.run_cli("list")
        self.assertEqual(code, 2)
        self.assertIn("storage error", err)

    def test_empty_list_is_friendly(self):
        code, out, _ = self.run_cli("list")
        self.assertEqual(code, 0)
        self.assertIn("expense add 12.50 food lunch", out)


if __name__ == "__main__":
    unittest.main()
