import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG_DIR = new URL('../src/content/blog/', import.meta.url);
const BLOG_DIR_PATH = fileURLToPath(BLOG_DIR);
const today = new Date().toISOString().slice(0, 10);

const KNOWN_TAGS = [
  'Astro',
  'Cloudflare',
  'Deploy',
  'GitHub Actions',
  'Git',
  'Mac',
  'iOS',
  'Shell',
  'Environment',
  'Markdown',
  'Swift',
  'Array',
  'API',
  'JavaScript',
  'TypeScript',
  'React',
  'CSS',
  'SEO'
];

const CATEGORY_KEYWORDS = [
  ['iOS', ['ios', 'xcode', 'cocoapods', 'pod', 'simulator']],
  ['Mac', ['mac', 'macos', 'zsh', 'proxy', 'homebrew']],
  ['Git', ['git', 'github']],
  ['Swift', ['swift', 'array', 'dictionary']],
  ['Astro', ['astro', 'markdown']],
  ['Deploy', ['cloudflare', 'deploy', 'pages']]
];

function hasFrontmatter(content) {
  return content.trimStart().startsWith('---');
}

function stripToc(content) {
  return content
    .replace(/^\s*\[TOC\]\s*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart();
}

function extractTitle(fallback) {
  return cleanTitle(fallback.replace(/\.md$/i, '') || 'Untitled');
}

function cleanTitle(title) {
  return title
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDescription(content, title) {
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');
  const paragraph = withoutCode
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('- ') && !block.startsWith('|'));

  const description = paragraph
    ? paragraph.replace(/[`*_>#-]/g, '').replace(/\s+/g, ' ').trim()
    : `${title} 的技术笔记。`;

  return description.length > 120 ? `${description.slice(0, 117)}...` : description;
}

function inferTags(content) {
  const haystack = content.toLowerCase();
  const tags = KNOWN_TAGS.filter((tag) => haystack.includes(tag.toLowerCase()));
  return tags.length > 0 ? tags : ['Notes'];
}

function inferCategory(filePath, tags) {
  const relativePath = relative(BLOG_DIR_PATH, filePath);
  const parent = basename(dirname(relativePath));

  if (parent && parent !== '.' && parent !== 'blog') {
    return cleanTitle(parent);
  }

  const haystack = `${relativePath} ${tags.join(' ')}`.toLowerCase();
  const matched = CATEGORY_KEYWORDS.find(([, keywords]) => {
    return keywords.some((keyword) => haystack.includes(keyword));
  });

  return matched?.[0] || tags[0] || 'Notes';
}

function escapeYaml(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function listMarkdownFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({ name: entry.name, path: entryPath });
    }
  }

  return files;
}

let converted = 0;
const files = await listMarkdownFiles(BLOG_DIR_PATH);

for (const file of files) {
  const raw = await readFile(file.path, 'utf8');
  if (hasFrontmatter(raw)) continue;

  const body = stripToc(raw);
  const title = extractTitle(file.name);
  const description = extractDescription(body, title);
  const tags = inferTags(`${title}\n${body}`);
  const category = inferCategory(file.path, tags);
  const frontmatter = [
    '---',
    `title: "${escapeYaml(title)}"`,
    `description: "${escapeYaml(description)}"`,
    `pubDate: ${today}`,
    `category: "${escapeYaml(category)}"`,
    `tags: [${tags.join(', ')}]`,
    'draft: false',
    '---',
    ''
  ].join('\n');

  await writeFile(file.path, `${frontmatter}${body}`, 'utf8');
  converted += 1;
  console.log(`Converted ${file.name}`);
}

if (converted === 0) {
  console.log('All blog posts already have frontmatter.');
}
