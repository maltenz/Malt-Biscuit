/**
 * Narrows GraphQL codegen's `T | null` members back to plain optionals, so a
 * type derived from a generated schema reads like the source data it maps to.
 */
export type StripNull<T> = { [K in keyof T]: Exclude<T[K], null> };
