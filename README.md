# NXT Field Ops

NXT Field Ops is a **field operations assistance PWA** built by [NXT](https://nxtgrid.co). It is designed for technicians on the ground — providing the tools needed for meter installation, commissioning, and fault resolution directly from a mobile device.

## Features

- Meter assignment and commissioning workflows
- Calin meter number validation
- Distance-based geo utilities for field navigation
- Offline-capable PWA
- Responsive, mobile-first UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Vue 3](https://vuejs.org/) |
| Build tool | [Vite 6](https://vitejs.dev/) |
| State management | [Pinia](https://pinia.vuejs.org/) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| Styling | [Sass](https://sass-lang.com/) |
| HTTP | [ky](https://github.com/sindresorhus/ky) |
| Geo | [Turf.js](https://turfjs.org/) |
| Backend | [Supabase](https://supabase.com/) |
| Shared UI | [NXT UI Components](https://github.com/nxtgrid/nxt-ui-components) |

## Prerequisites

- [Node.js](https://nodejs.org/) — use the version in `.nvmrc` (managed via [NVM](https://github.com/nvm-sh/nvm))
- A running instance of the NXT backend (or a local Supabase setup)

## Getting Started

### 1. Clone sibling repositories

NXT Field Ops shares UI components and libraries with other NXT front-end apps via [NXT UI Components](https://github.com/nxtgrid/nxt-ui-components). Clone it as a **sibling** of this project:

```sh
git clone https://github.com/nxtgrid/nxt-ui-components.git ../nxt-ui-components
```

### 2. Install dependencies

```sh
nvm use
npm install
```

> The `jsconfig.json` path alias `@nxt/*` already points to `../nxt-ui-components/shared`, so NXT UI Components is available automatically in local development without any additional build step.

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```sh
cp .env.example .env
```

See `.env.example` for a description of each variable.

### 4. Start the development server

```sh
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server with hot-reload |
| `npm run build` | Compile and minify for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint all JS and Vue files |
| `npm run lint:fix` | Lint and auto-fix |

## Code Quality

All commits are linted via [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged). If you encounter a "command not found" error on commit, see the [Husky troubleshooting guide](https://typicode.github.io/husky/troubleshooting.html#command-not-found).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Authors & Contributors

**Bobby Bol** ([studio.innua@gmail.com](mailto:studio.innua@gmail.com)) — author & maintainer

See [AUTHORS.md](./AUTHORS.md) for the full list of authors and [CONTRIBUTORS.md](./CONTRIBUTORS.md) for all contributors.

## License

This project is licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/). See [LICENSE](./LICENSE) for the full text.

Repository: [github.com/nxtgrid/nxt-field-ops](https://github.com/nxtgrid/nxt-field-ops)

**Third-party licenses:** Dependencies include [NXT UI Components](https://github.com/nxtgrid/nxt-ui-components) (`nxt-shared`) and its npm tree; those packages have their own terms. See NXT UI Components README, section [Third-party licenses](https://github.com/nxtgrid/nxt-ui-components#third-party-licenses).
