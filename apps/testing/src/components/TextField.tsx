import { Field, type FieldValues, Rule } from 'graneet-form';
import type { ChangeEventHandler } from 'react';

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

type TextFieldValue = string | undefined;

interface TextFieldProps<T extends FieldValues, K extends KeysMatching<T, TextFieldValue>> {
  name: K;
}

export function TextField<
  T extends FieldValues = Record<string, unknown>,
  K extends KeysMatching<T, TextFieldValue> = KeysMatching<T, TextFieldValue>,
>({ name }: TextFieldProps<T, K>) {
  return (
    <Field<T, K>
      name={name}
      render={(properties) => {
        const { value, onChange, onBlur, onFocus } = properties;

        const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
          onChange(e.target.value as T[K]);
        };

        return <input value={value} onChange={handleChange} onBlur={onBlur} onFocus={onFocus} />;
      }}
    >
      <Rule validationFn={(v) => !!v} message="false" />
    </Field>
  );
}
