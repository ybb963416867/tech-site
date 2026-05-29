import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';

const site = process.env.SITE_URL || 'https://example.com';
const blogDir = fileURLToPath(new URL('./src/content/blog/', import.meta.url));

function watchBlogDirectories() {
  return {
    name: 'watch-blog-directories',
    configureServer(server) {
      server.watcher.add(blogDir);

      for (const event of ['addDir', 'unlinkDir']) {
        server.watcher.on(event, (changedPath) => {
          if (changedPath.startsWith(blogDir)) {
            server.ws.send({ type: 'full-reload' });
          }
        });
      }
    }
  };
}

export default defineConfig({
  site,
  integrations: [sitemap()],
  vite: {
    plugins: [watchBlogDirectories()]
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
