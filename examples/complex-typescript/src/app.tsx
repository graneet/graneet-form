import { Field, Form, useForm } from 'graneet-form';
import type { FC, InputHTMLAttributes, ReactNode } from 'react';

type FieldName = `firstName-${number}`;

interface FormValues {
  [firstNameField: FieldName]: string;
  otherField: number;
}

const getFieldName = (index: number): FieldName => `firstName-${index}`;

const isFirstName = (fieldName: string): fieldName is FieldName => fieldName.split('-')[0] === 'firstName';

const MyField: FC<{ name: keyof FormValues; type?: 'number'; id?: string }> = ({ name, type, id }) => (
  <Field
    name={name}
    render={(fieldProps) => {
      // oxlint-disable-next-line typescript/unbound-method typescript/no-unsafe-assignment
      const { onBlur, onChange, onFocus, value } = fieldProps;

      const handleChange: InputHTMLAttributes<HTMLInputElement>['onChange'] = (e) => {
        onChange(type === 'number' ? Number.parseInt(e.target.value, 10) : e.target.value);
      };

      return (
        <input
          id={id}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          // oxlint-disable-next-line typescript/no-unsafe-assignment
          value={value}
          type={type}
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            margin: '4px',
            padding: '8px',
          }}
        />
      );
    }}
  />
);

export const App: FC = (): ReactNode => {
  const form = useForm<FormValues>();

  const onClick = () => {
    const formValues = form.getFormValues();
    const values: string[] = [];

    Object.keys(formValues).forEach((key) => {
      if (isFirstName(key)) {
        const value = formValues[key];
        if (value !== undefined) {
          values.push(value);
        }
      }
    });

    alert(`First names: ${values.join(', ')}`);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Complex TypeScript Example</h1>
      <p>This example demonstrates the use of template literal types with graneet-form.</p>

      <Form form={form}>
        <div>
          <h3>List of first names</h3>
          <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '400px' }}>
            {new Array(10).fill(null).map((_, index) => (
              // oxlint-disable-next-line react/no-array-index-key : Index is stable for this static array
              <div key={index}>
                <label htmlFor={`firstName-${index}`}>First name {index + 1}:</label>
                <MyField name={getFieldName(index)} id={`firstName-${index}`} />
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '24px' }}>Other field</h3>
          <div>
            <label htmlFor="otherField">Number field:</label>
            {/** Biome-ignore lint/correctness/useUniqueElementIds: <explanation> */}
            <MyField name="otherField" type="number" id="otherField" />
          </div>

          <button
            type="button"
            onClick={onClick}
            style={{
              backgroundColor: '#007bff',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              marginTop: '20px',
              padding: '10px 20px',
            }}
          >
            Get first names
          </button>
        </div>
      </Form>
    </div>
  );
};
