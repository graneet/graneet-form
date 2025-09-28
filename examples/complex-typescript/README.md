# Complex TypeScript Example

This example demonstrates advanced TypeScript features with graneet-form, specifically using template literal types for dynamic field names.

## Features

- **Template Literal Types**: Uses `firstName-${number}` type for dynamic field naming
- **Type Guards**: Implements `isFirstName` function to safely check field types
- **Dynamic Form Generation**: Creates 10 first name fields programmatically
- **Type Safety**: Full TypeScript support with proper type inference

## Key Concepts

### Template Literal Types
```typescript
type FieldName = `firstName-${number}`;
```

### Form Interface
```typescript
interface FormValues {
  [firstNameField: FieldName]: string;
  otherField: number;
}
```

### Type Guard Function
```typescript
const isFirstName = (fieldName: string): fieldName is FieldName => {
  return fieldName.split('-')[0] === 'firstName';
};
```

## Running the Example

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to see the form with:
   - 10 dynamically generated first name fields
   - 1 number field
   - A button to collect and display all first names

## Benefits

- **Type Safety**: TypeScript ensures you can only access valid field names
- **Autocomplete**: Full IDE support for field names and values
- **Runtime Safety**: Type guards provide runtime type checking
- **Scalability**: Easy to modify the number of dynamic fields