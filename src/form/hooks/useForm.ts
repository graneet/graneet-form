import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from 'react';
import { VALIDATION_OUTCOME, ValidationStatus, AnyRecord, FieldValues } from '../../shared';
import { FormContextApi, FormInternal } from '../contexts/FormContext';
import { WATCH_MODE } from '../types/WatchMode';
import { VALIDATION_STATE_UNDETERMINED } from '../types/Validation';
import { PartialRecord } from '../../shared/types/PartialRecord';
import { FormValues } from '../types/FormValues';
import { FormValidations } from '../types/FormValidations';

export interface UseFormOptions<T extends FieldValues> {
  onUpdateAfterBlur?<K extends keyof T>(
    name: K,
    value: T[K] | undefined,
    data: AnyRecord,
    formPartial: Pick<FormContextApi<T>, 'getFormValues' | 'setFormValues'>,
  ): Promise<void> | void;
}

/**
 * Generate form object used by `Form`
 * @example
 * ```
 * const form = useForm();
 *
 * return(
 *   <Form form={form}>
 *     <TextInput name="name" />
 *   </Form>
 * )
 * ```
 */
export function useForm<T extends FieldValues>({ onUpdateAfterBlur }: UseFormOptions<T> = {}): FormContextApi<T> {
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
  const formStateRef = useRef<{ [K in keyof T]?: FieldState<K> }>({});
  const fieldNameOnChangeByUserRef = useRef<keyof T | undefined>();

  const handleFormSubmitRef = useRef<(formValues: Partial<T>) => void | Promise<void>>();

  // -- SUBSCRIPTION --

  type FormValueSubscribersRef = Record<
    WATCH_MODE,
    {
      global: Set<Dispatch<SetStateAction<Partial<T>>>>;
      scoped: PartialRecord<keyof T, Set<Dispatch<SetStateAction<FormValues<T, any>>>>>;
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
      return names.reduce<FormValues<T, K>>((acc, name) => {
        if (formStateRef.current[name]?.isRegistered) {
          acc[name] = formStateRef.current[name]?.value;
        }
        return acc;
      }, {} as FormValues<T, K>);
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
      return names.reduce<Record<K, ValidationStatus | undefined>>((acc, name) => {
        if (formStateRef.current[name]?.isRegistered) {
          acc[name] = formStateRef.current[name]?.validation;
        }
        return acc;
      }, {} as Record<K, ValidationStatus | undefined>);
    },
    [],
  );

  /**
   * Update every value subscriber watching a field.
   * @internal
   * @param name Field name
   * @param watchMode Subscriber type
   */
  const updateValueSubscribers = useCallback(
    (name: keyof T, watchMode: WATCH_MODE): void => {
      // Update watcher for this field name
      if (formValuesSubscribersRef.current[watchMode].scoped[name]) {
        formValuesSubscribersRef.current[watchMode].scoped[name]?.forEach((publish) => {
          /*
           * Publish is a function given by react hook `useState`:
           * `const [example, setExample] = useState(() => {})` It's `setExample`
           *
           * With the hook we can have the previous values like setExample((previousValues) => ... )
           * Here, only value of the field updated must be change, so we get the previous object
           * and we change value with key [name] with the new value
           */
          publish((previous) => ({
            ...previous,
            [name]: formStateRef.current[name]?.isRegistered ? formStateRef.current[name]?.value : undefined,
          }));
        });
      }

      if (formValuesSubscribersRef.current[watchMode].global.size) {
        /*
          If there is a global subscriber and a lot of fields are render, avoid spam of refresh on this subscriber
        */
        clearTimeout(globalTimeoutRef.current.values[watchMode]);
        globalTimeoutRef.current.values[watchMode] = setTimeout(() => {
          const formValues = getFormValues();
          // Update global watcher
          formValuesSubscribersRef.current[watchMode].global.forEach((publish) => {
            // To be simpler, send value returned by getFormValues method
            publish(formValues);
          });
        }, 0);
      }
    },
    [getFormValues],
  );

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
        formErrorsSubscribersRef.current[watchMode].scoped[name]?.forEach((publish) => {
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
        });
      }
      if (formErrorsSubscribersRef.current[watchMode].global.size) {
        /*
          If there is a global subscriber and a lot of fields are render, avoid spam of refresh on this subscriber
        */
        clearTimeout(globalTimeoutRef.current.errors[watchMode]);
        globalTimeoutRef.current.errors[watchMode] = setTimeout(() => {
          const formValues = getFormErrors();
          // Update global watcher
          formErrorsSubscribersRef.current[watchMode].global.forEach((publish) => {
            // To be simpler, send value returned by getFormValues method
            publish(formValues);
          });
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
    (publish: Dispatch<SetStateAction<Partial<T>>>, watchMode: WATCH_MODE) => {
      formValuesSubscribersRef.current[watchMode].global.add(publish);
      publish(getFormValues());
    },
    [getFormValues],
  );

  const addValueSubscriber = useCallback<FormInternal<T>['addValueSubscriber']>(
    <K extends keyof T>(
      publish: Dispatch<SetStateAction<FormValues<T, K>>>,
      watchMode: WATCH_MODE,
      names: (keyof T)[],
    ) => {
      names.forEach((name) => {
        if (!formValuesSubscribersRef.current[watchMode].scoped[name]) {
          formValuesSubscribersRef.current[watchMode].scoped[name] = new Set();
        }
        formValuesSubscribersRef.current[watchMode].scoped[name]?.add(publish);
      });
      publish(getFormValuesForNames(names));
    },
    [getFormValuesForNames],
  );

  const addValidationStatusSubscriber = useCallback<FormInternal<T>['addValidationStatusSubscriber']>(
    (
      publish:
        | Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>
        | Dispatch<SetStateAction<FormValidations<T, keyof T>>>,
      names?: (keyof T)[],
    ): void => {
      if (!names) {
        formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].global.add(
          publish as Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>,
        );
        // TODO Remove as any
        publish(getFormErrors() as any);
      } else {
        names.forEach((name) => {
          if (!formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[name]) {
            formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[name] = new Set();
          }
          formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[name]?.add(
            publish as Dispatch<SetStateAction<FormValidations<T, keyof T>>>,
          );
          publish(getFormErrorsForNames(names));
        });
      }
    },
    [getFormErrors, getFormErrorsForNames],
  );

  const registerField = useCallback<FormInternal<T>['registerField']>(
    <K extends keyof T>(name: K, setValue: (value: T[K] | undefined) => void): void => {
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

      /*
     Add subscriber has to be setValue saving array. Here, the publisher needs only the first value
     (and the only one) returned in values, so we created a function to do the mapping
     */
      addValueSubscriber<K>(
        (publish) => {
          // FIXME publish({} as FormValues<T, K>)
          const values = typeof publish === 'function' ? publish({} as FormValues<T, K>) : publish;
          setValue(values?.[name]);
        },
        WATCH_MODE.ON_CHANGE,
        [name],
      );
      updateValueForAllTypeOfSubscribers(name);
    },
    [addValueSubscriber, updateValueForAllTypeOfSubscribers],
  );

  const unregisterField = useCallback<FormInternal<T>['unregisterField']>(
    (name: keyof T): void => {
      if (!formStateRef.current[name]) {
        throw new Error(`Field ${String(name)} is not registered`);
      }

      formStateRef.current[name]!.isRegistered = false;
      updateValueForAllTypeOfSubscribers(name);
      updateErrorForAllTypeOfSubscribers(name);
    },
    [updateValueForAllTypeOfSubscribers, updateErrorForAllTypeOfSubscribers],
  );

  const removeGlobalValueSubscriber = useCallback<FormInternal<T>['removeGlobalValueSubscriber']>(
    (publish: Dispatch<SetStateAction<Partial<T>>>, watchMode: WATCH_MODE): void => {
      formValuesSubscribersRef.current[watchMode].global.delete(publish as Dispatch<SetStateAction<Partial<T>>>);
    },
    [],
  );

  const removeValueSubscriber = useCallback<FormInternal<T>['removeValueSubscriber']>(
    <K extends keyof T>(
      publish: Dispatch<SetStateAction<FormValues<T, K>>>,
      watchMode: WATCH_MODE,
      names: K[],
    ): void => {
      names.forEach((name) => {
        formValuesSubscribersRef.current[watchMode].scoped[name]?.delete(
          publish as Dispatch<SetStateAction<FormValues<T, keyof T>>>,
        );
      });
    },
    [],
  );

  const removeValidationStatusSubscriber = useCallback<FormInternal<T>['removeValidationStatusSubscriber']>(
    <K extends keyof T>(
      publish:
        | Dispatch<SetStateAction<FormValidations<T, keyof T>>>
        | Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>,
      names?: K[],
    ): void => {
      if (!names) {
        formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].global.delete(
          publish as Dispatch<SetStateAction<PartialRecord<keyof T, ValidationStatus | undefined>>>,
        );
        return;
      }

      names.forEach((name) => {
        formErrorsSubscribersRef.current[WATCH_MODE.ON_CHANGE].scoped[name]?.delete(
          publish as Dispatch<SetStateAction<FormValidations<T, keyof T>>>,
        );
      });
    },
    [],
  );

  const setFormValues = useCallback<FormContextApi<T>['setFormValues']>(
    (newValues: Partial<T>, eraseAll = false) => {
      if (eraseAll) {
        Object.keys(formStateRef.current).forEach((fieldName) => {
          const { name } = formStateRef.current[fieldName]!;

          if (formStateRef.current[name]) {
            formStateRef.current[name]!.value = undefined;
            updateValueForAllTypeOfSubscribers(name);
          }
        });
      }

      Object.keys(newValues).forEach((name: keyof T) => {
        // If the field is already stored, only update the value
        if (formStateRef.current[name]) {
          formStateRef.current[name]!.value = newValues[name];
        } else {
          // Else, save a new line in the context for the given name. When the field will be
          // registered later, he will have access to the value
          formStateRef.current[name] = {
            name,
            isRegistered: false,
            value: newValues[name],
            validation: VALIDATION_STATE_UNDETERMINED,
          };
        }
        updateValueForAllTypeOfSubscribers(name);
      });
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
        fieldNameOnChangeByUserRef.current = name;
      }
      // Update value in store
      formStateRef.current[name]!.value = value;
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
        onUpdateAfterBlur &&
        fieldNameOnChangeByUserRef.current === name &&
        formStateRef.current[name]!.validation.status === VALIDATION_OUTCOME.VALID
      ) {
        await onUpdateAfterBlur(name, formStateRef.current[name]!.value, data, { getFormValues, setFormValues });
      }
      fieldNameOnChangeByUserRef.current = undefined;
    },
    [updateValueSubscribers, onUpdateAfterBlur, getFormValues, setFormValues],
  );

  const updateValidationStatus = useCallback<FormInternal<T>['updateValidationStatus']>(
    (name: keyof T, validationStatus: ValidationStatus): void => {
      if (!formStateRef.current[name]) {
        throw new Error(`Field "${String(name)}" is not registered`);
      }

      formStateRef.current[name]!.validation = validationStatus;
      updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
    },
    [updateErrorSubscribers],
  );

  const resetForm = useCallback<FormContextApi<T>['resetForm']>((): void => setFormValues({}, true), [setFormValues]);

  const handleSubmit = useCallback<FormContextApi<T>['handleSubmit']>(
    (submitCallback: (formValues: Partial<T>) => void | Promise<void>) => () => {
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
        addValidationStatusSubscriber,
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
      handleSubmit,
    }),
    [
      registerField,
      unregisterField,
      addGlobalValueSubscriber,
      addValueSubscriber,
      removeGlobalValueSubscriber,
      removeValueSubscriber,
      addValidationStatusSubscriber,
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
