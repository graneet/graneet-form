import { useEffect, useState } from 'react';

const TEMPLATES = {
  'simple-form': {
    title: 'Simple Form Example - Graneet Form',
    defaultFile: 'src/simple-form.tsx',
  },
  'complex-typescript': {
    title: 'Complex TypeScript Example - Graneet Form',
    defaultFile: 'src/app.tsx',
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
}: StackBlitzEmbedProps) {
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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
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
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          height,
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}
    >
      <iframe
        key={`${name}-${theme}`}
        src={buildUrl()}
        style={{
          width: '100%',
          height,
          border: 'none',
          borderRadius: '8px',
        }}
        title={title}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        loading="lazy"
      />
    </div>
  );
}
