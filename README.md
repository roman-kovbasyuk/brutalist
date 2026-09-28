# Brutalist

React 19 components and blocks in one Brutalist style, accessible in light and dark, with a manifest and MCP server that tell your AI assistant how to use them.

**Docs and live previews:** [brutalistui.com](https://brutalistui.com)

This repository is the published source of the free core, version 0.1.5. It is generated from the private development repository on each release, so please open issues rather than pull requests.

## Install

```sh
npm install brutalist-design-system
```

```tsx
import { AtomsRoot, Button } from 'brutalist-design-system'
import 'brutalist-design-system/styles.css'

export function App() {
  return <AtomsRoot>
    <Button variant="primary">Create project</Button>
  </AtomsRoot>
}
```

Wrap the application in `AtomsRoot` once; pass `theme="dark"` for the dark theme.

## What is inside

- **Basics:** tokens for colour, type, spacing, shape, elevation and motion, plus icons and layout primitives (`src/atomic/atoms`).
- **Components:** controls and patterns, from buttons and fields to menus, tables and charts (`src/atomic/components`).
- **Blocks:** complete tasks composed only from components, such as sign-in, settings, pricing and site headers (`src/atomic/ui-blocks`).
- **Usage guidance:** when to use each component, what to choose instead, and what the application owns (`docs/guides/component-usage.md`).

## For AI assistants

The package ships `ai/manifest.json` and `ai/llms.txt`: every component and block with its purpose, alternatives, props and example source, versioned with the package. The `brutalist-design-system-mcp` server answers from them locally:

```sh
claude mcp add brutalist -- npx -y brutalist-design-system-mcp
```

## Pro

Complete page templates (an admin app, a landing page and a phone app) with a Claude Code skill and Cursor rules are available with [Brutalist Pro](https://brutalistui.com/#pricing).

## Licence

MIT © Crisp Digital Ventures Ltd. See `LICENSE`.
