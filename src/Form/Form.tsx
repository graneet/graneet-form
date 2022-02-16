import React, { ReactNode } from 'react';
import { FormContext, FormContextApi } from './contexts/FormContext';

interface FormProps {
  children: ReactNode,
  form: FormContextApi,
}

/**
 * Context to handle Form. Similar to <form> but using React Context
 * @param children - Children
 * @param form - Form from useForm hook
 * @example
 * ```
 * const form = useForm():
 *
 * return (
 *  <Form form={form}>
 *    <TextField name="foo" />
 *  </Form>
 * )
 * ```
 */
export function Form({ children, form }: FormProps) {
  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  );
}
