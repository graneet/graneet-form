/**
 * Path utilities for nested object field names (e.g. `"user.address.city"`).
 *
 * The form stores field state FLAT, keyed by the full dotted path string. These helpers
 * translate between that flat representation and the nested objects exposed to consumers.
 *
 * Scope: objects only. Numeric segments are treated as plain object keys, NOT array indices.
 * @internal
 */

const parsedPathCache = new Map<string, string[]>();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Split a dotted path into its segments. Memoized because it runs on the subscriber hot path.
 * @example parsePath('user.address.city') // ['user', 'address', 'city']
 */
export function parsePath(path: string): string[] {
  const cached = parsedPathCache.get(path);
  if (cached) {
    return cached;
  }
  const segments = path.split('.');
  parsedPathCache.set(path, segments);
  return segments;
}

/**
 * Read the value at `path` in `obj`. Returns `undefined` if any intermediate node is missing
 * or is not an object.
 */
export function getAtPath(obj: unknown, path: string): unknown {
  // Empty path refers to the object itself (used when a watched path equals the stored key).
  if (path === '') {
    return obj;
  }
  let cursor: unknown = obj;
  for (const segment of parsePath(path)) {
    if (cursor === null || typeof cursor !== 'object') {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

/**
 * Immutably set `value` at `path` in `obj`. Only the spine from the root to the leaf is cloned;
 * sibling subtrees keep their references (preserving referential equality for unchanged branches).
 */
export function setAtPath<O>(obj: O, path: string, value: unknown): O {
  const segments = parsePath(path);
  const root: Record<string, unknown> =
    obj !== null && typeof obj === 'object' ? { ...(obj as Record<string, unknown>) } : {};

  let cursor = root;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]!;
    const child = cursor[segment];
    cursor[segment] = isPlainObject(child) ? { ...child } : {};
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[segments.at(-1)!] = value;

  return root as O;
}

/**
 * Whether two paths are in an ancestor/descendant/equal relationship, compared **segment by
 * segment** (never via raw string prefix, so `"user"` and `"username"` are NOT related).
 */
export function isPathRelated(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }
  const segmentsA = parsePath(a);
  const segmentsB = parsePath(b);
  const shared = Math.min(segmentsA.length, segmentsB.length);
  for (let i = 0; i < shared; i += 1) {
    if (segmentsA[i] !== segmentsB[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Flatten a nested object into `{ [leafPath]: value }`. Recursion stops on anything that is not a
 * plain object (arrays, `Date`, class instances, `null` are treated as leaf values).
 * @example flattenToPaths({ user: { address: { city: 'Paris' } } }) // { 'user.address.city': 'Paris' }
 */
export function flattenToPaths(nested: Record<string, unknown>): Record<string, unknown> {
  const acc: Record<string, unknown> = {};

  const walk = (node: Record<string, unknown>, prefix: string): void => {
    for (const key of Object.keys(node)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const value = node[key];
      if (isPlainObject(value)) {
        walk(value, fullPath);
      } else {
        acc[fullPath] = value;
      }
    }
  };

  walk(nested, '');
  return acc;
}

/**
 * Reconstruct the nested subtree rooted at `prefix` from flat `[path, value]` entries.
 *
 * Considers only entries whose path is related to `prefix`:
 * - ancestor-or-equal entry: drill into the stored value by the remaining prefix segments
 * - descendant entry: place the value at its path relative to `prefix`
 */
export function buildNestedForPrefix(prefix: string, flatEntries: [string, unknown][]): unknown {
  const prefixSegments = parsePath(prefix);
  let result: unknown = undefined;

  for (const [key, value] of flatEntries) {
    if (!isPathRelated(prefix, key)) {
      continue;
    }
    const keySegments = parsePath(key);
    // Ancestor-or-equal entries drill down the remaining prefix segments of the stored value.
    // Descendant entries are placed at their path relative to the prefix.
    result =
      keySegments.length <= prefixSegments.length
        ? getAtPath(value, prefixSegments.slice(keySegments.length).join('.'))
        : setAtPath(result ?? {}, keySegments.slice(prefixSegments.length).join('.'), value);
  }

  return result;
}
