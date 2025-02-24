// biome-ignore lint/suspicious/noExplicitAny: Allow every key
export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
