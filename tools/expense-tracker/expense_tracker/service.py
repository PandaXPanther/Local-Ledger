"""Business logic. Talks to storage, knows nothing about the terminal."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Dict, List, Optional

from .models import Expense
from .storage import ExpenseData, JsonStore


class NotFoundError(Exception):
    """Raised when an expense id does not exist."""


@dataclass(frozen=True)
class CategorySummary:
    category: str
    total: Decimal
    count: int


@dataclass(frozen=True)
class MonthlySummary:
    month: str
    total: Decimal
    count: int
    by_category: List[CategorySummary]  # sorted by total, descending


class ExpenseService:
    def __init__(self, store: JsonStore):
        self.store = store

    def add(
        self,
        amount: Decimal,
        category: str,
        description: str,
        spent_on: Optional[date] = None,
    ) -> Expense:
        data = self.store.load_data()
        expenses = data.expenses
        expense = Expense(
            id=data.next_id,
            amount=amount,
            category=category,
            description=description.strip(),
            spent_on=spent_on or date.today(),
        )
        expenses.append(expense)
        self.store.save_data(ExpenseData(expenses=expenses, next_id=expense.id + 1))
        return expense

    def list(
        self,
        category: Optional[str] = None,
        month: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> List[Expense]:
        expenses = self.store.load()
        if category is not None:
            expenses = [e for e in expenses if e.category == category]
        if month is not None:
            expenses = [e for e in expenses if e.month == month]
        # Newest first, id breaks ties for same-day entries.
        expenses.sort(key=lambda e: (e.spent_on, e.id), reverse=True)
        if limit is not None:
            expenses = expenses[:limit]
        return expenses

    def delete(self, expense_id: int) -> Expense:
        data = self.store.load_data()
        expenses = data.expenses
        for expense in expenses:
            if expense.id == expense_id:
                expenses.remove(expense)
                self.store.save_data(ExpenseData(expenses=expenses, next_id=data.next_id))
                return expense
        raise NotFoundError(f"no expense with id {expense_id}")

    def categories(self) -> List[CategorySummary]:
        return _group_by_category(self.store.load())

    def monthly_summary(self, month: str) -> MonthlySummary:
        matching = [e for e in self.store.load() if e.month == month]
        by_category = _group_by_category(matching)
        total = sum((e.amount for e in matching), Decimal("0"))
        return MonthlySummary(
            month=month, total=total, count=len(matching), by_category=by_category
        )


def _group_by_category(expenses: List[Expense]) -> List[CategorySummary]:
    totals: Dict[str, Decimal] = {}
    counts: Dict[str, int] = {}
    for e in expenses:
        totals[e.category] = totals.get(e.category, Decimal("0")) + e.amount
        counts[e.category] = counts.get(e.category, 0) + 1
    summaries = [
        CategorySummary(category=c, total=totals[c], count=counts[c]) for c in totals
    ]
    summaries.sort(key=lambda s: (-s.total, s.category))
    return summaries
