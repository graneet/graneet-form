import type { FC } from 'react';

type ModelExample =
  | 'simple-form'
  | 'subscriber-form'
  | 'validation-form'
  | 'hidden-field-form'
  | 'template-literal-form';

interface IIFrame {
  model: ModelExample;
}

const getExample = (model: ModelExample) => {
  switch (model) {
    case 'simple-form':
      return 'https://stackblitz.com/edit/stackblitz-starters-zyuyxa?embed=1&file=src%2FApp.tsx';
    case 'subscriber-form':
      return 'https://stackblitz.com/edit/stackblitz-starters-9vkwzv?file=src%2FApp.tsx';
    case 'validation-form':
      return 'https://stackblitz.com/edit/stackblitz-starters-ynkzuv?file=src%2FApp.tsx';
    case 'hidden-field-form':
      return 'https://stackblitz.com/edit/stackblitz-starters-3jztj4?file=src%2FApp.tsx';
    case 'template-literal-form':
      return 'https://stackblitz.com/edit/stackblitz-starters-z5a6zf?file=src%2FApp.tsx';
  }
};

export const IFrame: FC<IIFrame> = ({ model }) => {
  return (
    <div style={{ width: '100%', height: '45rem' }}>
      <iframe title="example" width="100%" height="100%" src={getExample(model)} />
    </div>
  );
};
