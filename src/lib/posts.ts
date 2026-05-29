import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_DIR = join(process.cwd(), 'src/content/blog');

export interface Column {
  name: string;
  slug: string;
  count: number;
  children: Column[];
}

export interface ColumnPath {
  names: string[];
  slugs: string[];
  count: number;
}

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
    const [category] = getPostColumnNames(post);
    categories.set(category, (categories.get(category) || 0) + 1);
  }

  return Array.from(categories.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function getPostColumnNames(post: CollectionEntry<'blog'>) {
  const segments = post.id.split('/').slice(0, -1);
  return segments.length > 0 ? segments : [post.data.category];
}

export function getPostColumnSlugs(post: CollectionEntry<'blog'>) {
  return getPostColumnNames(post);
}

async function getBlogDirectoryPaths() {
  const paths: string[][] = [];

  async function walk(dirPath: string, segments: string[] = []) {
    let entries;

    try {
      entries = await readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

      const nextSegments = [...segments, entry.name];
      paths.push(nextSegments);
      await walk(join(dirPath, entry.name), nextSegments);
    }
  }

  await walk(BLOG_DIR);
  return paths;
}

export async function getColumns() {
  const posts = await getPosts();
  const directoryPaths = await getBlogDirectoryPaths();
  type ColumnNode = Column & { childrenBySlug: Map<string, ColumnNode> };
  const columns = new Map<string, ColumnNode>();

  function createColumn(name: string, slug: string): ColumnNode {
    return { name, slug, count: 0, children: [], childrenBySlug: new Map() };
  }

  function toColumn(node: ColumnNode): Column {
    return {
      name: node.name,
      slug: node.slug,
      count: node.count,
      children: Array.from(node.childrenBySlug.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(toColumn)
    };
  }

  function ensurePath(names: string[]) {
    let current = columns;

    for (const name of names) {
      const column = current.get(name) || createColumn(name, name);

      if (!current.has(name)) {
        current.set(name, column);
      }

      current = column.childrenBySlug;
    }
  }

  for (const path of directoryPaths) {
    ensurePath(path);
  }

  for (const post of posts) {
    const names = getPostColumnNames(post);
    const slugs = getPostColumnSlugs(post);
    let current = columns;

    names.forEach((name, index) => {
      const slug = slugs[index];
      const column = current.get(slug) || createColumn(name, slug);
      column.count += 1;

      if (!current.has(slug)) {
        current.set(slug, column);
      }

      current = column.childrenBySlug;
    });
  }

  return Array.from(columns.values()).sort((a, b) => a.name.localeCompare(b.name)).map(toColumn);
}

export async function getColumnPaths() {
  const posts = await getPosts();
  const directoryPaths = await getBlogDirectoryPaths();
  const paths = new Map<string, ColumnPath>();

  for (const names of directoryPaths) {
    const key = names.join('/');
    paths.set(key, {
      names,
      slugs: names,
      count: 0
    });
  }

  for (const post of posts) {
    const names = getPostColumnNames(post);
    const slugs = getPostColumnSlugs(post);

    names.forEach((_, index) => {
      const pathSlugs = slugs.slice(0, index + 1);
      const key = pathSlugs.join('/');
      const path = paths.get(key) || {
        names: names.slice(0, index + 1),
        slugs: pathSlugs,
        count: 0
      };

      path.count += 1;
      paths.set(key, path);
    });
  }

  return Array.from(paths.values()).sort((a, b) => a.names.join('/').localeCompare(b.names.join('/')));
}
