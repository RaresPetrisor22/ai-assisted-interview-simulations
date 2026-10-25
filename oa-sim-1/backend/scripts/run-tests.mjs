#!/usr/bin/env node
/**
 * HackerRank-style test runner.
 *
 * Runs the visible and hidden test cases in a single Jest run, keeps Jest's own
 * output out of the terminal and prints one line per test case. Failure details
 * are only shown for visible test cases.
 */
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_DIR = path.join(BACKEND_DIR, 'test');
const HIDDEN_SOURCE = path.resolve(BACKEND_DIR, '..', '.grader', 'hidden.b64');
const VISIBLE_FILE = path.join(TEST_DIR, 'visible.test.js');
const JEST_BIN = path.join(BACKEND_DIR, 'node_modules', 'jest', 'bin', 'jest.js');

const VISIBLE_COUNT = 2;
const HIDDEN_COUNT = 4;
const TOTAL_COUNT = VISIBLE_COUNT + HIDDEN_COUNT;
const TEMP_PATTERN = /^hidden-[0-9a-f]+\.test\.js$/;

const token = randomBytes(6).toString('hex');
const hiddenFile = path.join(TEST_DIR, `hidden-${token}.test.js`);
const reportFile = path.join(os.tmpdir(), `jest-report-${token}.json`);

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text);
const green = paint('32');
const red = paint('31');
const bold = paint('1');
const dim = paint('2');

let child = null;

const removeFile = (file) => {
  try {
    fs.rmSync(file, { force: true });
  } catch {
    // ignore
  }
};

const cleanup = () => {
  removeFile(hiddenFile);
  removeFile(reportFile);
};

const removeStaleTempFiles = () => {
  for (const name of fs.readdirSync(TEST_DIR)) {
    if (TEMP_PATTERN.test(name)) removeFile(path.join(TEST_DIR, name));
  }
};

process.on('exit', cleanup);

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  if (!os.constants.signals[signal]) continue;
  process.on(signal, () => {
    if (child && child.exitCode === null) child.kill();
    cleanup();
    console.log('\nTest run aborted.');
    process.exit(130);
  });
}

const samePath = (a, b) => {
  const normalise = (p) => (process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p));
  return normalise(a) === normalise(b);
};

const indent = (text, spaces = 4) =>
  text
    .split(/\r?\n/)
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n');

const runJest = () =>
  new Promise((resolve) => {
    const args = [
      '--experimental-vm-modules',
      '--no-warnings',
      JEST_BIN,
      '--runInBand',
      '--forceExit',
      '--ci',
      '--silent',
      '--json',
      `--outputFile=${reportFile}`,
      '--runTestsByPath',
      VISIBLE_FILE,
      hiddenFile,
    ];

    child = spawn(process.execPath, args, {
      cwd: BACKEND_DIR,
      stdio: 'ignore',
      env: { ...process.env, NODE_ENV: 'test', FORCE_COLOR: useColor ? '1' : '0' },
    });

    child.on('error', () => resolve(null));
    child.on('exit', (code) => resolve(code));
  });

const readReport = () => {
  try {
    return JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  } catch {
    return null;
  }
};

const collectCases = (suite, count) => {
  const assertions = suite?.assertionResults ?? [];
  return Array.from({ length: count }, (_, index) => assertions[index] ?? null);
};

const main = async () => {
  if (!fs.existsSync(JEST_BIN)) {
    console.error('Jest is not installed. Run `npm install` inside the backend folder first.');
    process.exit(1);
  }

  if (!fs.existsSync(HIDDEN_SOURCE)) {
    console.error(`Hidden test cases not found at ${HIDDEN_SOURCE}`);
    process.exit(1);
  }

  removeStaleTempFiles();
  fs.writeFileSync(hiddenFile, Buffer.from(fs.readFileSync(HIDDEN_SOURCE, 'utf8').trim(), 'base64').toString('utf8'));

  console.log(bold('Running test cases...\n'));

  const exitCode = await runJest();
  const report = readReport();
  cleanup();

  if (!report) {
    console.log(red(`The test run did not complete (Jest exit code: ${exitCode ?? 'unknown'}).`));
    console.log('Try `npm run test:visible` to see the full Jest output.\n');
  }

  const visibleSuite = report?.testResults.find((suite) => samePath(suite.name, VISIBLE_FILE));
  const hiddenSuite = report?.testResults.find((suite) => samePath(suite.name, hiddenFile));

  let passed = 0;
  let caseNumber = 0;
  let suiteErrorShown = false;

  for (const assertion of collectCases(visibleSuite, VISIBLE_COUNT)) {
    caseNumber += 1;
    const ok = assertion?.status === 'passed';
    if (ok) passed += 1;

    const name = assertion?.title ?? '(test did not run)';
    console.log(`Test case ${caseNumber} (visible) - ${name} ... ${ok ? green('PASSED') : red('FAILED')}`);

    if (!ok) {
      const messages = assertion?.failureMessages?.filter(Boolean) ?? [];
      if (messages.length > 0) {
        console.log(`\n${indent(messages.join('\n\n'))}\n`);
      } else if (visibleSuite?.message && !suiteErrorShown) {
        suiteErrorShown = true;
        console.log(`\n${indent(visibleSuite.message)}\n`);
      }
    }
  }

  for (const assertion of collectCases(hiddenSuite, HIDDEN_COUNT)) {
    caseNumber += 1;
    const ok = assertion?.status === 'passed';
    if (ok) passed += 1;

    console.log(`Test case ${caseNumber} (hidden) ... ${ok ? green('PASSED') : red('FAILED')}`);
  }

  console.log(`\n${dim('Hidden test case details are not shown.')}`);
  console.log(bold(`${passed}/${TOTAL_COUNT} test cases passed`));

  process.exitCode = passed === TOTAL_COUNT ? 0 : 1;
};

main().catch(() => {
  cleanup();
  console.error(red('The test runner failed unexpectedly.'));
  process.exit(1);
});
