import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  FieldValues,
  FieldValue,
  VALIDATION_OUTCOME,
  ValidationStatus,
  AnyRecord,
} from '../../shared';
import {
  FormContextApi, FormInternal, FormValidations, FormValues, PublishSubscriber,
} from '../contexts/FormContext';
import { WATCH_MODE } from '../types/WatchMode';
import { VALIDATION_STATE_UNDETERMINED } from '../types/Validation';
import { PartialRecord } from '../../shared/types/PartialRecord';

/**
 * Generate methods for form
 * @return {FormContextApi}
 * @example
 * ```
 * const form = useForm();
 * const { setFormValues } = form;
 *
 * useEffect(() => {
 *   setFormValues({"foo": "foo", "bar": "bar"})
 * },[])
 *
 * return(
 *   <Form form={form}>
 *     <TextInput name="name" />
 *   </Form>
 * )
 * ```
 */

export interface UseFormOptions<T extends Record<string, FieldValue>> {
  onUpdateAfterBlur?<K extends keyof T>(
    name: K,
    value: T[K],
    data: AnyRecord,
    formPartial: Pick<FormContextApi<T>, 'getFormValues' | 'setFormValues'>,
  ): Promise<void> | void,
}

export function useForm<T extends Record<string, FieldValue>>(
  { onUpdateAfterBlur }: UseFormOptions<T> = {},
): FormContextApi<T> {
  // -- TYPES --
  // TODO
  const { current: globalTimeout } = useRef<Record<string, Record<string, NodeJS.Timeout>>>({
    errors: {},
    values: {},
  });

  // -- FORM STATE --
  interface FieldState<K extends keyof T> {
    name: K,
    value: T[K] | undefined,
    validation: ValidationStatus,
    isRegistered: boolean,
  }
  type FormState = {
    [K in keyof T]?: FieldState<K>;
  }
  const { current: formState } = useRef<FormState>({});
  const fieldNameOnChangeByUserRef = useRef<keyof T | undefined>();

  // TODO
  const handleFormSubmitRef = useRef<(formValues: FieldValues) => (void | Promise<void>)>();

  // -- SUBSCRIPTION --

  type FormValueSubscribersRef = Record<WATCH_MODE, {
    global: Set<Dispatch<SetStateAction<Partial<T>>>>,
    scoped: PartialRecord<keyof T, Set<Dispatch<SetStateAction<FormValues<T, keyof T>>>> | undefined>,
  }>;

  const { current: formValuesSubscribers } = useRef<FormValueSubscribersRef>({
    [WATCH_MODE.ON_CHANGE]: {
      global: new Set<Dispatch<SetStateAction<Partial<T>>>>(),
      scoped: {},
    },
    [WATCH_MODE.ON_BLUR]: {
      global: new Set<Dispatch<SetStateAction<Partial<T>>>>(),
      scoped: {},
    },
  });

  // TODO
  type FormErrorSubscribersRef = Record<WATCH_MODE, {
    global: Set<Dispatch<SetStateAction<Record<keyof T, ValidationStatus | undefined>>>>,
    scoped: PartialRecord<keyof T, Set<Dispatch<SetStateAction<FormValidations<T, keyof T>>>>>,
  }>;
  const { current: formErrorsSubscribers } = useRef<FormErrorSubscribersRef>({
    [WATCH_MODE.ON_CHANGE]: {
      global: new Set<Dispatch<SetStateAction<Record<keyof T, ValidationStatus | undefined>>>>(),
      scoped: {},
    },
    [WATCH_MODE.ON_BLUR]: {
      global: new Set<Dispatch<SetStateAction<Record<keyof T, ValidationStatus | undefined>>>>(),
      scoped: {},
    },
  });

  // -- Utils
  /**
   * Run function for every field of FormState with FormFieldState on parameters
   * @param fn
   */
  // TODO
  const eachField = useCallback((fn: (infos: FieldState) => void): void => {
    Object.keys(formState).forEach((fieldName) => {
      fn(formState[fieldName]);
    });
  }, [formState]);

  // -- EXPORTS --

  /**
   * Get values registered for an array of field names
   * @param names Array of field names
   */
  const getFormValuesForNames = useCallback<FormInternal<T>['getFormValuesForNames']>(<K extends keyof T>(
    names?: K[],
  ): any => {
    // Get all values of form
    if (!names) {
      const values: Partial<T> = {};
      (Object.keys(formState) as K[]).forEach((name) => {
        if (formState[name]?.isRegistered) {
          values[name] = formState[name]?.value;
        }
      });
      return values;
    }

    // Get values for specific fields
    const values = {} as FormValues<T, K>;
    names.forEach((name) => {
      if (formState[name]?.isRegistered) {
        values[name] = formState[name]?.value;
      }
    });
    return values;
  }, [formState]);

  /**
   * Get values for an array of field names. Return only errors of registered fields
   * @param names Array of field names
   */
  const getFormErrorsForNames = useCallback<FormInternal<T>['getFormErrorsForNames']>(<K extends keyof T>(
    names?: K[],
  ): any => {
    // Get all errors of form
    if (!names) {
      const validations: PartialRecord<keyof T, ValidationStatus> = {};
      (Object.keys(formState) as K[]).forEach((name) => {
        if (formState[name]?.isRegistered) {
          validations[name] = formState[name]?.validation;
        }
      });
      return validations;
    }

    // Get errors for specific fields
    const validations = {} as Record<K, ValidationStatus | undefined>;
    names.forEach((name) => {
      if (formState[name]?.isRegistered) {
        validations[name] = formState[name]?.validation;
      }
    });
    return validations;
  }, [formState]);

  /**
   * Return values of displayed fields
   * @example
   * ```
   * const { getFormValues } = useForm();
   * console.log(getFormValues());
   * // {"input1": "value1", "input1": "value1",}
   * ```
   */
  const getFormValues = useCallback(() => getFormValuesForNames(), [getFormValuesForNames]);

  /**
   * Update every subscriber of value for a given field name
   * @param name Field name
   * @param watchMode Type of subscriber updated
   */
  const updateValueSubscribers = useCallback((name: keyof T, watchMode: WATCH_MODE): void => {
    // Update watcher for this field name
    if (formValuesSubscribers[watchMode].scoped[name]) {
      formValuesSubscribers[watchMode].scoped[name]!
        .forEach((publish) => {
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
            [name]: formState[name]?.isRegistered ? formState[name]?.value : undefined,
          }));
        });
    }

    if (formValuesSubscribers[watchMode].global.size) {
      /*
        If there is a global subscriber and a lot of fields are render, avoid
        spam of refresh on this subscriber
       */
      clearTimeout(globalTimeout.values[watchMode]);
      globalTimeout.values[watchMode] = setTimeout(() => {
        const formValues = getFormValues();
        // Update global watcher
        formValuesSubscribers[watchMode].global.forEach((publish) => {
          // To be simpler, send value returned by getFormValues method
          publish(formValues);
        });
      }, 0);
    }
  }, [formValuesSubscribers, formState, getFormValues, globalTimeout]);

  /**
   * Update every subscriber of error for a given field name
   * @param name Field name
   * @param watchMode Type of subscriber updated
   */
  const updateErrorSubscribers = useCallback((name: keyof T, watchMode: WATCH_MODE): void => {
    // Update watcher for this field name
    if (formErrorsSubscribers[watchMode].scoped[name]) {
      formErrorsSubscribers[watchMode].scoped[name]!
        .forEach((publish) => {
          /*
           * publish is the function given by react hook useState:
           * `const [example, setExample] = useState(() => {})` It's `example`
           *
           * With the hook we can have the previous values like setExample((previousValues) => ... )
           * Here, only value of the field updated must be change, so we get the previous object
           * and we change value with key [name] with the new value
           */
          publish((previous) => {
            const previousCopy = previous;
            if (!formState[name]?.isRegistered) {
              delete previousCopy[name];
            } else {
              previousCopy[name] = formState[name]?.validation;
            }
            return previousCopy;
          });
        });
    }
    if (formErrorsSubscribers[watchMode].global.size) {
      /*
        If there is a global subscriber and a lot of fields are render, avoid
        spam of refresh on this subscriber
       */
      clearTimeout(globalTimeout.errors[watchMode]);
      globalTimeout.errors[watchMode] = setTimeout(() => {
        const formValues = getFormErrorsForNames();
        // Update global watcher
        formErrorsSubscribers[watchMode].global.forEach((publish) => {
          // To be simpler, send value returned by getFormValues method
          publish(formValues);
        });
      }, 0);
    }
  }, [formErrorsSubscribers, formState, getFormErrorsForNames, globalTimeout]);

  /**
   * Update all types of value subscribers for a given field name
   * @param name nameField name
   */
  const updateValueForAllTypeOfSubscribers = useCallback((name: keyof T): void => {
    updateValueSubscribers(name, WATCH_MODE.ON_CHANGE);
    updateValueSubscribers(name, WATCH_MODE.ON_BLUR);
  }, [updateValueSubscribers]);

  /**
   * Update all types of error subscribers for a given field name
   * @param name nameField name
   */
  const updateErrorForAllTypeOfSubscribers = useCallback((name: keyof T): void => {
    updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
    updateErrorSubscribers(name, WATCH_MODE.ON_BLUR);
  }, [updateErrorSubscribers]);

  /**
   * Unregister field. Data is still in state after un-registration
   * but field is marked as not displayed.
   * @param name Field name
   */
  const unregisterField = useCallback((name: keyof T): void => {
    if (!formState[name]) {
      throw new Error(`Field ${String(name)} is not registered`);
    }

    formState[name]!.isRegistered = false;
    updateValueForAllTypeOfSubscribers(name);
    updateErrorForAllTypeOfSubscribers(name);
  }, [formState, updateValueForAllTypeOfSubscribers, updateErrorForAllTypeOfSubscribers]);

  /**
   * Add new subscriber of values for given fields
   * @param publish Function trigger on value change
   * @param watchMode Type of watcher
   * @param names Field names
   */
  const addValueSubscriber = useCallback<FormInternal<T>['addValueSubscriber']>(<K extends keyof T>(
    publish: Dispatch<SetStateAction<FormValues<T, K>>> | Dispatch<SetStateAction<Partial<T>>>,
    watchMode: WATCH_MODE,
    names?: (keyof T)[],
  ) => {
    if (!names) {
      formValuesSubscribers[watchMode].global.add(publish as Dispatch<SetStateAction<Partial<T>>>);
      return;
    }

    names.forEach((name) => {
      if (!formValuesSubscribers[watchMode].scoped[name]) {
        formValuesSubscribers[watchMode].scoped[name] = new Set();
      }
      formValuesSubscribers[watchMode].scoped[name]!.add(publish as Dispatch<SetStateAction<FormValues<T, keyof T>>>);
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    publish(getFormValuesForNames(names) as FormValues<T, K>);
  }, [formValuesSubscribers, getFormValuesForNames]);

  /**
   * Add new subscriber of validation status for given fields
   * @param publish Function trigger on error change
   * @param names Field names
   */
  // TODO
  const addValidationStatusSubscriber = useCallback((
    publish: PublishSubscriber<ValidationStatus>,
    names?: string[],
  ): void => {
    if (!names) {
      formErrorsSubscribers[WATCH_MODE.ON_CHANGE].global.add(publish);
      return;
    }
    names.forEach((name) => {
      if (!formErrorsSubscribers[WATCH_MODE.ON_CHANGE].scoped[name]) {
        formErrorsSubscribers[WATCH_MODE.ON_CHANGE].scoped[name] = new Set();
      }
      formErrorsSubscribers[WATCH_MODE.ON_CHANGE].scoped[name].add(publish);
    });

    publish(getFormErrorsForNames(names));
  }, [formErrorsSubscribers, getFormErrorsForNames]);

  /**
   * Register field in the form state.
   * We cannot have more than one active field for a name.
   * @param name Field name
   * @param setValue Function to change Field value and trigger render
   */
  const registerField = useCallback(<K extends keyof T>(
    name: K,
    setValue: (value: T[K] | undefined) => void,
  ): void => {
    const previousValueStored = formState[name]?.value;
    if (formState[name]?.isRegistered) {
      throw new Error(`Attempting to register field "${String(name)}" a second time`);
    }

    formState[name] = {
      name,
      isRegistered: true,
      value: previousValueStored,
      validation: VALIDATION_STATE_UNDETERMINED,
    };

    /*
     Add subscriber has to be setValue saving array. Here, the publisher needs only the first value
     (and the only one) returned in values, so we created a function to do the mapping
     */
    addValueSubscriber(
      (publish) => {
        // FIXME publish({} as FormValues<T, K>)
        const values = typeof publish === 'function' ? publish({} as FormValues<T, K>) : publish;
        setValue(values?.[name]);
      },
      WATCH_MODE.ON_CHANGE,
      [name],
    );
    updateValueForAllTypeOfSubscribers(name);
  }, [formState, addValueSubscriber, updateValueForAllTypeOfSubscribers]);

  /**
   * Remove subscriber for given fields in the list of subscribers given
   * @param publish Function used to be triggered on value change
   * @param watchMode Type of watcher
   * @param formSubscriber List of subscribers to update
   * @param names Field names
   */
  // TODO
  const removeSubscriber = useCallback(<Value extends FieldValue | ValidationStatus>(
    publish: PublishSubscriber<Value>,
    watchMode: WATCH_MODE,
    formSubscriber: FormValueSubscribersRef<Value>,
    names?: string[],
  ): void => {
    if (!names) {
      formSubscriber[watchMode].global.delete(publish);
      return;
    }
    names.forEach((name: string) => {
      formSubscriber[watchMode].scoped[name].delete(publish);
    });
  }, []);

  /**
   * Remove values subscriber for given fields
   * @param publish Function used to be triggered on value change
   * @param watchMode Type of watcher
   * @param names Field names
   */
  // TODO
  const removeValueSubscriber = useCallback((
    publish: PublishSubscriber<FieldValue>,
    watchMode: WATCH_MODE,
    names?: string[],
  ): void => {
    removeSubscriber<FieldValue>(
      publish,
      watchMode,
      formValuesSubscribers,
      names,
    );
  }, [formValuesSubscribers, removeSubscriber]);

  /**
   * Remove validation status subscriber for given fields
   * @param publish Function used to be triggered on value change
   * @param names Field names
   */
  // TODO
  const removeValidationStatusSubscriber = useCallback((
    publish: PublishSubscriber<ValidationStatus>,
    names?: string[],
  ): void => {
    removeSubscriber<ValidationStatus>(
      publish,
      WATCH_MODE.ON_CHANGE,
      formErrorsSubscribers,
      names,
    );
  }, [formErrorsSubscribers, removeSubscriber]);

  /**
   * Change values of the form
   * @param newValues list of new values
   * @param eraseAll If true, reset all values associated to a registered field
   */
  // TODO
  const setFormValues = useCallback((
    newValues: FieldValues,
    eraseAll = false,
  ): void => {
    if (eraseAll) {
      eachField(({ name }) => {
        formState[name].value = undefined;
        updateValueForAllTypeOfSubscribers(name);
      });
    }

    Object.keys(newValues).forEach((name) => {
      // If the field is already stored, only update the value
      if (formState[name]) {
        formState[name].value = newValues[name];
      } else {
        // Else, save a new line in the context for the given name. When the field will be
        // registered later, he will have access to the value
        formState[name] = {
          name,
          isRegistered: false,
          value: newValues[name],
          validation: VALIDATION_STATE_UNDETERMINED,
        };
      }
      updateValueForAllTypeOfSubscribers(name);
    });
  }, [eachField, formState, updateValueForAllTypeOfSubscribers]);

  /**
   * Handle onChange action trigger for a field
   * DO NOT use outside of field
   * @param name Field name
   * @param value New value
   * @param isUserInput Is changed is from user input
   */
  // TODO
  const handleOnChange = useCallback((name: string, value: FieldValue, hasFocus: boolean): void => {
    if (formState[name].value === value) {
      return;
    }
    // Keep field name to know on blur if the field has been updated by user input
    if (hasFocus) {
      fieldNameOnChangeByUserRef.current = name;
    }
    // Update value in store
    formState[name].value = value;
    updateValueSubscribers(name, WATCH_MODE.ON_CHANGE);
  }, [formState, updateValueSubscribers]);

  /**
   * Handle onBlur action trigger for a field
   * DO NOT use outside of field
   * @param name Field name updated
   * @param data Data injected in onUpdateAfterBlur
   */
  // TODO
  const handleOnBlur = useCallback(async (name: string, data: AnyRecord = {}): Promise<void> => {
    updateValueSubscribers(name, WATCH_MODE.ON_BLUR);
    if (
      onUpdateAfterBlur
      && fieldNameOnChangeByUserRef.current === name
      && formState[name].validation.status === VALIDATION_OUTCOME.VALID
    ) {
      await onUpdateAfterBlur(name, formState[name].value, data, { getFormValues, setFormValues });
    }
    fieldNameOnChangeByUserRef.current = undefined;
  }, [updateValueSubscribers, onUpdateAfterBlur, formState, getFormValues, setFormValues]);

  /**
   * Update validation status for a given field
   * @param name Field name
   * @param validationStatus New status
   */
  // TODO
  const updateValidationStatus = useCallback((
    name: string,
    validationStatus: ValidationStatus,
  ): void => {
    formState[name].validation = validationStatus;
    updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
  }, [formState, updateErrorSubscribers]);

  /**
   * Reset form value and trigger form rerender
   * @example
   * ```
   * const { resetForm } = useForm();
   * const handleChange = () => resetForm();
   * ```
   */
  // TODO
  const resetForm = useCallback((): void => setFormValues({}, true), [setFormValues]);

  // TODO
  const handleSubmit = useCallback((submitCallback: (formValues: FieldValues) => void | Promise<void>) => () => {
    handleFormSubmitRef.current = submitCallback;
  }, []);

  return useMemo<FormContextApi<T>>(() => ({
    formInternal: {
      registerField,
      unregisterField,
      addValueSubscriber,
      removeValueSubscriber,
      addValidationStatusSubscriber,
      removeValidationStatusSubscriber,
      handleOnChange,
      handleOnBlur,
      getFormValuesForNames,
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
  }), [
    registerField,
    unregisterField,
    addValueSubscriber,
    removeValueSubscriber,
    addValidationStatusSubscriber,
    removeValidationStatusSubscriber,
    handleOnChange,
    handleOnBlur,
    getFormValuesForNames,
    getFormErrorsForNames,
    updateValidationStatus,
    getFormValues,
    resetForm,
    setFormValues,
    handleSubmit,
  ]);
}
