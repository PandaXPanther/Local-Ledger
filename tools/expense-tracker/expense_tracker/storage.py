"""JSON persistence. Atomic writes, versioned schema, clear failure modes."""

from __future__ import annotations

import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import List

from .models import Expense, ValidationError

SCHEMA_VERSION = 1


class StorageError(Exception):
    """Raised when the data file cannot be read or written."""


@dataclass(frozen=True)
class ExpenseData:
    expenses: List[Expense]
    next_id: int


def default_data_path() -> Path:
    """$EXPENSE_TRACKER_FILE wins; otherwise XDG data dir."""
    override = os.environ.get("EXPENSE_TRACKER_FILE")
    if override:
        return Path(override).expanduser()
    xdg = os.environ.get("XDG_DATA_HOME", "~/.local/share")
    return Path(xdg).expanduser() / "expense-tracker" / "expenses.json"


class JsonStore:
    def __init__(self, path: Path):
        self.path = path

    def load(self) -> List[Expense]:
        return self.load_data().expenses

    def load_data(self) -> ExpenseData:
        if not self.path.exists():
            return ExpenseData(expenses=[], next_id=1)
        try:
            raw = self.path.read_text(encoding="utf-8")
        except OSError as exc:
            raise StorageError(f"cannot read {self.path}: {exc}")
        if not raw.strip():
            return ExpenseData(expenses=[], next_id=1)
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise StorageError(
                f"{self.path} is not valid JSON ({exc}). "
                f"Fix or move the file aside to start fresh."
            )
        if not isinstance(payload, dict) or "expenses" not in payload:
            raise StorageError(f"{self.path} has an unexpected shape: missing 'expenses' key")
        version = payload.get("version")
        if version != SCHEMA_VERSION:
            raise StorageError(
                f"{self.path} uses schema version {version!r}; this build reads version {SCHEMA_VERSION}"
            )
        try:
            expenses = [Expense.from_json(item) for item in payload["expenses"]]
            next_id = int(payload.get("next_id", max((e.id for e in expenses), default=0) + 1))
        except ValidationError as exc:
            raise StorageError(f"{self.path} contains bad data: {exc}")
        except (ValueError, TypeError) as exc:
            raise StorageError(f"{self.path} contains bad next_id: {exc}")
        if next_id < 1:
            raise StorageError(f"{self.path} contains bad next_id: must be at least 1")
        return ExpenseData(
            expenses=expenses,
            next_id=max(next_id, max((e.id for e in expenses), default=0) + 1),
        )

    def save(self, expenses: List[Expense]) -> None:
        self.save_data(ExpenseData(expenses=expenses, next_id=max((e.id for e in expenses), default=0) + 1))

    def save_data(self, data: ExpenseData) -> None:
        payload = {
            "version": SCHEMA_VERSION,
            "next_id": data.next_id,
            "expenses": [e.to_json() for e in sorted(data.expenses, key=lambda e: e.id)],
        }
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            # Write to a sibling temp file, then rename: a crash mid-write
            # can never leave a truncated data file behind.
            fd, tmp_name = tempfile.mkstemp(
                dir=self.path.parent, prefix=".expenses-", suffix=".tmp"
            )
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as handle:
                    json.dump(payload, handle, indent=2)
                    handle.write("\n")
                os.replace(tmp_name, self.path)
            except BaseException:
                os.unlink(tmp_name)
                raise
        except OSError as exc:
            raise StorageError(f"cannot write {self.path}: {exc}")
