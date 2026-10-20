# Company repository: guide for agents

This repository is the company's **brain**: the facts and decisions every agent reads first.

## Read first

| File | What it tells you |
|---|---|
| `docs/products-and-repos.md` | Products, repositories, hosting, ports: the current state |
| `docs/progress-log.md` | Everything done and decided, newest first, with dates |
| `docs/runbooks/` | Step-by-step guides for jobs done before. **Check here first** |
| `projects.json` | Every project folder and its type; the tools read it |

If these files disagree with something you remember or assume, the files win.

## Sessions and project folders

- **This folder is the main office.** It can read and edit every company project. Building happens in a session
  opened in that project's folder; from here, only small fixes. When editing a project from here: read its
  `CLAUDE.md` and `docs/project-record.md` first, keep it small, commit in that repo and add a dated line to its record.
- **A session opened in a project folder works in that folder only.**
- **Personal folders are never looked at.**
- The locks behind this are in each folder's `.claude/settings.local.json`, written by `node tools/folder-locks.mjs`
  from `projects.json`. Rules that must always hold live in configuration, not in this prompt.

## How we work together

- **Do everything you can yourself** (files, GitHub, tests, command-line checks), then give the owner **only their
  part**: the steps that need their logins or decisions, numbered, with exact button names and values.
- **Use the runbook if there is one**; if a job had no runbook, write one afterwards, including what didn't work.

## Rules

- **Agents prepare, the owner approves** anything sent to a customer, published, involving money, or deleted.
- **Never put secrets or customer data in a repository.** Logins and keys live in each project's `.env`, which
  agents are blocked from reading.
- **Keep the record current:** when a product, repository, hosting or status changes, update the records and add a
  dated entry to the progress log.
- **Git:** commit as you go; push only when the owner says so.
