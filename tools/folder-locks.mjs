#!/usr/bin/env node
// Writes the folder lock into each project's .claude/settings.local.json, from projects.json.
//
// The rules:
//   - a session opened in a project folder works in that folder only;
//   - the company ("main office") session can read and edit every company project, for small fixes when the owner
//     is away from the computer (it was read-only at first);
//   - nobody touches a personal folder (its own settings are left alone too);
//   - nobody reads a .env file (logins and keys).
//
// Only rules under the registry's root are replaced; anything else in a settings file (e.g. allowed commands) is kept.
// settings.local.json is ignored by git on this computer, so the locks never show up as changes in a repository.
// The lock covers Claude's file tools (Read, Edit, Write, search); CLAUDE.md in each folder covers shell commands.
//
//   node tools/folder-locks.mjs           write the locks
//   node tools/folder-locks.mjs --check   show what would be written, change nothing

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPANY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(fs.readFileSync(path.join(COMPANY, 'projects.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');

// D:/ai-projects → //d/ai-projects (Claude Code's form for an absolute Windows path)
const root = '//' + path.resolve(registry.root).replace(/\\/g, '/').replace(/^([A-Za-z]):/, (m, d) => d.toLowerCase());
const isOurs = (rule) => rule.includes(`(${root}/`);
const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.development'];
const envDeny = (base) => ENV_FILES.map((f) => `Read(${base}/**/${f})`);
const whole = (folder) => `${root}/${folder}/**`;

function rulesFor(project) {
  const others = registry.projects.filter((p) => p.folder !== project.folder);
  if (project.type === 'company') {
    return {
      allow: others.filter((p) => p.type !== 'personal').flatMap((p) => [`Read(${whole(p.folder)})`, `Edit(${whole(p.folder)})`]),
      deny: [
        ...others.filter((p) => p.type === 'personal').flatMap((p) => [`Read(${whole(p.folder)})`, `Edit(${whole(p.folder)})`]),
        ...envDeny(root),
      ],
    };
  }
  return {
    allow: [],
    deny: [
      ...others.flatMap((p) => [`Read(${whole(p.folder)})`, `Edit(${whole(p.folder)})`]),
      ...envDeny(`${root}/${project.folder}`),
    ],
  };
}

for (const project of registry.projects) {
  if (project.type === 'personal') continue;
  const dir = path.join(registry.root, project.folder);
  if (!fs.existsSync(dir)) {
    console.log(`skip ${project.folder}: folder not found`);
    continue;
  }
  const file = path.join(dir, '.claude', 'settings.local.json');
  const settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const permissions = settings.permissions || {};
  const { allow, deny } = rulesFor(project);
  permissions.allow = [...(permissions.allow || []).filter((r) => !isOurs(r)), ...allow];
  permissions.deny = [...(permissions.deny || []).filter((r) => !isOurs(r)), ...deny];
  if (!permissions.allow.length) delete permissions.allow;
  settings.permissions = permissions;

  if (checkOnly) {
    console.log(`\n${project.folder} (${project.type}):`, JSON.stringify(settings.permissions, null, 2));
    continue;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
  console.log(`locked ${project.folder} (${project.type}): ${deny.length} blocked, ${allow.length} allowed`);
}
