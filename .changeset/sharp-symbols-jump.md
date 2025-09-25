---
"graneet-form": major
---

**Breaking Change**: Replace enums with union types for better type safety

- Replaced `WATCH_MODE` enum with `WatchMode` union type (`'onChange' | 'onBlur'`)
- Replaced `VALIDATION_OUTCOME` enum with `ValidationOutcome` union type (`'valid' | 'invalid' | 'undetermined'`)
- Updated all imports and usages throughout the codebase to use the new union types
- Enforced stricter TypeScript checks with `exactOptionalPropertyTypes: true`

This change improves type safety and follows modern TypeScript best practices by using literal union types instead of enums.
