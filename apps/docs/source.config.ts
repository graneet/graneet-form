import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { createGenerator, remarkAutoTypeTable } from 'fumadocs-typescript';
import { pageSchema, metaSchema } from 'fumadocs-core/source/schema';

const generator = createGenerator();

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: pageSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [[remarkAutoTypeTable, { generator }]],
  },
});
