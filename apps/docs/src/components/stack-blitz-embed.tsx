'use client';

import { useTheme } from 'next-themes';
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
  /** The path within the repository (e.g., 'examples/simple-form') */
  name: keyof typeof TEMPLATES;

  /** The height of the iframe (default: '500px') */
  height?: string;

  /** The default view (editor/preview) */
  view?: 'editor' | 'preview';

  /** Hide the file explorer */
  hideExplorer?: boolean;

  /** Hide navigation */
  hideNavigation?: boolean;
}

export function StackBlitzEmbed({
  name,
  height = '500px',
  view = 'editor',
  hideExplorer = false,
  hideNavigation = false,
}: StackBlitzEmbedProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { title, defaultFile } = TEMPLATES[name];

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Build the StackBlitz URL
  const buildUrl = () => {
    const baseUrl = `https://stackblitz.com/github/graneet/graneet-form/tree/main/examples/${name}`;

    // Use resolvedTheme for more reliable theme detection
    const currentTheme = resolvedTheme || theme || 'light';
    const stackblitzTheme = currentTheme === 'dark' ? 'dark' : 'light';

    // Add embed parameter
    const params = new URLSearchParams({
      embed: '1',
      file: defaultFile,
      theme: stackblitzTheme,
      ...(view && { view }),
      ...(hideExplorer && { hideExplorer: '1' }),
      ...(hideNavigation && { hideNavigation: '1' }),
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Don't render until mounted to prevent hydration mismatch
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

  const currentTheme = resolvedTheme || theme || 'light';
  const stackblitzTheme = currentTheme === 'dark' ? 'dark' : 'light';

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
        key={`${name}-${stackblitzTheme}`} // Force re-render when theme changes
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
