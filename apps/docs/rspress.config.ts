import { join } from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: join(__dirname, 'docs'),
  title: 'Graneet form Documentation',
  description: 'Simple and performant form library',
  icon: '/graneet-form-logo.png',
  logo: {
    light: '/graneet-form-logo.png',
    dark: '/graneet-form-logo.png',
  },
  globalStyles: join(__dirname, 'styles/index.css'),
  themeConfig: {
    socialLinks: [{ icon: 'github', mode: 'link', content: 'https://github.com/graneet/graneet-form' }],
    darkMode: true,
    search: true,
    lastUpdated: true,
    outlineTitle: 'Sur cette page',
    prevPageText: 'Précédent',
    nextPageText: 'Suivant',
    searchPlaceholderText: 'Rechercher dans la documentation...',
    enableScrollToTop: true,
    enableContentAnimation: true,
    footer: {
      message: 'Publié sous licence MIT.',
      copyright: 'Copyright © 2024-present Graneet'
    }
  },
});
