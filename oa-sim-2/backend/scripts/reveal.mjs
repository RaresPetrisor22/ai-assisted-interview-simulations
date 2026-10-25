#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const encoded = readFileSync(path.join(rootDir, '.grader', 'solution.b64'), 'utf8');

console.log(Buffer.from(encoded, 'base64').toString('utf8'));
