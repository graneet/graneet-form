import { Field, Form, useForm } from 'graneet-form';
import type { FC, InputHTMLAttributes } from 'react';

type FieldName = `firstName-${number}`;

interface FormValues {
  [firstNameField: FieldName]: string;
  otherField: number;
}

const getFieldName = (index: number): FieldName => {
  return `firstName-${index}`;
};

const isFirstName = (fieldName: string): fieldName is FieldName => {
  return fieldName.split('-')[0] === 'firstName';
};

const MyField: FC<{ name: keyof FormValues; type?: 'number'; id?: string }> = ({ name, type, id }) => {
  return (
    <Field
      name={name}
      render={(fieldProps) => {
        const { onBlur, onChange, onFocus, value } = fieldProps;

        const handleChange: InputHTMLAttributes<HTMLInputElement>['onChange'] = (e) => {
          onChange(type === 'number' ? parseInt(e.target.value) : e.target.value);
        };

        return (
          <input
            id={id}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            value={value}
            type={type}
            style={{
              margin: '4px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        );
      }}
    />
  );
};

export const App: FC = () => {
  const form = useForm<FormValues>();

  const onClick = () => {
    const formValues = form.getFormValues();
    const values: string[] = [];

    Object.keys(formValues).forEach((key) => {
      if (isFirstName(key)) {
        const value = formValues[key];
        if (value) {
          values.push(value);
        }
      }
    });

    alert(`First names: ${values.join(', ')}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Complex TypeScript Example</h1>
      <p>This example demonstrates the use of template literal types with graneet-form.</p>

      <Form form={form}>
        <div>
          <h3>List of first names</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxWidth: '400px' }}>
            {new Array(10).fill(null).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for this static array
              <div key={index}>
                <label htmlFor={`firstName-${index}`}>First name {index + 1}:</label>
                <MyField name={getFieldName(index)} id={`firstName-${index}`} />
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '24px' }}>Other field</h3>
          <div>
            <label htmlFor="otherField">Number field:</label>
            {/** biome-ignore lint/correctness/useUniqueElementIds: <explanation> */}
            <MyField name="otherField" type="number" id="otherField" />
          </div>

          <button
            type="button"
            onClick={onClick}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Get first names
          </button>
        </div>
      </Form>
    </div>
  );
};
