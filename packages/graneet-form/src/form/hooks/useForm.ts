import { type Dispatch, type SetStateAction, useCallback, useMemo, useRef } from 'react';
import type { AnyRecord } from '../../shared/types/AnyRecord';
import type { FieldValues } from '../../shared/types/FieldValue';
import type { PartialRecord } from '../../shared/types/PartialRecord';
import { VALIDATION_OUTCOME, type ValidationStatus } from '../../shared/types/Validation';
import { useCallbackRef } from '../../shared/util/useCallbackRef';
import type { FormContextApi, FormInternal } from '../contexts/FormContext';
import type { FormValidations } from '../types/FormValidations';
import type { FormValues } from '../types/FormValues';
import { VALIDATION_STATE_UNDETERMINED } from '../types/Validation';
import { WATCH_MODE } from '../types/WatchMode';

export interface UseFormOptions<T extends FieldValues> {
  /**
   * Callback run on blur when a field is updated
   */
  onUpdateAfterBlur?<K extends keyof T>(
    name: K,
    value: T[K] | undefined,
    data: AnyRecord,
    formPartial: Pick<FormContextApi<T>, 'getFormValues' | 'setFormValues'>,
  ): Promise<void> | void;

  /**
   * Form default values
   */
  defaultValues?: Partial<T>;
}

