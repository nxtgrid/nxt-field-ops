# Contributing to NXT Field Ops

Thank you for your interest in contributing to NXT Field Ops. This document explains how to get your development environment set up and the conventions we follow.

## Prerequisites

- [Node.js](https://nodejs.org/) via [NVM](https://github.com/nvm-sh/nvm) — run `nvm use` to activate the correct version
- [NXT UI Components](https://github.com/nxtgrid/nxt-ui-components) cloned as a sibling of this project (`../nxt-ui-components`)
- A running instance of the NXT backend or local Supabase for testing field workflows

## Setting Up

```sh
git clone https://github.com/nxtgrid/nxt-field-ops.git
git clone https://github.com/nxtgrid/nxt-ui-components.git ../nxt-ui-components
cd nxt-field-ops
nvm use
npm install
cp .env.example .env   # then fill in your values
npm run dev
```

## Development Workflow

1. **Fork** the repository and create your branch from `main`.
2. **Name your branch** using the following convention:
   - `feat/short-description` — new feature
   - `fix/short-description` — bug fix
   - `chore/short-description` — tooling, dependencies, refactoring
   - `docs/short-description` — documentation only
3. **Make your changes** and ensure the linter passes (`npm run lint`).
4. **Test on a mobile viewport** — NXT Field Ops is a mobile-first PWA and changes should be verified at small screen sizes.
5. **Open a pull request** against `main` with a clear description of what changed and why.

## Code Style

This project uses [ESLint](https://eslint.org/) with the `nxt-shared` config. All staged files are linted automatically on every commit via [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged).

- Run `npm run lint` to check for issues.
- Run `npm run lint:fix` to auto-fix where possible.
- The linter is configured with `--max-warnings=0` — no warnings are allowed in a commit.

## Commit Messages

Use clear, imperative present-tense messages:

```
feat: add pole assignment step to commissioning flow
fix: correct distance calculation for nearby meter check
chore: upgrade @turf/distance
docs: add mobile testing note to CONTRIBUTING
```

## Reporting Issues

Please open an issue and include:
- A clear description of the problem or suggestion
- Steps to reproduce (for bugs)
- Expected vs. actual behaviour
- Your Node.js version and operating system

## Questions

For questions about the project, reach out to [studio.innua@gmail.com](mailto:studio.innua@gmail.com).
