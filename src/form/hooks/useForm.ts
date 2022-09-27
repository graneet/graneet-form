import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from 'react';
import { VALIDATION_OUTCOME, ValidationStatus, AnyRecord, FieldValues } from '../../shared';
import { FormContextApi } from '../contexts/FormContext';
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
  type FormState = {
    [K in keyof T]?: FieldState<K>;
  };
  const formStateRef = useRef<FormState>({});
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

  /**
   * Returns all displayed fields values
   * @example
   * ```
   * const { getFormValues } = useForm();
   * console.log(getFormValues());
   * // {"input1": "value1", "input1": "value1",}
   * ```
   */
  const getFormValues = useCallback((): Partial<T> => {
    return Object.keys(formStateRef.current).reduce<Partial<T>>((acc, name: keyof T) => {
      if (formStateRef.current[name]?.isRegistered) {
        acc[name] = formStateRef.current[name]?.value;
      }
      return acc;
    }, {});
  }, []);

  /**
   * Returns displayed fields values for a list of names
   * @param names Array of field names
   */
  const getFormValuesForNames = useCallback(<K extends keyof T>(names: K[]): FormValues<T, K> => {
    return names.reduce<FormValues<T, K>>((acc, name) => {
      if (formStateRef.current[name]?.isRegistered) {
        acc[name] = formStateRef.current[name]?.value;
      }
      return acc;
    }, {} as FormValues<T, K>);
  }, []);

  /**
   * Returns all displayed fields validation statuses
   */
  const getFormErrors = useCallback((): PartialRecord<keyof T, ValidationStatus> => {
    return Object.keys(formStateRef.current).reduce<PartialRecord<keyof T, ValidationStatus>>((acc, name: keyof T) => {
      if (formStateRef.current[name]?.isRegistered) {
        acc[name] = formStateRef.current[name]?.validation;
      }
      return acc;
    }, {});
  }, []);

  /**
   * Returns displayed fields errors for a list of names
   * @param names Array of field names
   */
  const getFormErrorsForNames = useCallback(
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
   * Update every subscriber of value for a given field name
   * @param name Field name
   * @param watchMode Type of subscriber updated
   */
  const updateValueSubscribers = useCallback(
    (name: keyof T, watchMode: WATCH_MODE): void => {
      // Update watcher for this field name
      if (formValuesSubscribersRef.current[watchMode].scoped[name]) {
        formValuesSubscribersRef.current[watchMode].scoped[name]?.forEach((publish) => {
          /*
           * publish is the function given by react hook useState:
           * `const [example, setExample] = useState(() => {})` It's `example`
           *
           * With the hook we can have the previous values like setExample((previousValues) => ... )
           * Here, only value of the field updated must be change so we get the previous object
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
        If there is a global subscriber and a lot of fields are render, avoid
        spam of refresh on this subscriber
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
   * Update every subscriber of error for a given field name
   * @param name Field name
   * @param watchMode Type of subscriber updated
   */
  const updateErrorSubscribers = useCallback(
    (name: keyof T, watchMode: WATCH_MODE): void => {
      // Update watcher for this field name
      if (formErrorsSubscribersRef.current[watchMode].scoped[name]) {
        formErrorsSubscribersRef.current[watchMode].scoped[name]?.forEach((publish) => {
          /*
           * publish is the function given by react hook useState:
           * `const [example, setExample] = useState(() => {})` It's `example`
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
        If there is a global subscriber and a lot of fields are render, avoid
        spam of refresh on this subscriber
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
   * Update all types of value subscribers for a given field name
   * @param name nameField name
   */
  const updateValueForAllTypeOfSubscribers = useCallback(
    (name: keyof T): void => {
      updateValueSubscribers(name, WATCH_MODE.ON_CHANGE);
      updateValueSubscribers(name, WATCH_MODE.ON_BLUR);
    },
    [updateValueSubscribers],
  );

  /**
   * Update all types of error subscribers for a given field name
   * @param name nameField name
   */
  const updateErrorForAllTypeOfSubscribers = useCallback(
    (name: keyof T): void => {
      updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
      updateErrorSubscribers(name, WATCH_MODE.ON_BLUR);
    },
    [updateErrorSubscribers],
  );

  /**
   * Unregister field. Data is still in state after un-registration
   * but field is marked as not displayed.
   * @param name Field name
   */
  const unregisterField = useCallback(
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

  /**
   * Add new subscriber watching all registered field values
   */
  const addGlobalValueSubscriber = useCallback(
    (publish: Dispatch<SetStateAction<Partial<T>>>, watchMode: WATCH_MODE) => {
      formValuesSubscribersRef.current[watchMode].global.add(publish);
      publish(getFormValues());
    },
    [getFormValues],
  );

  /**
   * Add new subscriber watching a list of field values
   */
  const addValueSubscriber = useCallback(
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

  /**
   * Add new subscriber of validation status for given fields
   * @param publish Function trigger on error change
   * @param names Field names
   */
  const addValidationStatusSubscriber = useCallback(
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

  /**
   * Register field in the form state.
   * We cannot have more than one active field for a name.
   * @param name Field name
   * @param setValue Function to change Field value and trigger render
   */
  const registerField = useCallback(
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

  /**
   * Remove subscriber watching all registered field values
   */
  const removeGlobalValueSubscriber = useCallback(
    (publish: Dispatch<SetStateAction<Partial<T>>>, watchMode: WATCH_MODE): void => {
      formValuesSubscribersRef.current[watchMode].global.delete(publish as Dispatch<SetStateAction<Partial<T>>>);
    },
    [],
  );

  /**
   * Remove subscriber watching a list of field values
   */
  const removeValueSubscriber = useCallback(
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

  /**
   * Remove validation status subscriber for given fields
   * @param publish Function used to be triggered on value change
   * @param names Field names
   */
  const removeValidationStatusSubscriber = useCallback(
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

  /**
   * Change values of the form
   * @param newValues list of new values
   * @param eraseAll If true, reset all values associated to a registered field
   */
  const setFormValues = useCallback(
    (newValues: Partial<T>, eraseAll = false): void => {
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

  /**
   * Handle onChange action trigger for a field
   * DO NOT use outside of field
   * @param name Field name
   * @param value New value
   * @param hasFocus If the field has user focus
   */
  const handleOnChange = useCallback(
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

  /**
   * Handle onBlur action trigger for a field
   * DO NOT use outside of field
   * @param name Field name updated
   * @param data Data injected in onUpdateAfterBlur
   */
  const handleOnBlur = useCallback(
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

  /**
   * Update validation status for a given field
   * @param name Field name
   * @param validationStatus New status
   */
  const updateValidationStatus = useCallback(
    (name: keyof T, validationStatus: ValidationStatus): void => {
      if (!formStateRef.current[name]) {
        throw new Error(`Field "${String(name)}" is not registered`);
      }

      formStateRef.current[name]!.validation = validationStatus;
      updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
    },
    [updateErrorSubscribers],
  );

  /**
   * Reset form value and trigger form rerender
   * @example
   * ```
   * const { resetForm } = useForm();
   * const handleChange = () => resetForm();
   * ```
   */
  const resetForm = useCallback((): void => setFormValues({}, true), [setFormValues]);

  const handleSubmit = useCallback(
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
