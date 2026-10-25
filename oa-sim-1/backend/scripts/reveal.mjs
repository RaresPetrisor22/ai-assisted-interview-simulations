#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOLUTION = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.grader', 'solution.b64');

if (!fs.existsSync(SOLUTION)) {
  console.error(`Solution file not found at ${SOLUTION}`);
  process.exit(1);
}

process.stdout.write(Buffer.from(fs.readFileSync(SOLUTION, 'utf8').trim(), 'base64').toString('utf8'));
process.stdout.write('\n');