/**
 * Hook to define a form

 * @example
 * ```tsx
 *
 * interface FormValues {
 *   name: string
 * }
 *
 * // in the component
 * const form = useForm();
 *
 * // in the JSX component
 * <Form form={form}>
 *   <TextInput<FormValues> name="name" />
 * </Form>
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

  // -- FORM STATE --
  interface FieldState<K extends keyof T> {
    name: K;
    value: T[K] | undefined;
    validation: ValidationStatus;
    isRegistered: boolean;
  }
  const formStateRef = useRef<{ [K in keyof T]?: FieldState<K> }>(
    (Object.keys(defaultValues ?? {}) as (keyof T)[]).reduce(
      (acc, key) => {
        acc[key] = {
          name: key,
          value: defaultValues?.[key],
          validation: VALIDATION_STATE_UNDETERMINED,
          isRegistered: false,
        };

        return acc;
      },
      {} as { [K in keyof T]?: FieldState<K> },
    ),
  );

  /**
   * We can have multiple fields on update at the same time because of usage of effect, we trigger an on change event
   * before triggering an on blur event.
   */
  const focusedFieldNamesRef = useRef(new Set<keyof T>());

  const handleFormSubmitRef = useRef<(formValues: T) => void | Promise<void> | undefined>(undefined);

  // -- SUBSCRIPTION --

  type FormValueSubscribersRef = Record<
    WATCH_MODE,
    {
      global: Set<() => void>;
      scoped: PartialRecord<keyof T, Set<() => void>>;
    }
  >;
  const formValuesSubscribersRef = useRef<FormValueSubscribersRef>({
    [WATCH_MODE.ON_CHANGE]: {
      global: new Set(),
      scoped: {},
    },
    [WATCH_MODE.ON_BLUR]: {
      global: new Set(),
      scoped: {},
    },
  });

  type FormErrorSubscribersRef = Record<
    WATCH_MODE,
    {
      global: Set<Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>>;
      scoped: PartialRecord<keyof T, Set<Dispatch<SetStateAction<FormValidations<T, keyof T>>>>>;
    }
  >;
  const formErrorsSubscribersRef = useRef<FormErrorSubscribersRef>({
    [WATCH_MODE.ON_CHANGE]: {
      global: new Set(),
      scoped: {},
    },
    [WATCH_MODE.ON_BLUR]: {
      global: new Set(),
      scoped: {},
    },
  });

  const onUpdateAfterBlurRef = useCallbackRef(onUpdateAfterBlur ?? (() => {}));

  // -- EXPORTS --

  const getFormValues = useCallback<FormContextApi<T>['getFormValues']>(() => {
    return Object.keys(formStateRef.current).reduce<Partial<T>>((acc, name: keyof T) => {
      if (formStateRef.current[name]?.isRegistered) {
        acc[name] = formStateRef.current[name]?.value;
      }
      return acc;
    }, {});
  }, []);

  const getFormValuesForNames = useCallback<FormInternal<T>['getFormValuesForNames']>(
    <K extends keyof T>(names: K[]): FormValues<T, K> => {
      return names.reduce<FormValues<T, K>>(
        (acc, name) => {
          if (formStateRef.current[name]?.isRegistered) {
            acc[name] = formStateRef.current[name]?.value;
          }
          return acc;
        },
        {} as FormValues<T, K>,
      );
    },
    [],
  );

  const getFormErrors = useCallback<FormInternal<T>['getFormErrors']>((): PartialRecord<keyof T, ValidationStatus> => {
    return Object.keys(formStateRef.current).reduce<PartialRecord<keyof T, ValidationStatus>>((acc, name: keyof T) => {
      if (formStateRef.current[name]?.isRegistered) {
        acc[name] = formStateRef.current[name]?.validation;
      }
      return acc;
    }, {});
  }, []);

  const getFormErrorsForNames = useCallback<FormInternal<T>['getFormErrorsForNames']>(
    <K extends keyof T>(names: K[]): Record<K, ValidationStatus | undefined> => {
      return names.reduce<Record<K, ValidationStatus | undefined>>(
        (acc, name) => {
          if (formStateRef.current[name]?.isRegistered) {
            acc[name] = formStateRef.current[name]?.validation;
          }
          return acc;
        },
        {} as Record<K, ValidationStatus | undefined>,
      );
    },
    [],
  );

  /**
   * Update every value subscriber watching a field.
   * @internal
   * @param name Field name
   * @param watchMode Subscriber type
   */
  const updateValueSubscribers = useCallback((name: keyof T, watchMode: WATCH_MODE): void => {
    // TODO Compute value to SEND
    // Update watcher for this field name
    if (formValuesSubscribersRef.current[watchMode].scoped[name]) {
      for (const publish of formValuesSubscribersRef.current[watchMode].scoped[name] || []) {
        publish();
      }
    }

    if (formValuesSubscribersRef.current[watchMode].global.size) {
      /*
          If there is a global subscriber and a lot of fields are render, avoid spam of refresh on this subscriber
        */
      clearTimeout(globalTimeoutRef.current.values[watchMode]);
      globalTimeoutRef.current.values[watchMode] = setTimeout(() => {
        // Update global watcher
        for (const publish of formValuesSubscribersRef.current[watchMode].global) {
          publish();
        }
      }, 0);
    }
  }, []);

  /**
   * Update every error subscriber watching a field.
   * @internal
   * @param name Field name
   * @param watchMode Subscriber type
   */
  const updateErrorSubscribers = useCallback(
    (name: keyof T, watchMode: WATCH_MODE): void => {
      // Update watcher for this field name
      if (formErrorsSubscribersRef.current[watchMode].scoped[name]) {
        for (const publish of formErrorsSubscribersRef.current[watchMode].scoped[name] || []) {
          /*
           * Publish is a function given by react hook useState:
           * `const [example, setExample] = useState(() => {})` It's `setExample`
           *
           * With the hook we can have the previous values like setExample((previousValues) => ... )
           * Here, only value of the field updated must be change, so we get the previous object
           * and we change value with key [name] with the new value
           */
          publish((previous) => {
            const previousCopy = { ...previous };
            if (!formStateRef.current[name]?.isRegistered) {
              delete previousCopy[name];
            } else {
              previousCopy[name] = formStateRef.current[name]?.validation;
            }
            return previousCopy;
          });
        }
      }
      if (formErrorsSubscribersRef.current[watchMode].global.size) {
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
    [getFormErrors],
  );

  /**
   * Update all values subscribers types watching a field don't matter watch mode.
   * @internal
   * @param name Field name
   */
  const updateValueForAllTypeOfSubscribers = useCallback(
    (name: keyof T): void => {
      updateValueSubscribers(name, WATCH_MODE.ON_CHANGE);
      updateValueSubscribers(name, WATCH_MODE.ON_BLUR);
    },
    [updateValueSubscribers],
  );

  /**
   * Update all errors subscribers types watching a field don't matter watch mode.
   * @internal
   * @param name Field name
   */
  const updateErrorForAllTypeOfSubscribers = useCallback(
    (name: keyof T): void => {
      updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
      updateErrorSubscribers(name, WATCH_MODE.ON_BLUR);
    },
    [updateErrorSubscribers],
  );

  const addGlobalValueSubscriber = useCallback<FormInternal<T>['addGlobalValueSubscriber']>(
    (publish: () => void, watchMode: WATCH_MODE) => {
      formValuesSubscribersRef.current[watchMode].global.add(publish);
      publish(); // TODO is this mandatory ?
    },
    [],
  );

  const addValueSubscriber = useCallback<FormInternal<T>['addValueSubscriber']>(
    (publish: () => void, watchMode: WATCH_MODE, names: (keyof T)[]) => {
      for (const name of names) {
        if (!formValuesSubscribersRef.current[watchMode].scoped[name]) {
          formValuesSubscribersRef.current[watchMode].scoped[name] = new Set();
        }
        formValuesSubscribersRef.current[watchMode].scoped[name]?.add(publish);
      }
      publish();
    },
    [],
  );

  const addGlobalValidationStatusSubscriber = useCallback<FormInternal<T>['addGlobalValidationStatusSubscriber']>(
    (publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>) => {
      formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].global.add(publish);
      publish(getFormErrors());
    },
    [getFormErrors],
  );

  const addValidationStatusSubscriber = useCallback<FormInternal<T>['addValidationStatusSubscriber']>(
    <K extends keyof T>(publish: Dispatch<SetStateAction<FormValidations<T, K>>>, names: K[]): void => {
      for (const name of names) {
        // Initialize Set if there is no watcher for the field
        if (!formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[name]) {
          formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[name] = new Set();
        }

        formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[
          name
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        ]?.add(publish as any);
        publish(getFormErrorsForNames(names));
      }
    },
    [getFormErrorsForNames],
  );

  const removeValueSubscriber = useCallback<FormInternal<T>['removeValueSubscriber']>(
    <K extends keyof T>(publish: () => void, watchMode: WATCH_MODE, names: K[]): void => {
      for (const name of names) {
        formValuesSubscribersRef.current[watchMode].scoped[name]?.delete(publish);
      }
    },
    [],
  );

  const registerField = useCallback<FormInternal<T>['registerField']>(
    <K extends keyof T>(name: K, publish: () => void): void => {
      const previousValueStored = formStateRef.current[name]?.value;
      if (formStateRef.current[name]?.isRegistered) {
        throw new Error(`Attempting to register field "${String(name)}" a second time`);
      }

      formStateRef.current[name] = {
        name,
        isRegistered: true,
        value: previousValueStored,
        validation: VALIDATION_STATE_UNDETERMINED,
      };

      addValueSubscriber(publish, WATCH_MODE.ON_CHANGE, [name]);
      updateValueForAllTypeOfSubscribers(name);
    },
    [addValueSubscriber, updateValueForAllTypeOfSubscribers],
  );

  const unregisterField = useCallback<FormInternal<T>['unregisterField']>(
    (name: keyof T, publish: () => void): void => {
      if (!formStateRef.current[name]) {
        throw new Error(`Field ${String(name)} is not registered`);
      }

      formStateRef.current[name].isRegistered = false;
      removeValueSubscriber(publish, WATCH_MODE.ON_CHANGE, [name]);
      updateValueForAllTypeOfSubscribers(name);
      updateErrorForAllTypeOfSubscribers(name);
    },
    [updateValueForAllTypeOfSubscribers, updateErrorForAllTypeOfSubscribers, removeValueSubscriber],
  );

  const removeGlobalValueSubscriber = useCallback<FormInternal<T>['removeGlobalValueSubscriber']>(
    (publish: () => void, watchMode: WATCH_MODE): void => {
      formValuesSubscribersRef.current[watchMode].global.delete(publish);
    },
    [],
  );

  const removeGlobalValidationStatusSubscriber = useCallback<FormInternal<T>['removeGlobalValidationStatusSubscriber']>(
    (publish: Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>): void => {
      formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].global.delete(publish);
    },
    [],
  );

  const removeValidationStatusSubscriber = useCallback<FormInternal<T>['removeValidationStatusSubscriber']>(
    <K extends keyof T>(publish: Dispatch<SetStateAction<FormValidations<T, K>>>, names: K[]): void => {
      for (const name of names) {
        formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[name]?.delete(
          publish as Dispatch<SetStateAction<FormValidations<T, keyof T>>>,
        );
      }
    },
    [],
  );

  const setFormValues = useCallback<FormContextApi<T>['setFormValues']>(
    (newValues: Partial<T>) => {
      for (const name of Object.keys(newValues) as Array<keyof T>) {
        // If the field is already stored, only update the value
        if (formStateRef.current[name]) {
          formStateRef.current[name].value = newValues[name];
        } else {
          // Else, save a new line in the context for the given name. When the field is registered later, he will have access to the value
          formStateRef.current[name] = {
            name,
            isRegistered: false,
            value: newValues[name],
            validation: VALIDATION_STATE_UNDETERMINED,
          };
        }
        updateValueForAllTypeOfSubscribers(name);
      }
    },
    [updateValueForAllTypeOfSubscribers],
  );

  const handleOnChange = useCallback<FormInternal<T>['handleOnChange']>(
    <K extends keyof T>(name: K, value: T[K], hasFocus: boolean): void => {
      if (!formStateRef.current[name]) {
        throw new Error(`Field "${String(name)}" is not registered`);
      }

      if (formStateRef.current[name]?.value === value) {
        return;
      }
      // Keep field name to know on blur if the field has been updated by user input
      if (hasFocus) {
        focusedFieldNamesRef.current.add(name);
      }
      // Update value in store
      formStateRef.current[name].value = value;
      updateValueSubscribers(name, WATCH_MODE.ON_CHANGE);
    },
    [updateValueSubscribers],
  );

  const handleOnBlur = useCallback<FormInternal<T>['handleOnBlur']>(
    async (name: keyof T, data: AnyRecord = {}): Promise<void> => {
      updateValueSubscribers(name, WATCH_MODE.ON_BLUR);

      if (!formStateRef.current[name]) {
        throw new Error(`Field "${String(name)}" is not registered`);
      }

      if (
        focusedFieldNamesRef.current.has(name) &&
        formStateRef.current[name].validation.status === VALIDATION_OUTCOME.VALID
      ) {
        await onUpdateAfterBlurRef(name, formStateRef.current[name].value, data, {
          getFormValues,
          setFormValues,
        });
      }
      focusedFieldNamesRef.current.delete(name);
    },
    [updateValueSubscribers, onUpdateAfterBlurRef, getFormValues, setFormValues],
  );

  const updateValidationStatus = useCallback<FormInternal<T>['updateValidationStatus']>(
    (name: keyof T, validationStatus: ValidationStatus): void => {
      if (!formStateRef.current[name]) {
        throw new Error(`Field "${String(name)}" is not registered`);
      }

      formStateRef.current[name].validation = validationStatus;
      updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
    },
    [updateErrorSubscribers],
  );

  const resetForm = useCallback<FormContextApi<T>['resetForm']>((): void => {
    for (const fieldName of Object.keys(formStateRef.current)) {
      // biome-ignore lint/style/noNonNullAssertion: TODO understand why
      const { name } = formStateRef.current[fieldName]!;

      if (formStateRef.current[name]) {
        formStateRef.current[name].value = undefined;
        updateValueForAllTypeOfSubscribers(name);
      }
    }
  }, [updateValueForAllTypeOfSubscribers]);

  const handleSubmit = useCallback<FormContextApi<T>['handleSubmit']>(
    (submitCallback: (formValues: T) => void | Promise<void>) => () => {
      handleFormSubmitRef.current = submitCallback;
    },
    [],
  );

  return useMemo<FormContextApi<T>>(
    () => ({
      formInternal: {
        registerField,
        unregisterField,
        addGlobalValueSubscriber,
        addValueSubscriber,
        removeGlobalValueSubscriber,
        removeValueSubscriber,
        addGlobalValidationStatusSubscriber,
        addValidationStatusSubscriber,
        removeGlobalValidationStatusSubscriber,
        removeValidationStatusSubscriber,
        handleOnChange,
        handleOnBlur,
        getFormValuesForNames,
        getFormErrors,
        getFormErrorsForNames,
        updateValidationStatus,
        get getHandleFormSubmit() {
          return () => handleFormSubmitRef.current;
        },
      },
      getFormValues,
      resetForm,
      setFormValues,
      handleSubmit: handleSubmit,
    }),
    [
      registerField,
      unregisterField,
      addGlobalValueSubscriber,
      addValueSubscriber,
      removeGlobalValueSubscriber,
      removeValueSubscriber,
      addGlobalValidationStatusSubscriber,
      addValidationStatusSubscriber,
      removeGlobalValidationStatusSubscriber,
      removeValidationStatusSubscriber,
      handleOnChange,
      handleOnBlur,
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
