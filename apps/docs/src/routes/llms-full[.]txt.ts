import { createFileRoute } from '@tanstack/react-router';
import { getLLMText, source } from '@/lib/source';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        // oxlint-disable-next-line unicorn/no-array-callback-reference
        const scan = source.getPages().map(getLLMText);
        const scanned = await Promise.all(scan);
        return new Response(scanned.join('\n\n'));
      },
    },
  },
});
