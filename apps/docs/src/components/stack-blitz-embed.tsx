interface StackBlitzEmbedProps {
  /** The path within the repository (e.g., 'examples/simple-form') */
  path?: string;
  /** The file to open by default */
  file?: string;
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
  /** Title for accessibility */
  title?: string;
}

const tt = 'https://stackblitz.com/github/graneet/graneet-form/tree/main/examples/simple-form?file=README.md';

export function StackBlitzEmbed({
  path = '',
  file,
  height = '500px',
  theme = 'light',
  view = 'editor',
  hideExplorer = false,
  hideNavigation = false,
  title = 'StackBlitz Example',
}: StackBlitzEmbedProps) {
  // Build the StackBlitz URL
  const buildUrl = () => {
    const baseUrl = `https://stackblitz.com/github/graneet/graneet-form/tree/main/${path}`;

    // Add embed parameter
    const params = new URLSearchParams({
      embed: '1',
      ...(file && { file }),
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
  return (
    <StackBlitzEmbed
      path="examples/simple-form"
      height="600px"
      title="Simple Form Example - Graneet Form"
      hideNavigation={false}
    />
  );
}
