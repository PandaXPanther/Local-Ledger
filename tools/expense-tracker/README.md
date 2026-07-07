# expense

A dependency-free expense tracking CLI. Python 3.9+ standard library only.

## Install

```sh
ln -s /root/projects/localledger/tools/expense-tracker/bin/expense ~/.local/bin/expense
```

Or run in place: `./bin/expense --help`

## Usage

```sh
expense add 12.50 food lunch downtown        # record an expense (date defaults to today)
expense add 800 rent --date 2026-07-01       # backdate an entry
expense list                                 # newest first
expense list --category food --month 2026-07 # filter by category and month
expense list -n 5                            # last 5 entries
expense summary                              # current month, totals by category
expense summary --month 2026-06              # any month
expense categories                           # all-time totals per category
expense delete 3                             # delete by id (ids shown in list)
```

## Data

Expenses live in `~/.local/share/expense-tracker/expenses.json` (respects
`XDG_DATA_HOME`; override the exact path with `EXPENSE_TRACKER_FILE`). Writes
are atomic: a temp file is written and renamed, so a crash never truncates
your data. Amounts are stored as decimal strings, never floats.

## Design

- `models.py` — domain types and input validation, no I/O
- `storage.py` — JSON persistence with a versioned schema
- `service.py` — add/list/delete/summarize, no terminal knowledge
- `cli.py` — argparse wiring and table rendering

Exit codes: `0` success, `1` bad input or unknown id, `2` storage failure.

## Tests

```sh
cd tools/expense-tracker && python3 -m unittest discover -s tests -v
```
