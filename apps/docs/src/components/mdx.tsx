import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { StackBlitzEmbed } from './stack-blitz-embed';
import { AutoTypeTable } from 'fumadocs-typescript/ui';
import { createGenerator, createFileSystemGeneratorCache } from 'fumadocs-typescript';
import type { ComponentProps } from 'react';

const generator = createGenerator({
  // Set a cache, necessary for serverless platform like Vercel
  cache: createFileSystemGeneratorCache('.tanstack/fumadocs-typescript'),
});

// oxlint-disable-next-line import/exports-last
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  // oxlint-disable-next-line typescript/no-unsafe-return
  return {
    ...defaultMdxComponents,
    AutoTypeTable: (props: ComponentProps<typeof AutoTypeTable>) => (
      // oxlint-disable-next-line react/jsx-props-no-spreading
      <AutoTypeTable {...props} generator={generator} />
    ),
    StackBlitzEmbed,
    ...components,
  } satisfies MDXComponents;
}

// oxlint-disable-next-line import/exports-last
export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
