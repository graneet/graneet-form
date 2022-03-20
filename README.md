# graneet-form

# Performant forms and wizard library for React

## Features 🚀
- Performant and easy to use
- System of wizard integrated with integration of form
- Small bundle size
- Error handle
- Value watching built-in

## Install

```shell
yarn add graneet-form

# or

npm install graneet-form
```

#Usage

```tsx
import { Field, useForm } from 'graneet-form';

function Input({name}) {
  return (
    <Field
      name={name}
      render={({
        value,
        onChange,
        onBlur,
        onFocus,
      }, state) => {
        
        return (
          <input
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        );
      }}
    />
  )
}


function App() {
  const form = useForm();
  
  const handleClick = () => form.getFormValues();
  
  return (
    <Form form={form}>
      <Input name="firstName" /> 
      <button onClick={handleClick} />
    </Form>
  )
}
```
