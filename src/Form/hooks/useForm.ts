import { useCallback, useMemo, useRef } from 'react';
import {
  FieldValues,
  FieldValue,
  VALIDATION_OUTCOME,
  ValidationStatus,
  AnyRecord,
} from '../../shared';
import { FormContextApi, PublishSubscriber } from '../contexts/FormContext';
import { WATCH_MODE } from '../types/WatchMode';
import { VALIDATION_STATE_UNDETERMINED } from '../types/Validation';

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

export interface UseFormOptions {
  onUpdateAfterBlur?: (
    name: string,
    value: FieldValue,
    data: AnyRecord,
    formPartial: Pick<FormContextApi, 'getFormValues' | 'setFormValues'>,
  ) => Promise<void> | void,
}

export function useForm({ onUpdateAfterBlur }: UseFormOptions = {}): FormContextApi {
  // -- TYPES --
  interface FieldState {
    name: string,
    value: FieldValue,
    validation: ValidationStatus,
    isRegistered: boolean,
  }

  type EachFieldCallback = (infos: FieldState) => void;

  type FormSubscriber<T extends FieldValue | ValidationStatus> =
    Record<string, Set<PublishSubscriber<T>>>;

  interface FormSubscribersScope<T extends FieldValue | ValidationStatus> {
    global: Set<PublishSubscriber<T>>,
    scoped: FormSubscriber<T>,
  }

  const { current: globalTimeout } = useRef<Record<string, Record<string, NodeJS.Timeout>>>({
    errors: {},
    values: {},
  });

  // -- FORM STATE --
  const { current: formState } = useRef<Record<string, FieldState>>({});
  const fieldNameOnChangeByUserRef = useRef<string | undefined>();

  const handleFormSubmitRef = useRef<(formValues: FieldValues) => (void | Promise<void>)>();

  /**
   * Run function for every field of FormState with FormFieldState on parameters
   * @param fn
   */
  const eachField = useCallback((fn: EachFieldCallback): void => {
    Object.keys(formState).forEach((fieldName) => {
      fn(formState[fieldName]);
    });
  }, [formState]);

  // -- SUBSCRIPTION --

  type FormSubscribersRef<T extends FieldValue | ValidationStatus> =
    Record<WATCH_MODE, FormSubscribersScope<T>>;

  const { current: formValuesSubscribers } = useRef<FormSubscribersRef<FieldValue>>({
    [WATCH_MODE.ON_CHANGE]: {
      global: new Set<PublishSubscriber<FieldValue>>(),
      scoped: {},
    },
    [WATCH_MODE.ON_BLUR]: {
      global: new Set<PublishSubscriber<FieldValue>>(),
      scoped: {},
    },
  });

  const { current: formErrorsSubscribers } = useRef<FormSubscribersRef<ValidationStatus>>({
    [WATCH_MODE.ON_CHANGE]: {
      global: new Set<PublishSubscriber<ValidationStatus>>(),
      scoped: {},
    },
    [WATCH_MODE.ON_BLUR]: {
      global: new Set<PublishSubscriber<ValidationStatus>>(),
      scoped: {},
    },
  });

  // -- EXPORTS --

  /**
   * Get values registered for an array of field names
   * @param names Array of field names
   */
  const getFormValuesForNames = useCallback((
    names?: string[],
  ): FieldValues => {
    const namesArr = names || Object.keys(formState);
    const values: FieldValues = {};
    namesArr.forEach((name) => {
      if (formState[name]?.isRegistered) {
        values[name] = formState[name].value;
      }
    });
    return values;
  }, [formState]);

  /**
   * Get values for an array of field names. Return only errors of registered fields
   * @param names Array of field names
   */
  const getFormErrorsForNames = useCallback((
    names?: string[],
  ): Record<string, ValidationStatus> => {
    const namesArr = names || Object.keys(formState);
    const validations: Record<string, ValidationStatus> = {};
    namesArr.forEach((name) => {
      if (formState[name]?.isRegistered) {
        validations[name] = formState[name].validation;
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
  const getFormValues = useCallback<() => FieldValues>(
    () => getFormValuesForNames(), [getFormValuesForNames]);
  /**
   * Update every subscriber of value for a given field name
   * @param name Field name
   * @param watchMode Type of subscriber updated
   */
  const updateValueSubscribers = useCallback((name: string, watchMode: WATCH_MODE): void => {
    // Update watcher for this field name
    if (formValuesSubscribers[watchMode].scoped[name]) {
      formValuesSubscribers[watchMode].scoped[name]
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
            [name]: formState[name].isRegistered ? formState[name].value : undefined,
          }));
        });
    }

    if (formValuesSubscribers[watchMode].global.size) {
      /*
        If there is a global subscriber and lot of fields are render, avoid
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
  const updateErrorSubscribers = useCallback((name: string, watchMode: WATCH_MODE): void => {
    // Update watcher for this field name
    if (formErrorsSubscribers[watchMode].scoped[name]) {
      formErrorsSubscribers[watchMode].scoped[name]
        .forEach((publish) => {
          /*
           * publish is the function given by react hook useState:
           * `const [example, setExample] = useState(() => {})` It's `example`
           *
           * With the hook we can have the previous values like setExample((previousValues) => ... )
           * Here, only value of the field updated must be change so we get the previous object
           * and we change value with key [name] with the new value
           */
          publish((previous) => {
            const previousCopy = { ...previous };
            if (!formState[name].isRegistered) {
              delete previousCopy[name];
            } else {
              previousCopy[name] = formState[name].validation;
            }
            return previousCopy;
          });
        });
    }
    if (formErrorsSubscribers[watchMode].global.size) {
      /*
        If there is a global subscriber and lot of fields are render, avoid
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
  const updateValueForAllTypeOfSubscribers = useCallback((name: string): void => {
    updateValueSubscribers(name, WATCH_MODE.ON_CHANGE);
    updateValueSubscribers(name, WATCH_MODE.ON_BLUR);
  }, [updateValueSubscribers]);

  /**
   * Update all types of error subscribers for a given field name
   * @param name nameField name
   */
  const updateErrorForAllTypeOfSubscribers = useCallback((name: string): void => {
    updateErrorSubscribers(name, WATCH_MODE.ON_CHANGE);
    updateErrorSubscribers(name, WATCH_MODE.ON_BLUR);
  }, [updateErrorSubscribers]);

  /**
   * Unregister field. Data is still in state after un-registration
   * but field is marked as not displayed.
   * @param name Field name
   */
  const unregisterField = useCallback((name: string): void => {
    formState[name].isRegistered = false;
    updateValueForAllTypeOfSubscribers(name);
    updateErrorForAllTypeOfSubscribers(name);
  }, [formState, updateValueForAllTypeOfSubscribers, updateErrorForAllTypeOfSubscribers]);

  /**
   * Add new subscriber for given fields
   * @param publish Function trigger on value change
   * @param watchMode Type of watcher
   * @param formSubscriber List of subscribers updated
   * @param names Field names
   */
  const addSubscriber = useCallback(<T extends FieldValue | ValidationStatus>(
    publish: PublishSubscriber<T>,
    watchMode: WATCH_MODE,
    formSubscriber: FormSubscribersRef<T>,
    names?: string[],
  ): void => {
    const formSubscriberCopy = formSubscriber;

    if (!names) {
      formSubscriberCopy[watchMode].global.add(publish);
      return;
    }
    names.forEach((name) => {
      if (!formSubscriberCopy[watchMode].scoped[name]) {
        formSubscriberCopy[watchMode].scoped[name] = new Set();
      }
      formSubscriberCopy[watchMode].scoped[name].add(publish);
    });
  }, []);

  /**
   * Add new subscriber of values for given fields
   * @param publish Function trigger on value change
   * @param watchMode Type of watcher
   * @param names Field names
   */
  const addValueSubscriber = useCallback((
    publish: PublishSubscriber<FieldValue>,
    watchMode: WATCH_MODE,
    names?: string[],
  ): void => {
    addSubscriber<FieldValue>(
      publish,
      watchMode,
      formValuesSubscribers,
      names,
    );
    publish(getFormValuesForNames(names));
  }, [addSubscriber, formValuesSubscribers, getFormValuesForNames]);

  /**
   * Add new subscriber of validation status for given fields
   * @param publish Function trigger on error change
   * @param names Field names
   */
  const addValidationStatusSubscriber = useCallback((
    publish: PublishSubscriber<ValidationStatus>,
    names?: string[],
  ): void => {
    addSubscriber<ValidationStatus>(
      publish,
      WATCH_MODE.ON_CHANGE,
      formErrorsSubscribers,
      names,
    );
    publish(getFormErrorsForNames(names));
  }, [addSubscriber, formErrorsSubscribers, getFormErrorsForNames]);

  /**
   * Register field in the form state.
   * We cannot have more than one active field for a name.
   * @param name Field name
   * @param setValue Function to change Field value and trigger render
   */
  const registerField = useCallback((name: string, setValue: (value: FieldValue) => void): void => {
    const previousValueStored = formState[name]?.value;
    if (formState[name]?.isRegistered) {
      throw new Error(`Attempting to register field "${name}" a second time`);
    }

    formState[name] = {
      name,
      isRegistered: true,
      value: previousValueStored,
      validation: VALIDATION_STATE_UNDETERMINED,
    };

    /*
     Add subscriber has to be setValue saving array. Here, the publisher needs only the first value
     (and the only one) returned in values so we created a function to do the mapping
     */
    addValueSubscriber(
      (publish) => {
        const values = typeof publish === 'function' ? publish({}) : publish;
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
  const removeSubscriber = useCallback(<T extends FieldValue | ValidationStatus>(
    publish: PublishSubscriber<T>,
    watchMode: WATCH_MODE,
    formSubscriber: FormSubscribersRef<T>,
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
  const resetForm = useCallback((): void => setFormValues({}, true), [setFormValues]);

  const handleSubmit = useCallback((submitCallback: (formValues: FieldValues) => void | Promise<void>) => () => {
    handleFormSubmitRef.current = submitCallback;
  }, []);

  return useMemo<FormContextApi>(() => ({
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
