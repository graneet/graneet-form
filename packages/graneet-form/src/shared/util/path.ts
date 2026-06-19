/**
 * Path utilities for nested object field names (e.g. `"user.address.city"`).
 *
 * The form stores field state FLAT, keyed by the full dotted path string. These helpers
 * translate between that flat representation and the nested objects exposed to consumers.
 *
 * Scope: objects only. Numeric segments are treated as plain object keys, NOT array indices.
 * @internal
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Flatten a nested object into `{ [leafPath]: value }`. Recursion stops on anything that is not a
 * plain object (arrays, `Date`, class instances, `null` are treated as leaf values).
 *
 * Pure (no path parsing), so it lives outside the per-form cache.
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
 * The path helpers whose work depends on parsing dotted paths into segments. They share a single
 * memoization cache, so they are created together via {@link createPathHelpers}.
 */
export interface PathHelpers {
  /**
   * Split a dotted path into its segments. Memoized because it runs on the subscriber hot path.
   * @example parsePath('user.address.city') // ['user', 'address', 'city']
   */
  parsePath: (path: string) => string[];
  /**
   * Read the value at `path` in `obj`. Returns `undefined` if any intermediate node is missing
   * or is not an object.
   */
  getAtPath: (obj: unknown, path: string) => unknown;
  /**
   * Immutably set `value` at `path` in `obj`. Only the spine from the root to the leaf is cloned;
   * sibling subtrees keep their references (preserving referential equality for unchanged branches).
   */
  setAtPath: <O>(obj: O, path: string, value: unknown) => O;
  /**
   * Immutably remove the leaf at `path` from `obj`, cloning only the spine (mirror of
   * {@link setAtPath}). Now-empty ancestor objects are pruned so a removed leaf disappears entirely
   * rather than lingering as `{}`. Returns `obj` unchanged if any intermediate node is missing.
   */
  unsetAtPath: <O>(obj: O, path: string) => O;
  /**
   * Whether two paths are in an ancestor/descendant/equal relationship, compared **segment by
   * segment** (never via raw string prefix, so `"user"` and `"username"` are NOT related).
   */
  isPathRelated: (a: string, b: string) => boolean;
  /**
   * Reconstruct the nested subtree rooted at `prefix` from flat `[path, value]` entries.
   *
   * Considers only entries whose path is related to `prefix`:
   * - ancestor-or-equal entry: drill into the stored value by the remaining prefix segments
   * - descendant entry: place the value at its path relative to `prefix`
   */
  buildNestedForPrefix: (prefix: string, flatEntries: [string, unknown][]) => unknown;
}

/**
 * Build a set of path helpers backed by a private memoization cache.
 *
 * The cache is scoped to the returned instance (rather than module-global) so each form owns its
 * own parsed-path memo and nothing leaks across unrelated form instances. `useForm` keeps one
 * instance for the lifetime of the form in a ref.
 */
export function createPathHelpers(): PathHelpers {
  const parsedPathCache = new Map<string, string[]>();

  function parsePath(path: string): string[] {
    const cached = parsedPathCache.get(path);
    if (cached) {
      return cached;
    }
    const segments = path.split('.');
    parsedPathCache.set(path, segments);
    return segments;
  }

  function getAtPath(obj: unknown, path: string): unknown {
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

  function setAtPath<O>(obj: O, path: string, value: unknown): O {
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

  function unsetAtPath<O>(obj: O, path: string): O {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    const segments = parsePath(path);

    // Walk down to the leaf's parent, cloning each node along the spine. Bail out early (returning
    // The original object untouched) as soon as an intermediate node is missing or not an object.
    const root: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
    const spine: Record<string, unknown>[] = [root];
    let cursor = root;
    for (let i = 0; i < segments.length - 1; i += 1) {
      const child = cursor[segments[i]!];
      if (!isPlainObject(child)) {
        return obj;
      }
      const clone = { ...child };
      cursor[segments[i]!] = clone;
      spine.push(clone);
      cursor = clone;
    }

    const leaf = segments.at(-1)!;
    if (!(leaf in cursor)) {
      return obj;
    }
    delete cursor[leaf];

    // Prune ancestors that became empty so removed leaves vanish instead of leaving `{}` behind.
    for (let i = spine.length - 1; i > 0; i -= 1) {
      if (Object.keys(spine[i]!).length > 0) {
        break;
      }
      delete spine[i - 1]![segments[i - 1]!];
    }

    return root as O;
  }

  function isPathRelated(a: string, b: string): boolean {
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

  function buildNestedForPrefix(prefix: string, flatEntries: [string, unknown][]): unknown {
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

  return { buildNestedForPrefix, getAtPath, isPathRelated, parsePath, setAtPath, unsetAtPath };
}
