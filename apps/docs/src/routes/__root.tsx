import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import appCss from '@/styles/app.css?url';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';

function RootComponent() {
  return (
    // oxlint-disable-next-line jsx-a11y/html-has-lang jsx-a11y/lang
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      { href: appCss, rel: 'stylesheet' },
      { href: '/graneet-form-logo.png', rel: 'icon' },
    ],
    meta: [
      {
        charSet: 'utf8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      {
        title: 'Graneet Form',
      },
    ],
  }),
});
