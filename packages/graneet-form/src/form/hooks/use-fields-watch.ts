import { useEffect, useState } from 'react';
import type { FieldValues } from '../../shared/types/field-value';
import type { Prettify } from '../../shared/types/prettify';
import type { FormContextApi } from '../contexts/form-context';
import type { FormValues } from '../types/form-values';
import type { WatchMode } from '../types/watch-mode';

export interface UseFormWatchOptions {
  mode?: WatchMode;
}

/**
 * Watch all fields values.
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // Watch all fields with onChange (default)
 *  const { foo, bar } = useFormWatch<FormValues>(form, undefined);
 *
 *  // Watch all fields with onBlur
 *  const { foo, bar } = useFormWatch<FormValues>(form, undefined, { mode: 'onBlur' });
 * ```
 */
export function useFieldsWatch<T extends FieldValues = Record<string, unknown>>(
  form: FormContextApi<T>,
  names: undefined,
  options?: UseFormWatchOptions,
): Partial<T>;

/**
 * Watch a list of fields values.
 * Watching a list of fields instead of all fields can be a huge performance improvement.
 *
 * @example
 * ```tsx
 * interface FormValues {
 *  foo: string
 *  bar: number
 * }
 *
 *  // Watch specific fields with onChange (default)
 *  const { foo } = useFormWatch<FormValues>(form, ['foo']);
 *
 *  // Watch specific fields with onBlur
 *  const { foo } = useFormWatch<FormValues>(form, ['foo'], { mode: 'onBlur' });
 * ```
 */
export function useFieldsWatch<T extends FieldValues = Record<string, unknown>, K extends keyof T = keyof T>(
  form: FormContextApi<T>,
  names: K[],
  options?: UseFormWatchOptions,
): Prettify<FormValues<T, K>>;

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function useFieldsWatch<T extends FieldValues, K extends keyof T>(
  form: FormContextApi<T>,
  names: K[] | undefined,
  options: UseFormWatchOptions = {},
) {
  const mode = options.mode ?? 'onChange';
  // oxlint-disable-next-line typescript/no-explicit-any typescript/no-unsafe-assignment : setCurrentValues needs to handle both Partial<T> and FormValues<T, K> signatures
  const [currentValues, setCurrentValues] = useState<any>({});

  const {
    formInternal: { addGlobalValueSubscriber, removeGlobalValueSubscriber, addValueSubscriber, removeValueSubscriber },
  } = form;

  useEffect(() => {
    if (names === undefined) {
      addGlobalValueSubscriber(setCurrentValues, mode);
      return () => {
        removeGlobalValueSubscriber(setCurrentValues, mode);
      };
    }
    addValueSubscriber(setCurrentValues, mode, names);
    return () => {
      removeValueSubscriber(setCurrentValues, mode, names);
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps names is transformed to string to ensure consistent ref
  }, [
    addGlobalValueSubscriber,
    removeGlobalValueSubscriber,
    addValueSubscriber,
    removeValueSubscriber,
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    names?.join(','),
    mode,
  ]);

  // oxlint-disable-next-line typescript/no-unsafe-return
  return currentValues;
}
