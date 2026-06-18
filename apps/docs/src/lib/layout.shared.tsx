import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [],
    nav: {
      title: (
        <>
          <img
            src="/graneet-form-logo.png"
            alt="Graneet Form Logo"
            width={24}
            height={24}
            style={{ borderRadius: '50%' }}
          />
          Graneet form
        </>
      ),
    },
  };
}
