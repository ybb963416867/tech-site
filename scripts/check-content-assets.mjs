import { access, readdir, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG_DIR = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const ROOT_DIR = fileURLToPath(new URL('../', import.meta.url));

const imagePattern = /!\[[^\]]*]\(([^)\n]+)\)|<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
const ignoredProtocols = /^(?:https?:|data:|mailto:|tel:|#)/i;

async function listMarkdownFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files;
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function maskFencedCode(content) {
  return content.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\n]/g, ' '));
}

function cleanImageTarget(rawTarget) {
  const withoutTitle = rawTarget.trim().replace(/^<|>$/g, '').split(/\s+"[^"]*"\s*$/)[0];
  const withoutHash = withoutTitle.split('#')[0];
  return withoutHash.split('?')[0];
}

function decodeTarget(target) {
  try {
    return { value: decodeURIComponent(target), error: null };
  } catch {
    return { value: target, error: '图片路径包含无效 URL 转义字符，请检查是否有未转义的 %。' };
  }
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const missingAssets = [];
const files = await listMarkdownFiles(BLOG_DIR);

for (const file of files) {
  const content = await readFile(file, 'utf8');
  const searchableContent = maskFencedCode(content);
  const matches = searchableContent.matchAll(imagePattern);

  for (const match of matches) {
    const rawTarget = match[1] || match[2] || '';
    const target = cleanImageTarget(rawTarget);

    if (!target || ignoredProtocols.test(target) || target.startsWith('/')) continue;

    const decoded = decodeTarget(target);
    const expectedPath = join(dirname(file), decoded.value);

    if (decoded.error || !(await exists(expectedPath))) {
      missingAssets.push({
        file,
        line: lineNumberAt(content, match.index || 0),
        reason: decoded.error || '找不到图片文件。',
        target,
        expectedPath
      });
    }
  }
}

if (missingAssets.length > 0) {
  console.error('\n[content-assets] Markdown 图片引用检查失败：');

  for (const asset of missingAssets) {
    console.error(`\n- 文件：${relative(ROOT_DIR, asset.file)}:${asset.line}`);
    console.error(`  引用：${asset.target}`);
    console.error(`  期望：${relative(ROOT_DIR, asset.expectedPath)}`);
    console.error(`  原因：${asset.reason}`);
  }

  console.error('\n请补回缺失图片，或修改/删除对应 Markdown 图片引用后再构建。\n');
  process.exit(1);
}

console.log('All Markdown image assets exist.');
