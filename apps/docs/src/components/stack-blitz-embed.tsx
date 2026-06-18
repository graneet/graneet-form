import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const TEMPLATES = {
  'complex-typescript': {
    defaultFile: 'src/app.tsx',
    title: 'Complex TypeScript Example - Graneet Form',
  },
  'simple-form': {
    defaultFile: 'src/simple-form.tsx',
    title: 'Simple Form Example - Graneet Form',
  },
};

interface StackBlitzEmbedProps {
  name: keyof typeof TEMPLATES;
  height?: string;
  view?: 'editor' | 'preview';
  hideExplorer?: boolean;
  hideNavigation?: boolean;
}

export function StackBlitzEmbed({
  name,
  height = '500px',
  view = 'editor',
  hideExplorer = false,
  hideNavigation = false,
}: StackBlitzEmbedProps): ReactNode {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const { title, defaultFile } = TEMPLATES[name];

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ['class'], attributes: true });
    return () => {
      observer.disconnect();
    };
  }, []);

  const buildUrl = () => {
    const baseUrl = `https://stackblitz.com/github/graneet/graneet-form/tree/main/examples/${name}`;
    const params = new URLSearchParams({
      embed: '1',
      file: defaultFile,
      theme,
      ...(view && { view }),
      ...(hideExplorer && { hideExplorer: '1' }),
      ...(hideNavigation && { hideNavigation: '1' }),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  if (!mounted) {
    return (
      <div
        style={{
          alignItems: 'center',
          background: '#f8f9fa',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          height,
          justifyContent: 'center',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
      }}
    >
      <iframe
        key={`${name}-${theme}`}
        src={buildUrl()}
        style={{
          border: 'none',
          borderRadius: '8px',
          height,
          width: '100%',
        }}
        title={title}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        // oxlint-disable-next-line react/iframe-missing-sandbox
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        loading="lazy"
      />
    </div>
  );
}
