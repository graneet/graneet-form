// oxlint-disable-next-line typescript/no-explicit-any Allow every key
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;
