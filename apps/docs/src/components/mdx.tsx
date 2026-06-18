import { createGenerator } from 'fumadocs-typescript';
import { AutoTypeTable } from 'fumadocs-typescript/ui';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { StackBlitzEmbed } from './stack-blitz-embed';
import type { ComponentProps } from 'react';

const generator = createGenerator();

// oxlint-disable-next-line import/exports-last
export function getMDXComponents(components?: MDXComponents): MDXComponents {
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
