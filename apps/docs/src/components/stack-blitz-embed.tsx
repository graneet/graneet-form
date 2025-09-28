const TEMPLATES = {
  'simple-form': {
    title: 'Simple Form Example - Graneet Form',
    defaultFile: 'src/SimpleForm.tsx',
  },
};

interface StackBlitzEmbedProps {
  /** The path within the repository (e.g., 'examples/simple-form') */
  name: keyof typeof TEMPLATES;

  /** The height of the iframe (default: '500px') */
  height?: string;

  /** The theme to use (light/dark) */
  theme?: 'light' | 'dark';

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
  theme = 'light',
  view = 'editor',
  hideExplorer = false,
  hideNavigation = false,
}: StackBlitzEmbedProps) {
  const { title, defaultFile } = TEMPLATES[name];

  // Build the StackBlitz URL
  const buildUrl = () => {
    const baseUrl = `https://stackblitz.com/github/graneet/graneet-form/tree/main/examples/${name}?file=${defaultFile}`;

    // Add embed parameter
    const params = new URLSearchParams({
      embed: '1',
      ...(defaultFile && { file: defaultFile }),
      ...(theme && { theme }),
      ...(view && { view }),
      ...(hideExplorer && { hideExplorer: '1' }),
      ...(hideNavigation && { hideNavigation: '1' }),
    });

    return `${baseUrl}?${params.toString()}`;
  };

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

// Pre-configured component for the simple form example
export function SimpleFormEmbed() {
  return <StackBlitzEmbed name="simple-form" height="600px" hideNavigation={false} />;
}
