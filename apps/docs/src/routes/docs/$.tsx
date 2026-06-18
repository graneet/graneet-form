import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { slugsToMarkdownPath, source } from '@/lib/source';
import browserCollections from 'collections/browser';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { useMDXComponents } from '@/components/mdx';

const serverLoader = createServerFn({
  method: 'GET',
})
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) {
      throw notFound();
    }

    return {
      markdownUrl: slugsToMarkdownPath(page.slugs).url,
      pageTree: await source.serializePageTree(source.getPageTree()),
      path: page.path,
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component: (
    { toc, frontmatter, default: MDX },
    // You can define props for the component
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ): ReactNode => (
    <DocsPage toc={toc}>
      <DocsTitle>{frontmatter.title}</DocsTitle>
      <DocsDescription>{frontmatter.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
        />
      </div>
      <DocsBody>
        {/* oxlint-disable-next-line react/jsx-pascal-case react/rules-of-hooks */}
        <MDX components={useMDXComponents()} />
      </DocsBody>
    </DocsPage>
  ),
});

// oxlint-disable-next-line import/exports-last
export const Route = createFileRoute('/docs/$')({
  // oxlint-disable-next-line no-use-before-define
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

function Page() {
  const { path, pageTree, markdownUrl } = useFumadocsLoader(Route.useLoaderData());

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  );
}
