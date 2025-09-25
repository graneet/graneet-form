export type Prettify<T extends Record<string, unknown>> = { [K in keyof T]: T[K] } & {};
