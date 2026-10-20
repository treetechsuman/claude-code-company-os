---
name: publish
description: Publish the project in this folder (a website to the staging or live site, or an app to Fly.io) - checks first, the owner's OK for live, then publish, verify and record it. Use when the owner asks to publish, deploy, go live or put changes on staging.
---

# /publish

Works in any project session (installed for all sessions). **The owner approves anything published.** Typing
`/publish` is the OK for a **staging** site; **live** always needs a clear yes in this conversation after the owner
has seen what will change. A client's live site also needs the client's approval, written in the project record
with its date.

## 1. Find out how this project publishes

Read the **Deploy** section of `docs/project-record.md` and the workflows in `.github/workflows/`.
- **cPanel website** (a workflow uploads through the cPanel API when a branch changes): publishing = pushing that
  branch (`staging` → staging site, `main` → live site).
- **Fly.io app:** publishing = `fly deploy --ha=false` or a deploy workflow on `main`.
- **Prepared but switched off** (files in `deploy/`): this is the first go-live. Stop and follow the runbook in
  `docs/runbooks/`; it has steps only the owner can do.
- **Not deployed:** say so and stop.

If staging and live both exist, ask which one, recommending staging.

## 2. Checks before publishing

- No uncommitted changes (commit them first, describing the work).
- Tests pass if the project has them (`npm test`).
- Show **what will change**: `git log --oneline origin/<branch>..<branch>` in plain words, one line per change.
- Websites: pages open locally with no missing images or broken links; WordPress theme: version raised in
  `style.css`.
- Apps: outside the customers' trading hours (food shops: not during lunch or dinner); if the database changes,
  take a volume snapshot first.
- **Live:** ask the owner to confirm ("Publish these changes to <live address>?" Yes / Not now). For a client,
  check the record shows their approval and its date; if not, stop.

## 3. Publish and check

- cPanel: `git push origin <branch>`. A brand-new branch does not start a workflow that has a `paths` filter: the
  owner starts the first run by hand (repo → Actions → the workflow → Run workflow).
- Fly.io: deploy, then check `/healthz`, the key pages, and that exactly one machine runs (`fly machines list`).
- Wait about a minute, then check the site really changed: fetch the page and look for the new version or text
  (a staging site may answer 401 because of its password: that's fine, check the version in the theme's
  `style.css` URL instead).
- **If the publish failed:** a cPanel connection timeout usually depends on which GitHub runner ran the job (the
  host's firewall blocks some runner addresses): read the run log with `gh run view`, re-run the job, and ask the
  owner only if it fails again.

## 4. Record it

Add a dated line to the log in `docs/project-record.md`: what was published, where, and the version. For a live
publish also update "Current state". Commit. Tell the owner in two lines: where it is and what changed.
