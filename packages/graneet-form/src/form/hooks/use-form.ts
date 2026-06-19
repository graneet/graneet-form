import { useCallback, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AnyRecord } from '../../shared/types/any-record';
import type { DeepPartial } from '../../shared/types/deep-partial';
import type { FieldPath, FieldPathValue } from '../../shared/types/field-path';
import type { FieldValues } from '../../shared/types/field-value';
import type { PartialRecord } from '../../shared/types/partial-record';
import type { ValidationState } from '../../shared/types/validation';
import { useCallbackRef } from '../../shared/util/use-callback-ref';
import { createPathHelpers, flattenToPaths } from '../../shared/util/path';
import type { PathHelpers } from '../../shared/util/path';
import type { FieldCallbacks, FormContextApi, FormInternal, SetFormValuesOptions } from '../contexts/form-context';
import type { FormValidations } from '../types/form-validations';
import type { FormValues } from '../types/form-values';
import { VALIDATION_STATE_UNDETERMINED } from '../types/validation';
import type { WatchMode } from '../types/watch-mode';

/**
 * Configuration options for the useForm hook.
 * @template T - The form field values type
 */
export interface UseFormOptions<T extends FieldValues> {
  /**
   * Callback function executed when a field loses focus after being updated.
   *
   * This callback is triggered only when:
   * - The field had user focus (was actively edited)
   * - The field passes validation (status is VALID)
   * - The field loses focus (onBlur event)
   *
   * @template K - The specific field key being updated
   * @param name - The name of the field that was updated
   * @param value - The current value of the field after update
   * @param data - Additional data passed from the field's blur event
   * @param formPartial - Subset of form API methods for reading/updating form state
   * @returns Promise or void - Can be async for operations like API calls
   *
   * @example
   * ```ts
   * const form = useForm<{ email: string; name: string }>({
   *   onUpdateAfterBlur: async (fieldName, value, data, { getFormValues, setFormValues }) => {
   *     if (fieldName === 'email' && value) {
   *       // Auto-populate name based on email
   *       const userInfo = await fetchUserByEmail(value);
   *       if (userInfo.name) {
   *         setFormValues({ name: userInfo.name });
   *       }
   *     }
   *   }
   * });
   * ```
   */
  onUpdateAfterBlur?: <K extends FieldPath<T>>(
    name: K,
    value: FieldPathValue<T, K> | undefined,
    data: AnyRecord,
    formPartial: Pick<FormContextApi<T>, 'getFormValues' | 'setFormValues' | 'resetForm'>,
  ) => Promise<void> | void;

  /**
   * Default values for form fields.
   *
   * Can be either a static object or a function that returns the default values.
   * Using a function is useful when defaults depend on an external state or need to be computed.
   *
   * @example
   * ```ts
   * // Static defaults
   * const form = useForm({
   *   defaultValues: {
   *     name: 'John Doe',
   *     email: '',
   *     age: 25
   *   }
   * });
   *
   * // Dynamic defaults
   * const form = useForm({
   *   defaultValues: () => ({
   *     name: user?.name || '',
   *     email: user?.email || '',
   *     timestamp: Date.now()
   *   })
   * });
   * ```
   */
  defaultValues?: DeepPartial<T> | (() => DeepPartial<T>);
}

