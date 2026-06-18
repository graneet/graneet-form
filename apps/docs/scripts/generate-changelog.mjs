// Generates content/docs/changelog.mdx from the published package CHANGELOG.md
// (maintained by Changesets). This keeps the docs changelog always in sync with
// the source of truth. Wired into the pre-dev / pre-build / postinstall steps.
//
// Run manually with: pnpm changelog
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, '../../../packages/graneet-form/CHANGELOG.md');
const TARGET = resolve(here, '../content/docs/changelog.mdx');

/**
 * Escape characters that MDX would otherwise treat as JSX (`<`, `{`, `}`),
 * but only in prose — fenced code blocks and inline code spans are left intact.
 */
function escapeForMdx(markdown) {
  let inFence = false;

  return markdown
    .split('\n')
    .map((line) => {
      if (line.trim().startsWith('```')) {
        inFence = !inFence;
        return line;
      }
      if (inFence) {
        return line;
      }

      // Split on backticks: even segments are prose, odd segments are inline code.
      return line
        .split('`')
        .map((segment, index) =>
          index % 2 === 0
            ? segment.replaceAll('<', '&lt;').replaceAll('{', '&#123;').replaceAll('}', '&#125;')
            : segment,
        )
        .join('`');
    })
    .join('\n');
}

const raw = readFileSync(SOURCE, 'utf8');

// Drop the leading "# graneet-form" title — the frontmatter title becomes the page H1.
const body = raw.replace(/^#\s+graneet-form\s*\n+/, '');

const page = `---
title: Changelog
description: Release history for graneet-form, generated from the package CHANGELOG.
---

{/* This file is auto-generated from packages/graneet-form/CHANGELOG.md — do not edit by hand. */}

Release history for \`graneet-form\`. Versions follow [semantic versioning](https://semver.org/) and are managed with [Changesets](https://github.com/changesets/changesets).

${escapeForMdx(body).trim()}
`;

writeFileSync(TARGET, page, 'utf8');
console.log(`[changelog] wrote ${TARGET}`);
