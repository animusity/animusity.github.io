import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'data.json'), 'utf8'));
function assert(condition, message) { if (!condition) throw new Error(message); }
assert(data.site && typeof data.site.name === 'string', 'Site name is required');
for (const collection of ['characters', 'worlds', 'plans']) assert(Array.isArray(data[collection]), `${collection} must be an array`);
for (const collection of ['characters', 'worlds']) {
  const seen = new Set();
  for (const record of data[collection]) {
    assert(typeof record.id === 'string' && /^[a-z0-9-]+$/.test(record.id), `Use lowercase letters, digits and hyphens for ${collection} IDs`);
    assert(!seen.has(record.id), `Duplicate ID: ${record.id}`);
    assert(typeof record.name === 'string' && record.name.trim(), `Missing name: ${record.id}`);
    seen.add(record.id);
  }
}
for (const item of data.characters) {
  assert(['Published', 'Draft', 'Planned'].includes(item.status), `Invalid status: ${item.id}`);
  assert(!item.world || data.worlds.some(world => world.id === item.world), `Unknown world: ${item.world}`);
  assert(!item.tags || Array.isArray(item.tags), `Tags must be an array: ${item.id}`);
  assert(!item.gallery || Array.isArray(item.gallery), `Gallery must be an array: ${item.id}`);
  assert(!item.links || Array.isArray(item.links), `Links must be an array: ${item.id}`);
}
await mkdir(path.join(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'data.json', 'favicon.svg', '.nojekyll']) await copyFile(path.join(root, file), path.join(root, 'dist', file));
// Optional user-provided images live in assets/ and retain their relative paths.
const { cp, stat } = await import('node:fs/promises');
try { await stat(path.join(root, 'assets')); await cp(path.join(root, 'assets'), path.join(root, 'dist/assets'), {recursive: true}); } catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log('Archive data validated. Static website prepared in dist/.');
