import { cpSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, '..', 'generated', 'prisma');
const dest = resolve(__dirname, '..', 'dist', 'generated', 'prisma');

if (existsSync(src)) {
  cpSync(src, dest, { recursive: true });
  console.log('Copied generated/prisma -> dist/generated/prisma');
}
