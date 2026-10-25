#!/usr/bin/env node
/**
 * Graded test runner.
 *
 * Runs the visible and hidden test suites in a single Jest process and prints
 * a HackerRank-style report. Details of hidden test cases are never printed.
 */
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VISIBLE_COUNT = 2;
const HIDDEN_COUNT = 4;
const TOTAL = VISIBLE_COUNT + HIDDEN_COUNT;

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootDir = path.resolve(backendDir, '..');
const jestBin = path.join(backendDir, 'node_modules', 'jest', 'bin', 'jest.js');
const encodedHidden = path.join(rootDir, '.grader', 'hidden.b64');
const visibleFile = path.join(backendDir, 'test', 'visible.test.js');

const token = randomBytes(6).toString('hex');
const hiddenFile = path.join(backendDir, 'test', `graded-${token}.test.js`);
const reportFile = path.join(os.tmpdir(), `jest-report-${token}.json`);

let child = null;

function cleanup() {
  for (const file of [hiddenFile, reportFile]) {
    try {
      if (existsSync(file)) rmSync(file, { force: true });
    } catch {
      // ignore
    }
  }
}

function abort(code) {
  if (child && child.exitCode === null) child.kill();
  cleanup();
  process.exit(code);
}

process.on('exit', cleanup);
process.on('SIGINT', () => abort(130));
process.on('SIGTERM', () => abort(143));
process.on('SIGHUP', () => abort(129));
process.on('uncaughtException', (err) => {
  console.error(`Test runner error: ${err.message}`);
  abort(1);
});

function samePath(a, b) {
  return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
}

function runJest() {
  return new Promise((resolve) => {
    child = spawn(
      process.execPath,
      [
        '--experimental-vm-modules',
        jestBin,
        '--runInBand',
        '--silent',
        '--json',
        `--outputFile=${reportFile}`,
        '--runTestsByPath',
        visibleFile,
        hiddenFile,
      ],
      {
        cwd: backendDir,
        stdio: 'ignore',
        env: { ...process.env, NODE_ENV: 'test' },
      }
    );
    child.on('close', () => resolve());
    child.on('error', () => resolve());
  });
}

function readReport() {
  try {
    return JSON.parse(readFileSync(reportFile, 'utf8'));
  } catch {
    return null;
  }
}

function collect(report, file, count) {
  const suite = report?.testResults?.find((result) => samePath(result.name, file));
  const assertions = suite?.assertionResults ?? [];

  return Array.from({ length: count }, (_, index) => {
    const assertion = assertions[index];
    if (!assertion) {
      return {
        title: 'Test suite failed to run',
        passed: false,
        message: suite?.message || 'Test suite failed to run.',
      };
    }
    return {
      title: assertion.title,
      passed: assertion.status === 'passed',
      message: (assertion.failureMessages ?? []).join('\n\n'),
    };
  });
}

async function main() {
  if (!existsSync(jestBin)) {
    console.error('Dependencies are missing. Run `npm install` in the backend folder first.');
    process.exit(1);
  }

  writeFileSync(hiddenFile, Buffer.from(readFileSync(encodedHidden, 'utf8'), 'base64').toString('utf8'));

  console.log('Running test cases...\n');
  await runJest();

  const report = readReport();
  cleanup();

  const visible = collect(report, visibleFile, VISIBLE_COUNT);
  const hidden = collect(report, hiddenFile, HIDDEN_COUNT);
  let passed = 0;

  visible.forEach((result, index) => {
    if (result.passed) passed += 1;
    console.log(
      `Test case ${index + 1} (visible) - ${result.title} ... ${result.passed ? 'PASSED' : 'FAILED'}`
    );
    if (!result.passed) {
      console.log(`\n${result.message.replace(/^/gm, '    ')}\n`);
    }
  });

  hidden.forEach((result, index) => {
    if (result.passed) passed += 1;
    console.log(
      `Test case ${VISIBLE_COUNT + index + 1} (hidden) ... ${result.passed ? 'PASSED' : 'FAILED'}`
    );
  });

  console.log(`\n${passed}/${TOTAL} test cases passed`);
  process.exitCode = passed === TOTAL ? 0 : 1;
}

main();
