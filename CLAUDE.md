# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`graneet-form` is a performant, type-safe forms and wizard library for React 19. It is published as a single npm package. The repo is a pnpm monorepo containing:

- `packages/graneet-form` — the published library source
- `apps/docs` — documentation site
- `apps/testing` — testing playground app
- `examples/` — usage examples (`simple-form`, `complex-typescript`)

## Commands

```bash
# Development (all workspaces)
pnpm start:dev

# Build the library (production)
pnpm --filter graneet-form build

# Watch the library (dev mode with sourcemaps, no minification)
pnpm --filter graneet-form dev

# Type-check the library
pnpm --filter graneet-form typecheck

# Lint (oxlint)
pnpm lint
pnpm lint:fix

# Format (oxfmt)
pnpm format
pnpm format:check

# Publish release (builds library then runs changeset publish)
pnpm release
```

## Architecture

### Subscription-based state model (no re-renders by default)

The core insight of this library is that form state lives in **refs**, not React state. The `useForm` hook stores all field values and validation statuses in `formStateRef` (a plain object keyed by field name). Re-renders only happen in components that explicitly opt in via subscribers.

There are two subscriber registries inside `useForm`:

- `formValuesSubscribersRef` — watches field values
- `formErrorsSubscribersRef` — watches validation statuses

Each registry has `global` (watches all fields, debounced via `setTimeout(0)` to batch) and `scoped` (watches specific fields, notified immediately) subscriber sets. Subscribers are React `setState` functions from `useState`, so they trigger re-renders only in the subscribing component.

### Form internals vs. public API

`FormContextApi<T>` (returned by `useForm`, consumed via `FormContext`) has two parts:

- Public: `getFormValues`, `setFormValues`, `resetForm`, `handleSubmit`
- `formInternal` — the full internal API used by `Field`, `Rule`, and hooks inside the library. **Do not use `formInternal` outside the library** — it may break in minor/patch releases.

### Field registration lifecycle

`Field` registers itself in `useEffect` via `form.formInternal.registerField(name, setValue, defaultValue)`, which returns a cleanup function that unregisters on unmount. Only one active `Field` per name is allowed at a time — registering the same name twice throws. The `setValue` passed to `registerField` is the field's own `useState` setter, so the field re-renders when its value changes via the subscriber system.

### Validation

Two approaches can be combined:

1. **`<Rule>` components** — declarative children of `<Field>`. Each `Rule` registers a `validationFn` and `message` into a `RuleContext`. The `Field` reads these via `useRules()` and passes them to `useFieldValidation`, which runs them synchronously (or with debounce if `isDebounced`).

2. **`useValidations` hook** — imperative, used externally. Validation status flows back to the form via `form.formInternal.updateValidationStatus`.

`ValidationState` has three statuses: `'valid'`, `'invalid'`, `'undetermined'`.

### `onUpdateAfterBlur`

Called on the `useForm` options. Triggered only when: the field had focus, passes validation (`status === 'valid'`), then blurs. Receives `(fieldName, value, data, { getFormValues, setFormValues, resetForm })`. Used for async side effects like auto-populating fields from an API call on blur.

### Wizard system

`useWizard(steps, onFinish, onQuit)` manages multi-step navigation. Each step renders a `<Step>` component, which provides `WizardContext`. Inside a step, `useStepForm` replaces `useForm` — it wraps `useForm` and additionally:

- Restores previously saved step values when navigating back (`getValuesOfCurrentStep()`)
- Registers a global validation subscriber that drives the wizard's `isStepReady` gate
- Saves values via `setValuesGetterForCurrentStep(getFormValues)` so `goNext()` can persist them before switching steps

Step-to-step navigation: `goNext()` calls the step's optional `onNext` validator (can be async), then saves the current step's values into `wizardValuesRef`, then switches `currentStep`. `goPrevious()` / `goBackTo()` save first, then switch. `setTimeout(..., 0)` ensures `isStepReady` resets before the next step renders.

### `useFieldsWatch`

Used outside fields to reactively read form values. Accepts a `form` instance and either `undefined` (watch all) or a `string[]` of field names (scoped, more performant). Supports `mode: 'onChange' | 'onBlur'`.

## Tooling

- **Build**: `tsdown` (wraps Rollup), outputs ESM only to `dist/`, generates `.d.mts` types
- **Linting**: `oxlint` with plugins for TypeScript, React, unicorn, import, jsx-a11y. Config in `.oxlintrc.json`
- **Formatting**: `oxfmt`. Config in `.oxfmtrc.json`
- **Versioning**: Changesets (`@changesets/cli`). Base branch is `main`. The `docs`, `testing`, and `examples` packages are ignored from version bumps. Run `pnpm changeset` to create a changeset before merging a PR that changes the library.
