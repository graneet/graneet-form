# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0-beta.9](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.6...v2.0.0-beta.9) (2022-09-18)

### Bug Fixes

- regression where new global subscriber do not have their initial value given ([#25](https://github.com/graneet/graneet-form/issues/25)) ([7d9de7d](https://github.com/graneet/graneet-form/commits/7d9de7dbc4a43f522efbb6e9ba42cac9c63eacbc))

## [2.0.0-beta.8](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.6...v2.0.0-beta.8) (2022-09-18)

### Bug Fixes

- wizard with form were stuck in loading state ([#24](https://github.com/graneet/graneet-form/issues/24)) ([b732f59](https://github.com/graneet/graneet-form/commits/b732f59556b3192e011ca0ab18b7b08074e91d7d))

## [2.0.0-beta.7](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.6...v2.0.0-beta.7) (2022-09-11)

### Features

- exposes `UseHiddenField` ([2398bb2](https://github.com/graneet/graneet-form/commits/2398bb23b24585c84e61ca67331c9bc4ad2adce2))

## [2.0.0-beta.6](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.2...v2.0.0-beta.6) (2022-09-11)

### Features

- exposes `FieldRenderProps`, `FieldRenderState` ([28d0d17](https://github.com/graneet/graneet-form/commits/28d0d17f161b949d0a53db9297e598ceb6ba9e72))

## [2.0.0-beta.5](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.2...v2.0.0-beta.5) (2022-09-09)

### Bug Fixes

- `useStepForm` type can be undefined like intended ([25032a4](https://github.com/graneet/graneet-form/commits/25032a4ca829a437d73072882996c4ed4692cb98))
- fix FormProps type by omitting `onSubmit` ([52af382](https://github.com/graneet/graneet-form/commits/52af38252243a1685f23784c1a5937338924a1d2))

## [2.0.0-beta.4](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.2...v2.0.0-beta.4) (2022-09-04)

### Features

- exposes `StepValidator` ([9a8baed](https://github.com/graneet/graneet-form/commits/9a8baedf6c1483af6e49c76353908b633ec90850))

### Bug Fixes

- `Step` return now a ReactElement ([96f4446](https://github.com/graneet/graneet-form/commits/96f4446a0b11c850132e8a918ec900058faab7a5))

## [2.0.0-beta.3](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2022-09-04)

### ⚠ BREAKING CHANGES

- move internal logic of `useWizard` inside `wizardInternal` ([#23](https://github.com/graneet/graneet-form/issues/23)) ([3a30a45](https://github.com/graneet/graneet-form/commits/3a30a456557cfaecf399716deb3a02e0731aee86))

Before:

```tsx
const CONTEXT_WIZARD_DEFAULT = {
  steps: [],
  currentStep: undefined,
  registerStep: () => {},
  unregisterStep: () => {},
  handleOnNext: async () => {},
  handleOnPrevious: () => {},
  updatePlaceholderContent: () => {},
  resetPlaceholderContent: () => {},
  registerPlaceholder: () => {},
  unregisterPlaceholder: () => {},
  isLastStep: false,
  isFirstStep: false,
  hasNoFooter: true,
  stepStatusSetter: () => {},
  isStepReady: false,
  stepsTitles: [],
  setIsStepReady: () => {},
  setValuesGetterForCurrentStep: () => {},
  getValuesOfCurrentStep: () => undefined,
  getValuesOfStep: () => undefined,
  getValuesOfSteps: () => ({}),
};
```

After:

```tsx
const CONTEXT_WIZARD_DEFAULT = {
  wizardInternal: {
    updatePlaceholderContent: () => {},
    resetPlaceholderContent: () => {},
    registerStep: () => {},
    unregisterStep: () => {},
    registerPlaceholder: () => {},
    unregisterPlaceholder: () => {},
    stepStatusSetter: () => {},
    setIsStepReady: () => {},
    setValuesGetterForCurrentStep: () => {},
  },
  steps: [],
  currentStep: undefined,
  handleOnNext: async () => {},
  handleOnPrevious: () => {},
  isLastStep: false,
  isFirstStep: false,
  hasNoFooter: true,
  isStepReady: false,
  stepsTitles: [],
  getValuesOfCurrentStep: () => undefined,
  getValuesOfStep: () => undefined,
  getValuesOfSteps: () => ({}),
};
```

## [2.0.0-beta.2](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2022-09-01)

### Bug Fixes

- change `originalEventHandler`of `composeEventHandlers` to allow `undefined` ([787d811](https://github.com/graneet/graneet-form/commits/787d811de579ae7f7700eab91e004df37ae12a99))

## [2.0.0-beta.1](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2022-09-01)

### Bug Fixes

- `composeEventHandlers` type ([fb216e3](https://github.com/graneet/graneet-form/commits/fb216e3015a3eed90fc0dd606989b236f0c32550))
- expose `AnyRecord` ([c74e196](https://github.com/graneet/graneet-form/commits/c74e1965808cac53d2bf6ecaede6b4b93b8a4098))

## [2.0.0-beta.0](https://github.com/graneet/graneet-form/compare/v1.3.0...v2.0.0-beta.0) (2022-08-30)

### ⚠ BREAKING CHANGES

- Refactoring all types to have a greater Typescript experience

```tsx
type IMyForm = {
  firstName: string;

  lastName: string;
};

const MyComponent = () => {
  const form = useForm<IMyForm>();

  const handleSomething = () => {
    const values = form.getFormValues();

    /*
Here `values` will have the following type
{
firstName: string | undefined | null,
lastName: string  | undefined | null,
}
*/
  };

  const setSomething = () => {
    form.setFormValues({
      firstName: 'Jean',
      lastName: 'Bonbeurre',
    }); // valid

    form.setFormValues({
      firstName: 42,
      lastName: 'Bonbeurre',
    }); // invalid
  };
};
```

## [1.3.0](https://github.com/graneet/graneet-form/compare/v1.2.1...v1.3.0) (2022-08-10)

### Features

- add `handleSubmit` to pass function ran on form submission ([f4deb0d](https://github.com/graneet/graneet-form/commits/f4deb0dace2cdc546918fa7493dd0daea0fd7f9b))
- expose `FieldValues` ([1d07548](https://github.com/graneet/graneet-form/commits/1d075486202ba14e4aef18d9370a018e6d42aa03))
- implements `form` in `Form` and use `onSubmit` ([bbaf8e6](https://github.com/graneet/graneet-form/commits/bbaf8e6f85ebf1f26a30e8c5ae682f2e12c0e132))

### Bug Fixes

- remove children from Rule props, it's fix the return of the Rule that as to be a `React.Element` ([8457a3a](https://github.com/graneet/graneet-form/commits/8457a3a970e57730b2e73e8fc206e0b29b7f7677))

## [1.2.1](https://github.com/graneet/graneet-form/compare/v1.0.0...v1.2.1) (2022-07-05)

### Bug Fixes

- on error subscriber emitting, emit a new ref in the publisher ([94f869c](https://github.com/graneet/graneet-form/commits/94f869c8c4273ea398fe1d547d50e75250469308))

## [1.2.0](https://github.com/graneet/graneet-form/compare/v1.0.0...v1.2.0) (2022-06-23)

### Features

- expose `mapValidationStatusesToOutcome` ([013a9ef](https://github.com/graneet/graneet-form/commits/013a9ef1f69b882f7726293f7e72b37127ec708b))

## [1.1.0](https://github.com/graneet/graneet-form/compare/v1.0.0...v1.1.0) (2022-05-03)

### Features

- add `File` to `FieldValue` ([6576a3e](https://github.com/graneet/graneet-form/commits/6576a3e324bfc1f5ab6cadb87085c0882589d3de))
- add react 18 compatibility ([40b8330](https://github.com/graneet/graneet-form/commits/40b8330e997068d22695217732519133f187355b))

### [1.0.1](https://github.com/graneet/graneet-form/compare/v1.0.0...v1.0.1) (2022-03-27)

### Bug Fixes

- expose `WATCH_MODE` enum ([2d3e34b](https://github.com/graneet/graneet-form/commits/2d3e34b21df22cee7f11abb1ebc4588ceeaa46d0))
