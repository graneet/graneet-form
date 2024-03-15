# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0-beta.25](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.24...v2.0.0-beta.25) (2024-03-15)

### Features

- update all deps ([#60](https://github.com/graneet/graneet-form/issues/60)) ([3baa748](https://github.com/graneet/graneet-form/commits/3baa748cb7da9edf1b08fd15b2a797fe4ab4e517))

### Bug Fixes

- call wizard onNext with up-to-date values ([#61](https://github.com/graneet/graneet-form/issues/61)) ([bb34c56](https://github.com/graneet/graneet-form/commits/bb34c56a7a75fd1dd8d3870807d20a74cad7a187))

## [2.0.0-beta.24](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.23...v2.0.0-beta.24) (2023-11-13)

### Features

- revert some changes related to build ([9ed2d04](https://github.com/graneet/graneet-form/commits/9ed2d0450c12d1d620533ef8c39e4b0769c4bc89))

## [2.0.0-beta.23](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.22...v2.0.0-beta.23) (2023-11-13)

### ⚠ BREAKING CHANGES

- remove `eraseAll` option of `setFormValues` (#59)

### Features

- improve jsdoc ([#57](https://github.com/graneet/graneet-form/issues/57)) ([9e6acd8](https://github.com/graneet/graneet-form/commits/9e6acd83340880634b5591f6b26363b0cefac472))
- remove `eraseAll` option of `setFormValues` ([#59](https://github.com/graneet/graneet-form/issues/59)) ([5e4f915](https://github.com/graneet/graneet-form/commits/5e4f9150ac98b07c2b813f3afd91391ab0927cbb))
- throw an error if field is not in form ([#58](https://github.com/graneet/graneet-form/issues/58)) ([6c7a668](https://github.com/graneet/graneet-form/commits/6c7a668766c983e095fa3f646a4bb17eeff477d3))
- tweak build to reduce size and add tree shaking ([#56](https://github.com/graneet/graneet-form/issues/56)) ([2ab7af7](https://github.com/graneet/graneet-form/commits/2ab7af7da13a48684e7a2adecfaee13dabae70be))

## [2.0.0-beta.22](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.21...v2.0.0-beta.22) (2023-11-07)

### ⚠ BREAKING CHANGES

- change useValidations hook to have form first (#55)

### Features

- change useValidations hook to have form first ([#55](https://github.com/graneet/graneet-form/issues/55)) ([2f1c53b](https://github.com/graneet/graneet-form/commits/2f1c53b12af1fe226ab6f20ca9fa7fe88c39437f))

## [2.0.0-beta.21](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.20...v2.0.0-beta.21) (2023-11-07)

### ⚠ BREAKING CHANGES

- remove deprecated usages (#54)

### Features

- remove deprecated usages ([#54](https://github.com/graneet/graneet-form/issues/54)) ([2d6d911](https://github.com/graneet/graneet-form/commits/2d6d911d750944daa6280acf859cd2fd3e48b07c))

## [2.0.0-beta.20](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.19...v2.0.0-beta.20) (2023-11-07)

### Bug Fixes

- add missing useHiddenField types ([#53](https://github.com/graneet/graneet-form/issues/53)) ([7cadf80](https://github.com/graneet/graneet-form/commits/7cadf806cbac50caf2ab80b161cf5c642f27ade4))

## [2.0.0-beta.19](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.18...v2.0.0-beta.19) (2023-11-07)

### Features

- add `isValid` to replace `isFormValid` ([#51](https://github.com/graneet/graneet-form/issues/51)) ([c241991](https://github.com/graneet/graneet-form/commits/c241991bbb207c2a5fedc3efcee6e2e5772029d1))
- inverse params of `useOnChangeValues`, `useOnBlurValues` and `useHiddenField` ([#52](https://github.com/graneet/graneet-form/issues/52)) ([a50cfa9](https://github.com/graneet/graneet-form/commits/a50cfa926b2145489a04fcb82537efc2c3c7c0f3))

## [2.0.0-beta.18](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.17...v2.0.0-beta.18) (2023-10-29)

### Bug Fixes

- infer second generic of hidden field ([#50](https://github.com/graneet/graneet-form/issues/50)) ([55924b5](https://github.com/graneet/graneet-form/commits/55924b59f129758c750713c85284ebc482f1c6bb))

## [2.0.0-beta.17](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.16...v2.0.0-beta.17) (2023-10-27)

### Features

- prefix unstable function with "experimental\_" ([#49](https://github.com/graneet/graneet-form/issues/49)) ([a8eb2af](https://github.com/graneet/graneet-form/commits/a8eb2afb2f41442b9f0abfdb472093307c55f44c))
- update `useHiddenField`, `useOnChangeValues` and `useOnBlurValues` to have the form as a required parameters ([#45](https://github.com/graneet/graneet-form/issues/45)) ([a37b383](https://github.com/graneet/graneet-form/commits/a37b383692505382d4248fc1bb763cd96602fe7b))
- update all deps to latest version ([#46](https://github.com/graneet/graneet-form/issues/46)) ([f34a959](https://github.com/graneet/graneet-form/commits/f34a9593a690088559dfb45cdb08f4b66327eda3))

### Bug Fixes

- generics of Step ([#47](https://github.com/graneet/graneet-form/issues/47)) ([f04d1d7](https://github.com/graneet/graneet-form/commits/f04d1d7cb392274f42e2c9b2fc7bbd7668d136a4))
- use Prettify type on onchange hooks ([#48](https://github.com/graneet/graneet-form/issues/48)) ([71ed0e8](https://github.com/graneet/graneet-form/commits/71ed0e80022e62a094ef4bea9172927b0e69ff99))

## [2.0.0-beta.16](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.15...v2.0.0-beta.16) (2023-07-27)

### Features

- add `handleGoBackTo` to wizard ([#44](https://github.com/graneet/graneet-form/issues/44)) ([83d81ef](https://github.com/graneet/graneet-form/commits/83d81effbba7e9163e4b016ba820ffea9f22f270))
- **deps:** update all deps ([#42](https://github.com/graneet/graneet-form/issues/42)) ([e667dd4](https://github.com/graneet/graneet-form/commits/e667dd43e4565d75f7e72a68d0518044ac50070c))
- **deps:** upgrade pnpm version in CI ([#43](https://github.com/graneet/graneet-form/issues/43)) ([752245f](https://github.com/graneet/graneet-form/commits/752245f6af32d322882e64a85b64740ce789ec59))

## [2.0.0-beta.15](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.14...v2.0.0-beta.15) (2023-04-03)

### Features

- **deps:** update all deps ([#41](https://github.com/graneet/graneet-form/issues/41)) ([5998df0](https://github.com/graneet/graneet-form/commits/5998df0fcbf63d0e17cb4c7e44a2c62231a91bcc))

### Bug Fixes

- use a Set instead of value to store focused field name to handle event race condition ([#40](https://github.com/graneet/graneet-form/issues/40)) ([c0fbe6d](https://github.com/graneet/graneet-form/commits/c0fbe6d8e7eb40ab20602d0fe061dd5d3a62680d))

## [2.0.0-beta.14](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.13...v2.0.0-beta.14) (2023-03-25)

### Features

- **deps:** bump all dependencies ([#38](https://github.com/graneet/graneet-form/issues/38)) ([588e98d](https://github.com/graneet/graneet-form/commits/588e98dd8fce38cbf8f5cec7cdc2218c6196710c))
- export `FormContextApi` and `UseFormOptions` types ([#39](https://github.com/graneet/graneet-form/issues/39)) ([5240ec0](https://github.com/graneet/graneet-form/commits/5240ec092fe6dc3edd67979e6896595522efe2c4))
- return by default record of unknown to ensure user use generics ([#36](https://github.com/graneet/graneet-form/issues/36)) ([07dbca9](https://github.com/graneet/graneet-form/commits/07dbca9ce005b10f772162fa35abdb399bcd1d5a))
- upgrade all deps ([#35](https://github.com/graneet/graneet-form/issues/35)) ([bb5750c](https://github.com/graneet/graneet-form/commits/bb5750cb71beda22d1c03bfbb864dbce0a365a2d))

## [2.0.0-beta.13](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.12...v2.0.0-beta.13) (2022-12-29)

### Features

- upgrade all deps ([#34](https://github.com/graneet/graneet-form/issues/34)) ([7dd625e](https://github.com/graneet/graneet-form/commits/7dd625e3af29f0bd6f45b5ae642daa060a046003))

## [2.0.0-beta.12](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.6...v2.0.0-beta.12) (2022-09-30)

### Bug Fixes

- remove promise management and types in composeEventHandlers ([#33](https://github.com/graneet/graneet-form/issues/33)) ([4b914bb](https://github.com/graneet/graneet-form/commits/4b914bb79200ad46ff9930cce46627f79bedb7ef))

## [2.0.0-beta.11](https://github.com/graneet/graneet-form/compare/v2.0.0-beta.6...v2.0.0-beta.11) (2022-09-28)

### Features

- create `addGlobalValidationStatusSubscriber` and `removeGlobalValidationStatusSubscriber` ([#29](https://github.com/graneet/graneet-form/issues/29)) ([d06c068](https://github.com/graneet/graneet-form/commits/d06c0686db57f1468d211add96b2bd194805e03a))
- simplify generics used in Wizard types ([#26](https://github.com/graneet/graneet-form/issues/26)) ([0868165](https://github.com/graneet/graneet-form/commits/0868165b9b6b010e9d9008fed46c7bf966d3bae4))

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