/**
 * Hook for creating and managing form state with validation, field registration, and submission handling.
 *
 * This hook provides a complete form management solution including:
 * - Field registration and value management
 * - Real-time validation status tracking
 * - Subscription-based updates for optimal performance
 * - Form submission with validation
 * - Default values and reset functionality
 *
 * @template T - The form field values type, defaults to a generic record
 * @param options - Configuration options for the form behavior
 * @returns Form context API that can be passed to Form components
 *
 * @example
 * ```tsx
 * // Define your form data structure
 * interface UserFormData {
 *   name: string;
 *   email: string;
 *   age: number;
 * }
 *
 * function UserForm() {
 *   const form = useForm<UserFormData>({
 *     defaultValues: {
 *       name: '',
 *       email: '',
 *       age: 18
 *     },
 *     onUpdateAfterBlur: async (fieldName, value) => {
 *       // Auto-save on blur
 *       if (fieldName === 'email') {
 *         await saveEmailDraft(value);
 *       }
 *     }
 *   });
 *
 *   return (
 *     <Form form={form}>
 *       ...
 *     </Form>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Form with validation and submission
 * function LoginForm() {
 *   const form = useForm<{ username: string; password: string }>();
 *
 *   const handleSubmit = form.handleSubmit(async (formData) => {
 *     try {
 *       await login(formData.username, formData.password);
 *       navigate('/dashboard');
 *     } catch (error) {
 *       setError('Invalid credentials');
 *     }
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Form form={form}>
 *          ...
 *         <button type="submit">Login</button>
 *       </Form>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<T extends FieldValues = Record<string, Record<string, unknown>>>({
  onUpdateAfterBlur,
  defaultValues,
}: UseFormOptions<T> = {}): FormContextApi<T> {
  // -- TYPES --
  const globalTimeoutRef = useRef<Record<'errors' | 'values', Record<string, NodeJS.Timeout>>>({
    errors: {},
    values: {},
  });

  // Path helpers carry a parsed-path memo cache scoped to this form. Held in a ref so the cache
  // Lives for the form's lifetime and never leaks across unrelated form instances.
  const pathHelpersRef = useRef<PathHelpers | null>(null);
  pathHelpersRef.current ??= createPathHelpers();
  const { buildNestedForPrefix, isPathRelated, parsePath, setAtPath, unsetAtPath } = pathHelpersRef.current;

  const resolvedDefaultValues = useMemo((): DeepPartial<T> => {
    if (typeof defaultValues === 'function') {
      // oxlint-disable-next-line typescript/no-unsafe-return DeepPartial recursion is resolved as any by the linter
      return defaultValues();
    }
    return defaultValues ?? ({} as DeepPartial<T>);
  }, [defaultValues]);

  // -- FORM STATE --
  // Field state is stored FLAT, keyed by the full dotted path string (e.g. "user.address.city").
  // Nested objects only exist transiently when reconstructing values for consumers.
  interface FieldState {
    name: string;
    value: unknown;
    validation: ValidationState;
    isRegistered: boolean;
  }
  const formStateRef = useRef<Record<string, FieldState>>(
    (() => {
      const acc: Record<string, FieldState> = {};
      const flatDefaults = flattenToPaths(resolvedDefaultValues as Record<string, unknown>);
      for (const key of Object.keys(flatDefaults)) {
        acc[key] = {
          isRegistered: false,
          name: key,
          validation: VALIDATION_STATE_UNDETERMINED,
          value: flatDefaults[key],
        };
      }
      return acc;
    })(),
  );

  /**
   * We can have multiple fields on update at the same time because of usage of effect, we trigger an on change event
   * before triggering an on blur event.
   */
  const focusedFieldNamesRef = useRef(new Set<string>());

  const fieldCallbacksRef = useRef<Record<string, FieldCallbacks>>({});

  // Each field's own `setValue`, keyed by its exact path. Notified directly in O(1) on value change,
  // Bypassing the generic `scoped` registry (which is reserved for explicit useFieldsWatch watchers).
  const fieldSettersRef = useRef<Record<string, (value: unknown) => void>>({});

  const handleFormSubmitRef = useRef<(formValues: T) => (void | Promise<void>) | undefined>(undefined);

  // -- SUBSCRIPTION --

  // Scoped subscribers are keyed by the watched path string. Their payload is a nested object
  // Reconstructed on the fly, so it is typed loosely here and refined at each public boundary.
  type FormValueSubscribersRef = Record<
    WatchMode,
    {
      global: Set<Dispatch<SetStateAction<Partial<T>>>>;
      scoped: Record<string, Set<Dispatch<SetStateAction<Record<string, unknown>>>>>;
    }
  >;
  const formValuesSubscribersRef = useRef<FormValueSubscribersRef>({
    onBlur: {
      global: new Set(),
      scoped: {},
    },
    onChange: {
      global: new Set(),
      scoped: {},
    },
  });

  type FormErrorSubscribersRef = Record<
    WatchMode,
    {
      global: Set<Dispatch<SetStateAction<PartialRecord<keyof T, ValidationState | undefined>>>>;
      scoped: Record<string, Set<Dispatch<SetStateAction<Record<string, unknown>>>>>;
    }
  >;
  const formErrorsSubscribersRef = useRef<FormErrorSubscribersRef>({
    onBlur: {
      global: new Set(),
      scoped: {},
    },
    onChange: {
      global: new Set(),
      scoped: {},
    },
  });

  const onUpdateAfterBlurRef = useCallbackRef(
    onUpdateAfterBlur ??
      (() => {
        // NOOP
      }),
  );

  // -- EXPORTS --

  /** Flat `[path, value]` entries for every registered field. Basis for nested reconstruction. */
  const getRegisteredValueEntries = useCallback((): [string, unknown][] => {
    const entries: [string, unknown][] = [];
    for (const name of Object.keys(formStateRef.current)) {
      const field = formStateRef.current[name];
      if (field?.isRegistered) {
        entries.push([name, field.value]);
      }
    }
    return entries;
  }, []);

  /** Flat `[path, validation]` entries for every registered field. */
  const getRegisteredValidationEntries = useCallback((): [string, ValidationState][] => {
    const entries: [string, ValidationState][] = [];
    for (const name of Object.keys(formStateRef.current)) {
      const field = formStateRef.current[name];
      if (field?.isRegistered) {
        entries.push([name, field.validation]);
      }
    }
    return entries;
  }, []);

  const getFormValues = useCallback<FormContextApi<T>['getFormValues']>(() => {
    let acc: Partial<T> = {};
    for (const [name, value] of getRegisteredValueEntries()) {
      acc = setAtPath(acc, name, value);
    }
    return acc;
  }, [getRegisteredValueEntries, setAtPath]);

  const getFormValuesForNames = useCallback<FormInternal<T>['getFormValuesForNames']>(
    <K extends FieldPath<T>>(names: K[]): FormValues<T, K> => {
      let acc = {} as FormValues<T, K>;
      const entries = getRegisteredValueEntries();
      for (const name of names) {
        const subtree = buildNestedForPrefix(name as string, entries);
        if (subtree !== undefined) {
          acc = setAtPath(acc, name as string, subtree);
        }
      }
      return acc;
    },
    [getRegisteredValueEntries, buildNestedForPrefix, setAtPath],
  );

  const getFormErrors = useCallback<FormInternal<T>['getFormErrors']>((): PartialRecord<keyof T, ValidationState> => {
    const acc: PartialRecord<keyof T, ValidationState> = {};
    for (const [name, validation] of getRegisteredValidationEntries()) {
      // Global errors stay a flat map keyed by the field path (typed loosely as keyof T).
      acc[name as keyof T] = validation;
    }
    return acc;
  }, [getRegisteredValidationEntries]);

  const getFormErrorsForNames = useCallback<FormInternal<T>['getFormErrorsForNames']>(
    <K extends FieldPath<T>>(names: K[]): FormValidations<T, K> => {
      let acc = {} as FormValidations<T, K>;
      const entries = getRegisteredValidationEntries();
      for (const name of names) {
        const subtree = buildNestedForPrefix(name as string, entries);
        if (subtree !== undefined) {
          acc = setAtPath(acc, name as string, subtree);
        }
      }
      return acc;
    },
    [getRegisteredValidationEntries, buildNestedForPrefix, setAtPath],
  );

  /**
   * Notify every scoped subscriber whose watched path is in an ancestor/descendant/equal
   * relationship with the changed field, by applying ONLY the changed leaf as an incremental
   * patch to the previously published object — never rebuilding the whole subtree.
   *
   * `scoped` holds only explicit useFieldsWatch watchers (few), and a single field change touches
   * exactly one leaf, so this is O(watchers · pathDepth) instead of O(watchers · fieldCount).
   * @internal
   */
  const notifyScopedSubscribers = useCallback(
    (
      scoped: Record<string, Set<Dispatch<SetStateAction<Record<string, unknown>>>>>,
      name: string,
      isRegistered: boolean,
      value: unknown,
      getEntries: () => [string, unknown][],
    ): void => {
      const watchedPaths = Object.keys(scoped);
      if (watchedPaths.length === 0) {
        return;
      }
      const nameSegmentsLength = parsePath(name).length;
      for (const watchedPath of watchedPaths) {
        const subscribers = scoped[watchedPath];
        if (!subscribers || subscribers.size === 0 || !isPathRelated(watchedPath, name)) {
          continue;
        }

        if (nameSegmentsLength >= parsePath(watchedPath).length) {
          // Common case — the changed field is equal-or-descendant of the watched path (exact-field
          // Or subtree watch). Patch just its leaf: set when registered, remove (pruning now-empty
          // Ancestors) when unregistered, so the published object stays consistent without a rebuild.
          for (const publish of subscribers) {
            publish((previous) => (isRegistered ? setAtPath(previous, name, value) : unsetAtPath(previous, name)));
          }
        } else {
          // Rare case — the changed field is a strict ancestor of the watched path (a field holding
          // An object, watched below its own leaf). Reconstruct just this one watcher's subtree.
          const subtree = buildNestedForPrefix(watchedPath, getEntries());
          for (const publish of subscribers) {
            publish((previous) =>
              subtree === undefined ? unsetAtPath(previous, watchedPath) : setAtPath(previous, watchedPath, subtree),
            );
          }
        }
      }
    },
    [buildNestedForPrefix, isPathRelated, parsePath, setAtPath, unsetAtPath],
  );

  /**
   * Update every value subscriber watching a field.
   * @internal
   * @param name Field name
   * @param watchMode Subscriber type
   */
  const updateValueSubscribers = useCallback(
    (name: string, watchMode: WatchMode): void => {
      const field = formStateRef.current[name];
      const isRegistered = Boolean(field?.isRegistered);

      // Notify in O(1) the field registered exactly on `name`. Its self-watcher previously lived in
      // `scoped` on the 'onChange' mode, so we reproduce that trigger here.
      if (watchMode === 'onChange') {
        fieldSettersRef.current[name]?.(isRegistered ? field?.value : undefined);
      }

      notifyScopedSubscribers(
        formValuesSubscribersRef.current[watchMode].scoped,
        name,
        isRegistered,
        isRegistered ? field?.value : undefined,
        getRegisteredValueEntries,
      );

      if (formValuesSubscribersRef.current[watchMode].global.size > 0) {
        /*
          If there is a global subscriber and a lot of fields are render, avoid spam of refresh on this subscriber
        */
        clearTimeout(globalTimeoutRef.current.values[watchMode]);
        globalTimeoutRef.current.values[watchMode] = setTimeout(() => {
          const formValues = getFormValues();
          // Update global watcher
          for (const publish of formValuesSubscribersRef.current[watchMode].global) {
            // To be simpler, send value returned by getFormValues method
            publish(formValues);
          }
        }, 0);
      }
    },
    [getFormValues, getRegisteredValueEntries, notifyScopedSubscribers],
  );

  /**
   * Update every error subscriber watching a field.
   * @internal
   * @param name Field name
   * @param watchMode Subscriber type
   */
  const updateErrorSubscribers = useCallback(
    (name: string, watchMode: WatchMode): void => {
      // Same incremental hierarchical matching as values, patching the single changed validation leaf.
      const field = formStateRef.current[name];
      const isRegistered = Boolean(field?.isRegistered);
      notifyScopedSubscribers(
        formErrorsSubscribersRef.current[watchMode].scoped,
        name,
        isRegistered,
        isRegistered ? field?.validation : undefined,
        getRegisteredValidationEntries,
      );
      if (formErrorsSubscribersRef.current[watchMode].global.size > 0) {
        /*
          If there is a global subscriber and a lot of fields are render, avoid spam of refresh on this subscriber
        */
        clearTimeout(globalTimeoutRef.current.errors[watchMode]);
        globalTimeoutRef.current.errors[watchMode] = setTimeout(() => {
          const formValues = getFormErrors();
          // Update global watcher
          for (const publish of formErrorsSubscribersRef.current[watchMode].global) {
            // To be simpler, send value returned by getFormValues method
            publish(formValues);
          }
        }, 0);
      }
    },
    [getFormErrors, getRegisteredValidationEntries, notifyScopedSubscribers],
  );

  /**
   * Update all values subscribers types watching a field don't matter watch mode.
   * @internal
   * @param name Field path
   */
  const updateValueForAllTypeOfSubscribers = useCallback(
    (name: string): void => {
      updateValueSubscribers(name, 'onChange');
      updateValueSubscribers(name, 'onBlur');
    },
    [updateValueSubscribers],
  );

  /**
   * Update all errors subscribers types watching a field don't matter watch mode.
   * @internal
   * @param name Field path
   */
  const updateErrorForAllTypeOfSubscribers = useCallback(
    (name: string): void => {
      updateErrorSubscribers(name, 'onChange');
      updateErrorSubscribers(name, 'onBlur');
    },
    [updateErrorSubscribers],
  );

  const addGlobalValueSubscriber = useCallback<FormInternal<T>['addGlobalValueSubscriber']>(
    (publish: Dispatch<SetStateAction<Partial<T>>>, watchMode: WatchMode) => {
      formValuesSubscribersRef.current[watchMode].global.add(publish);
      publish(getFormValues());
    },
    [getFormValues],
  );

  const addValueSubscriber = useCallback<FormInternal<T>['addValueSubscriber']>(
    <K extends FieldPath<T>>(publish: Dispatch<SetStateAction<FormValues<T, K>>>, watchMode: WatchMode, names: K[]) => {
      const { scoped } = formValuesSubscribersRef.current[watchMode];
      for (const name of names) {
        const path = name as string;
        scoped[path] ??= new Set();
        scoped[path]?.add(publish as Dispatch<SetStateAction<Record<string, unknown>>>);
      }
      publish(getFormValuesForNames(names));
    },
    [getFormValuesForNames],
  );

  const addGlobalValidationStatusSubscriber = useCallback<FormInternal<T>['addGlobalValidationStatusSubscriber']>(
    (publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationState | undefined>>>) => {
      formErrorsSubscribersRef.current.onChange.global.add(publish);
      publish(getFormErrors());
    },
    [getFormErrors],
  );

  const removeGlobalValueSubscriber = useCallback<FormInternal<T>['removeGlobalValueSubscriber']>(
    (publish: Dispatch<SetStateAction<Partial<T>>>, watchMode: WatchMode): void => {
      formValuesSubscribersRef.current[watchMode].global.delete(publish);
    },
    [],
  );

  const removeValueSubscriber = useCallback<FormInternal<T>['removeValueSubscriber']>(
    <K extends FieldPath<T>>(
      publish: Dispatch<SetStateAction<FormValues<T, K>>>,
      watchMode: WatchMode,
      names: K[],
    ): void => {
      for (const name of names) {
        formValuesSubscribersRef.current[watchMode].scoped[name as string]?.delete(
          publish as Dispatch<SetStateAction<Record<string, unknown>>>,
        );
      }
    },
    [],
  );

  const addValidationStatusSubscriber = useCallback<FormInternal<T>['addValidationStatusSubscriber']>(
    <K extends FieldPath<T>>(publish: Dispatch<SetStateAction<FormValidations<T, K>>>, names: K[]): void => {
      const { scoped } = formErrorsSubscribersRef.current.onChange;
      for (const name of names) {
        const path = name as string;
        // Initialize Set if there is no watcher for the field
        scoped[path] ??= new Set();
        scoped[path]?.add(publish as Dispatch<SetStateAction<Record<string, unknown>>>);
        publish(getFormErrorsForNames(names));
      }
    },
    [getFormErrorsForNames],
  );

  const registerField = useCallback<FormInternal<T>['registerField']>(
    <K extends FieldPath<T>>(
      name: K,
      setValue: (value: FieldPathValue<T, K> | undefined) => void,
      callbacks: FieldCallbacks,
      defaultValue?: FieldPathValue<T, K>,
    ): (() => void) => {
      const path = name as string;
      const previousValueStored = formStateRef.current[path]?.value;
      if (formStateRef.current[path]?.isRegistered) {
        throw new Error(`Attempting to register field "${path}" a second time`);
      }

      formStateRef.current[path] = {
        isRegistered: true,
        name: path,
        validation: VALIDATION_STATE_UNDETERMINED,
        value: previousValueStored ?? defaultValue,
      };

      fieldCallbacksRef.current[path] = callbacks;

      // The field receives its value directly through its own `setValue`, keyed by its exact path.
      // `updateValueForAllTypeOfSubscribers` below initializes it and notifies explicit watchers.
      fieldSettersRef.current[path] = setValue as (value: unknown) => void;
      updateValueForAllTypeOfSubscribers(path);

      return () => {
        if (!formStateRef.current[path]) {
          throw new Error(`Field ${path} is not registered`);
        }

        formStateRef.current[path].isRegistered = false;
        delete fieldCallbacksRef.current[path];
        delete fieldSettersRef.current[path];
        updateValueForAllTypeOfSubscribers(path);
        updateErrorForAllTypeOfSubscribers(path);
      };
    },
    [updateValueForAllTypeOfSubscribers, updateErrorForAllTypeOfSubscribers],
  );

  const removeGlobalValidationStatusSubscriber = useCallback<FormInternal<T>['removeGlobalValidationStatusSubscriber']>(
    (publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationState | undefined>>>): void => {
      formErrorsSubscribersRef.current.onChange.global.delete(publish);
    },
    [],
  );

  const removeValidationStatusSubscriber = useCallback<FormInternal<T>['removeValidationStatusSubscriber']>(
    <K extends FieldPath<T>>(publish: Dispatch<SetStateAction<FormValidations<T, K>>>, names: K[]): void => {
      for (const name of names) {
        formErrorsSubscribersRef.current.onChange.scoped[name as string]?.delete(
          publish as Dispatch<SetStateAction<Record<string, unknown>>>,
        );
      }
    },
    [],
  );

  const setFormValues = useCallback<FormContextApi<T>['setFormValues']>(
    (newValues: DeepPartial<T>, options?: SetFormValuesOptions) => {
      // Flatten the nested input into leaf path keys, so each affected leaf is reconciled
      // Individually (a coarse `{ user: {...} }` set fans out to every registered descendant).
      const flatValues = flattenToPaths(newValues as Record<string, unknown>);
      for (const path of Object.keys(flatValues)) {
        const value = flatValues[path];
        // If the field is already stored, only update the value
        if (formStateRef.current[path]) {
          formStateRef.current[path].value = value;
        } else {
          // Else, save a new line in the context for the given name. When the field is registered later, he will have access to the value
          formStateRef.current[path] = {
            isRegistered: false,
            name: path,
            validation: VALIDATION_STATE_UNDETERMINED,
            value,
          };
        }
        updateValueForAllTypeOfSubscribers(path);

        if (options?.shouldDirty) {
          fieldCallbacksRef.current[path]?.onDirty();
        }
        if (options?.shouldTouch) {
          fieldCallbacksRef.current[path]?.onTouch();
        }
      }
    },
    [updateValueForAllTypeOfSubscribers],
  );

  const onFieldChange = useCallback<FormInternal<T>['onFieldChange']>(
    <K extends FieldPath<T>>(name: K, value: FieldPathValue<T, K> | undefined, hasFocus: boolean): void => {
      const path = name as string;
      if (!formStateRef.current[path]) {
        throw new Error(`Field "${path}" is not registered`);
      }

      if (formStateRef.current[path]?.value === value) {
        return;
      }
      // Keep field name to know on blur if the field has been updated by user input
      if (hasFocus) {
        focusedFieldNamesRef.current.add(path);
      }
      // Update value in store
      formStateRef.current[path].value = value;
      updateValueSubscribers(path, 'onChange');
    },
    [updateValueSubscribers],
  );

  const resetForm = useCallback<FormContextApi<T>['resetForm']>((): void => {
    for (const fieldName of Object.keys(formStateRef.current)) {
      if (formStateRef.current[fieldName]) {
        formStateRef.current[fieldName].value = undefined;
        updateValueForAllTypeOfSubscribers(fieldName);
        fieldCallbacksRef.current[fieldName]?.onReset();
      }
    }
  }, [updateValueForAllTypeOfSubscribers]);

  const onFieldBlur = useCallback<FormInternal<T>['onFieldBlur']>(
    async (name: FieldPath<T>, data: AnyRecord = {}): Promise<void> => {
      const path = name as string;
      updateValueSubscribers(path, 'onBlur');

      if (!formStateRef.current[path]) {
        throw new Error(`Field "${path}" is not registered`);
      }

      if (focusedFieldNamesRef.current.has(path) && formStateRef.current[path].validation.status === 'valid') {
        await onUpdateAfterBlurRef(name, formStateRef.current[path].value as FieldPathValue<T, FieldPath<T>>, data, {
          getFormValues,
          resetForm,
          setFormValues,
        });
      }
      focusedFieldNamesRef.current.delete(path);
    },
    [updateValueSubscribers, onUpdateAfterBlurRef, getFormValues, setFormValues, resetForm],
  );

  const updateValidationStatus = useCallback<FormInternal<T>['updateValidationStatus']>(
    (name: FieldPath<T>, validationStatus: ValidationState): void => {
      const path = name as string;
      if (!formStateRef.current[path]) {
        throw new Error(`Field "${path}" is not registered`);
      }

      formStateRef.current[path].validation = validationStatus;
      updateErrorSubscribers(path, 'onChange');
    },
    [updateErrorSubscribers],
  );

  const handleSubmit = useCallback<FormContextApi<T>['handleSubmit']>(
    (submitCallback: (formValues: T) => void | Promise<void>) => () => {
      handleFormSubmitRef.current = submitCallback;
    },
    [],
  );

  return useMemo<FormContextApi<T>>(
    () => ({
      formInternal: {
        addGlobalValidationStatusSubscriber,
        addGlobalValueSubscriber,
        addValidationStatusSubscriber,
        addValueSubscriber,
        getFormErrors,
        getFormErrorsForNames,
        getFormValuesForNames,
        get getHandleFormSubmit() {
          return () => handleFormSubmitRef.current;
        },
        onFieldBlur,
        onFieldChange,
        registerField,
        removeGlobalValidationStatusSubscriber,
        removeGlobalValueSubscriber,
        removeValidationStatusSubscriber,
        removeValueSubscriber,
        updateValidationStatus,
      },
      getFormValues,
      handleSubmit,
      resetForm,
      setFormValues,
    }),
    [
      registerField,
      addGlobalValueSubscriber,
      addValueSubscriber,
      removeGlobalValueSubscriber,
      removeValueSubscriber,
      addGlobalValidationStatusSubscriber,
      addValidationStatusSubscriber,
      removeGlobalValidationStatusSubscriber,
      removeValidationStatusSubscriber,
      onFieldChange,
      onFieldBlur,
      getFormValuesForNames,
      getFormErrors,
      getFormErrorsForNames,
      updateValidationStatus,
      getFormValues,
      resetForm,
      setFormValues,
      handleSubmit,
    ],
  );
}
