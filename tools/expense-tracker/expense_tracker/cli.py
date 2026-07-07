"""Command-line interface: argument parsing, table rendering, exit codes.

Exit codes: 0 success, 1 bad input or missing record, 2 storage failure.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from decimal import Decimal
from typing import List, Optional

from . import __version__
from .models import (
    Expense,
    ValidationError,
    normalize_category,
    parse_amount,
    parse_date,
    parse_month,
)
from .service import ExpenseService, NotFoundError
from .storage import JsonStore, StorageError, default_data_path


def money(amount: Decimal) -> str:
    return f"${amount:,.2f}"


def _render_table(headers: List[str], rows: List[List[str]], right_align: set) -> str:
    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(cell))
    lines = []

    def fmt(cells: List[str]) -> str:
        parts = []
        for i, cell in enumerate(cells):
            parts.append(cell.rjust(widths[i]) if i in right_align else cell.ljust(widths[i]))
        return "  ".join(parts).rstrip()

    lines.append(fmt(headers))
    lines.append(fmt(["-" * w for w in widths]))
    lines.extend(fmt(row) for row in rows)
    return "\n".join(lines)


def _render_expenses(expenses: List[Expense]) -> str:
    rows = [
        [str(e.id), e.spent_on.isoformat(), money(e.amount), e.category, e.description]
        for e in expenses
    ]
    return _render_table(["ID", "DATE", "AMOUNT", "CATEGORY", "DESCRIPTION"], rows, {2})


def cmd_add(service: ExpenseService, args: argparse.Namespace) -> None:
    expense = service.add(
        amount=parse_amount(args.amount),
        category=normalize_category(args.category),
        description=" ".join(args.description).strip(),
        spent_on=parse_date(args.date) if args.date else None,
    )
    print(
        f"Added #{expense.id}: {money(expense.amount)} on {expense.category}"
        + (f" ({expense.description})" if expense.description else "")
        + f", {expense.spent_on.isoformat()}"
    )


def cmd_list(service: ExpenseService, args: argparse.Namespace) -> None:
    category = normalize_category(args.category) if args.category else None
    month = parse_month(args.month) if args.month else None
    if args.limit is not None and args.limit < 1:
        raise ValidationError("--limit must be at least 1")
    expenses = service.list(category=category, month=month, limit=args.limit)
    if not expenses:
        scope = []
        if category:
            scope.append(f"category {category}")
        if month:
            scope.append(f"month {month}")
        suffix = f" for {', '.join(scope)}" if scope else ""
        print(f"No expenses{suffix}. Add one with: expense add 12.50 food lunch")
        return
    print(_render_expenses(expenses))
    total = sum((e.amount for e in expenses), Decimal("0"))
    print(f"\n{len(expenses)} expense(s), total {money(total)}")


def cmd_delete(service: ExpenseService, args: argparse.Namespace) -> None:
    expense = service.delete(args.id)
    print(
        f"Deleted #{expense.id}: {money(expense.amount)} on {expense.category}"
        f", {expense.spent_on.isoformat()}"
    )


def cmd_summary(service: ExpenseService, args: argparse.Namespace) -> None:
    month = parse_month(args.month) if args.month else date.today().strftime("%Y-%m")
    summary = service.monthly_summary(month)
    if summary.count == 0:
        print(f"No expenses recorded for {month}.")
        return
    print(f"Summary for {month}")
    rows = []
    for cat in summary.by_category:
        share = cat.total / summary.total * 100
        rows.append([cat.category, money(cat.total), str(cat.count), f"{share:.1f}%"])
    print(_render_table(["CATEGORY", "TOTAL", "COUNT", "SHARE"], rows, {1, 2, 3}))
    print(f"\nTotal: {money(summary.total)} across {summary.count} expense(s)")


def cmd_categories(service: ExpenseService, args: argparse.Namespace) -> None:
    summaries = service.categories()
    if not summaries:
        print("No categories yet. Add an expense first: expense add 12.50 food lunch")
        return
    rows = [[s.category, money(s.total), str(s.count)] for s in summaries]
    print(_render_table(["CATEGORY", "ALL-TIME TOTAL", "COUNT"], rows, {1, 2}))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="expense",
        description="Track expenses from the terminal. Data lives in a local JSON file.",
        epilog="Data file: %s (override with EXPENSE_TRACKER_FILE)" % default_data_path(),
    )
    parser.add_argument("--version", action="version", version=f"expense {__version__}")
    sub = parser.add_subparsers(dest="command", required=True, metavar="command")

    p_add = sub.add_parser("add", help="record an expense")
    p_add.add_argument("amount", help="amount spent, e.g. 12.50")
    p_add.add_argument("category", help="category slug, e.g. food, rent, car-repair")
    p_add.add_argument("description", nargs="*", help="optional free-text description")
    p_add.add_argument("--date", help="date spent, YYYY-MM-DD (default: today)")
    p_add.set_defaults(func=cmd_add)

    p_list = sub.add_parser("list", help="list expenses, newest first")
    p_list.add_argument("--category", "-c", help="only this category")
    p_list.add_argument("--month", "-m", help="only this month, YYYY-MM")
    p_list.add_argument("--limit", "-n", type=int, help="show at most N expenses")
    p_list.set_defaults(func=cmd_list)

    p_delete = sub.add_parser("delete", help="delete an expense by id")
    p_delete.add_argument("id", type=int, help="expense id (see 'expense list')")
    p_delete.set_defaults(func=cmd_delete)

    p_summary = sub.add_parser("summary", help="monthly totals by category")
    p_summary.add_argument("--month", "-m", help="month to summarize, YYYY-MM (default: current)")
    p_summary.set_defaults(func=cmd_summary)

    p_categories = sub.add_parser("categories", help="all categories with all-time totals")
    p_categories.set_defaults(func=cmd_categories)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    service = ExpenseService(JsonStore(default_data_path()))
    try:
        args.func(service, args)
    except (ValidationError, NotFoundError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    except StorageError as exc:
        print(f"storage error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
