# Claude Code company OS

How I run a small AI company, PonteWise, with Claude Code: one "main office" session that knows the whole company,
one session per project that knows that project deeply, and configuration that keeps every agent inside its lane.

I don't hand-write the code. I write the specs, plans and CLAUDE.md files; Claude Code implements them; I review the
diff, the tests and the running system before anything ships. This repo is a cleaned sample of the operating layer
around that: no secrets, client details or product code.

Live products built this way: [Front Desk Agent](https://ordering.pontewise.com.au) (AI phone and chat ordering for
takeaways) and [PonteWise Agent](https://agent.pontewise.com.au) (modular AI receptionist).

## What's here

| Path | What it is |
|---|---|
| [`CLAUDE.example.md`](CLAUDE.example.md) | The main office's guide for agents: what to read first, who may touch what, approval rules |
| [`skills/publish/SKILL.md`](skills/publish/SKILL.md) | A skill every session uses to deploy any project (cPanel sites or Fly.io apps) |
| [`tools/folder-locks.mjs`](tools/folder-locks.mjs) | Generates Claude Code permission rules for every project folder from one registry |
| [`projects.example.json`](projects.example.json) | The registry: every folder and its type (company, product, client, experimental, personal) |

## Design choices

**Rules that must hold go in configuration, not prompts.** A prompt can be ignored or forgotten; a permission rule
can't. `folder-locks.mjs` reads the registry and writes `.claude/settings.local.json` in each folder:

- a session opened in a project folder can only read and edit that folder;
- the main office can read and edit every company project, but never a personal one;
- no session can read a `.env` file, so logins and keys never reach an agent.

The permission rules cover Claude's file tools; CLAUDE.md covers shell commands by instruction. That gap is written
down rather than hidden.

**A skill, not a subagent, for deploys.** `/publish` needs the conversation: typing `/publish` approves staging, but
live needs an explicit yes after the owner has seen the change list, and a client site needs the client's recorded
approval. A subagent running on its own couldn't hold that gate.

**One skill for every project.** The skill first discovers how a project deploys (from its record and its
workflows), then runs the same checks, publish, verify and record steps. A first go-live stops and hands over to a
human runbook.

**The record is the hand-over.** Each project keeps `docs/project-record.md`. When the main office changes a
project, it adds a dated line there, and that project's own session reads it at its start.

## What I had to fix

- **About 4 in 9 cPanel publishes failed.** The Actions logs showed the host's firewall blocking some GitHub runner
  addresses. The fix: retries in the workflow, and a failure step in the skill that reads the log and re-runs the
  job instead of guessing.
- **Verification falsely failed on staging.** The password-protected staging site answers 401, so the skill now
  checks the theme version in the stylesheet URL instead.
- **A new branch never triggered its workflow** because of a `paths` filter. The skill now hands that first run to
  a human.
- **The main office started read-only** and couldn't make small fixes while I was away from the computer. The
  registry now gives it edit rights on company projects, still never on personal ones.

Each fix went into the skill or its runbook, so the next run doesn't repeat the mistake.

---

Suman Dahal · Canberra, Australia · [pontewise.com.au](https://pontewise.com.au)
