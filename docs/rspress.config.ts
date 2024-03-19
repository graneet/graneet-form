import { join } from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: join(__dirname, 'docs'),
  title: 'Graneet form Documentation',
  description: 'Simple and performant form library',
  icon: "/graneet-form-logo.png",
  logo: {
    light: "/graneet-form-logo.png",
    dark: "/graneet-form-logo.png",
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/graneet/graneet-form' },
    ],
  },
});
