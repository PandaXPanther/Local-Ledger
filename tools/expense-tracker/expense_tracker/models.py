"""Domain model. No I/O here."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

CENTS = Decimal("0.01")
_CATEGORY_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")


class ValidationError(ValueError):
    """Raised when user-supplied input cannot form a valid Expense."""


def parse_amount(raw: str) -> Decimal:
    """Parse a money amount. Accepts '12', '12.5', '$12.50'. Rejects <= 0."""
    cleaned = raw.strip().lstrip("$").replace(",", "")
    try:
        amount = Decimal(cleaned)
    except InvalidOperation:
        raise ValidationError(f"invalid amount {raw!r}: expected a number like 12.50")
    if not amount.is_finite():
        # 'nan' and 'inf' parse as valid Decimals but would blow up on compare/quantize
        raise ValidationError(f"invalid amount {raw!r}: expected a number like 12.50")
    if amount <= 0:
        raise ValidationError(f"invalid amount {raw!r}: must be greater than zero")
    if amount != amount.quantize(CENTS):
        raise ValidationError(f"invalid amount {raw!r}: at most two decimal places")
    return amount.quantize(CENTS)


def normalize_category(raw: str) -> str:
    """Categories are lowercase slugs so 'Food' and 'food' never diverge."""
    category = raw.strip().lower().replace(" ", "-")
    if not _CATEGORY_RE.match(category):
        raise ValidationError(
            f"invalid category {raw!r}: use letters, digits, dashes (e.g. food, car-repair)"
        )
    return category


def parse_date(raw: str) -> date:
    try:
        return datetime.strptime(raw.strip(), "%Y-%m-%d").date()
    except ValueError:
        raise ValidationError(f"invalid date {raw!r}: expected YYYY-MM-DD")


def parse_month(raw: str) -> str:
    """Validate and return a YYYY-MM month key."""
    try:
        return datetime.strptime(raw.strip(), "%Y-%m").strftime("%Y-%m")
    except ValueError:
        raise ValidationError(f"invalid month {raw!r}: expected YYYY-MM")


@dataclass(frozen=True)
class Expense:
    id: int
    amount: Decimal  # always quantized to cents, always > 0
    category: str  # normalized slug
    description: str
    spent_on: date

    @property
    def month(self) -> str:
        return self.spent_on.strftime("%Y-%m")

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "amount": str(self.amount),  # string, never float: exact cents
            "category": self.category,
            "description": self.description,
            "spent_on": self.spent_on.isoformat(),
        }

    @classmethod
    def from_json(cls, data: dict) -> "Expense":
        try:
            return cls(
                id=int(data["id"]),
                amount=Decimal(data["amount"]).quantize(CENTS),
                category=str(data["category"]),
                description=str(data["description"]),
                spent_on=date.fromisoformat(data["spent_on"]),
            )
        except (KeyError, ValueError, TypeError, InvalidOperation) as exc:
            raise ValidationError(f"malformed expense record {data!r}: {exc}")
