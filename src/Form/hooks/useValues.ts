import {
  useEffect,
  useState,
} from 'react';
import { FieldValues } from '../../shared';
import {
  CONTEXT_FORM_DEFAULT,
  FormContextApi,
  useFormContext,
} from '../contexts/FormContext';
import { WATCH_MODE } from '../types/WatchMode';

/**
 * Hook to watch values.
 * If names is not defined, watch all values
 * @param watchMode OnBlur or OnChange
 * @param names (optional) Field names
 * @param form (optional) form to use. If it's not given, form context is used.
 */
function useValues(
  watchMode: WATCH_MODE,
  names?: string[],
  form?: FormContextApi,
): FieldValues {
  const formContext = useFormContext();
  const {
    formInternal: {
      addValueSubscriber,
      removeValueSubscriber,
    },
  } = form || formContext;
  const [currentValues, setCurrentValues] = useState<FieldValues>({});

  if (!form && formContext === CONTEXT_FORM_DEFAULT) {
    throw new Error('No form context could be found while calling "useValues".');
  }

  useEffect(() => {
    addValueSubscriber(setCurrentValues, watchMode, names);
    return () => removeValueSubscriber(setCurrentValues, watchMode, names);
    // names is transformed to string to ensure consistant ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValueSubscriber, removeValueSubscriber, watchMode, names?.join()]);

  return currentValues;
}

/**
 * Watch field with updates onChange
 * If `names` is not specified, watch all values
 * @param names (optional) Field names
 * @param form (optional) form to use
 * @return
 * ```
 *   const { foo } = useOnChangeValues(['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   },[])
 * ```
 */
export function useOnChangeValues(
  names?: string[],
  form?: FormContextApi,
): FieldValues {
  return useValues(WATCH_MODE.ON_CHANGE, names, form);
}

/**
 * Watch field with updates onBlur
 * If `names` is not specified, watch all values
 * @param names (optional) Field names
 * @param form (optional) form to use
 * @return
 * ```
 *   const { foo } = useOnBlurValues(['foo']);
 *   useEffect(() => {
 *     console.log(foo);
 *   },[])
 * ```
 */
export function useOnBlurValues(
  names?: string[],
  form?: FormContextApi,
): FieldValues {
  return useValues(WATCH_MODE.ON_BLUR, names, form);
}
