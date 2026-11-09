// Runs before `next dev` and `next build`. Publishes lib/site-runtime.js as a
// content-hashed file, so browsers cache it forever and it isn't embedded twice
// in every page (once in the HTML, once in the React payload).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const js = fs.readFileSync(path.join(root, 'lib/site-runtime.js'));
const hash = crypto.createHash('sha256').update(js).digest('hex').slice(0, 12);

const dir = path.join(root, 'public/rt');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${hash}.js`), js);
fs.writeFileSync(path.join(root, 'content/runtime.json'), JSON.stringify({ src: `/rt/${hash}.js` }) + '\n');
console.log(`runtime: /rt/${hash}.js`);
