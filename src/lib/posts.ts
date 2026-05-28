import { getCollection } from 'astro:content';

export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getTags() {
  const posts = await getPosts();
  const tags = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    }
  }

  return Array.from(tags.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export async function getCategories() {
  const posts = await getPosts();
  const categories = new Map<string, number>();

  for (const post of posts) {
    categories.set(post.data.category, (categories.get(post.data.category) || 0) + 1);
  }

  return Array.from(categories.entries()).sort(([a], [b]) => a.localeCompare(b));
}
