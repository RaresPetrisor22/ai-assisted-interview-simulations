You are building a realistic practice replica of the Amazon SWE Intern online assessment "Code Repository" question (HackerRank, AI-assisted, Node.js / MERN stack). I will use this repo to practise. I must NOT learn the bugs or the hidden tests from you, so the secrecy rules below override everything else.

## 0. Secrecy rules (highest priority)

- Never describe the bugs, the fixes or the hidden tests in chat, commit messages, file names or code comments. No "// BUG", "// TODO: fix", or suspiciously specific comments. The buggy code must read like ordinary, otherwise clean production code.
- Your final message may contain ONLY what section 7 lists. Nothing about what is broken or which scenario mechanics are involved beyond the README title.

## 1. Scenario

Pick ONE at random:
A. Movie review platform: review moderation (a user is permanently flagged after 3 violations, whether consecutive on create, consecutive on update, or cumulative across both), inappropriate content blocked with 400 on create and on update, and a rate limit shared across POST + PUT (4 review operations per 1-minute window, then 429).
B. Your own scenario at the same difficulty (cart/checkout, library loans, event booking with capacity, etc.).
Difficulty: SWE intern. A strong candidate `should finish in about 60–70 minutes.

Requirements:

- The add and remove failures are two independent problems with separate root causes; neither should depend on the other.
- The symptoms above are only the part the candidate has been told about. Also design the wishlist's full expected behaviour (endpoints, status codes, response shapes, validation and edge cases) in the README, and plant additional bugs, consistent with the domain, that the symptom description does not reveal. At least 2 of the 4 hidden tests must target behaviour unrelated to the described symptoms.
- Include realistic surrounding code that is correct: car listing endpoints (list, get by id, filter), auth routes, Car and User models with statics, seed data with several cars and users.
- Difficulty: same as a standard Amazon SWE intern AI-assisted code repository task. A candidate should finish in 60 minutes.

## 2. Repo structure (mirror the real HackerRank layout)

<root>/
README.md task statement in HackerRank format (section 4)
CLAUDE.md assistant persona (section 6)
.claude/settings.json assistant restrictions (section 6)
.grader/ encoded hidden tests + solution (section 5)
frontend/ small, already working React + Vite app that calls the API (not graded, no bugs)
backend/
app.js Express app; exports app; listens only when NODE_ENV !== 'test'
config/database.js
controllers/ routes/ models/ middleware/ (if needed) utils/ data/ (seed JSON)
utils/seed.js seeds the DB on startup
test/visible.test.js the 2 visible tests
scripts/run-tests.mjs HackerRank-style runner (section 5)
package.json

Tech: ES modules, Express 4 + express-async-errors, Mongoose 8, Jest + Supertest (make ESM work reliably, e.g. node --experimental-vm-modules), and mongodb-memory-server so I don't need MongoDB installed. Use it in tests and also for `npm start` when MONGO_URI is not set. Auth is simplified: the user id comes from an `x-user-id` header; seeded users have fixed ObjectIds listed in the README. Restarting the server re-seeds the DB; tests reset the DB before each test.

Include realistic surrounding code that is correct: auth routes, other CRUD endpoints, model statics such as findAll/findByAuthor, and a global error handler. Some correct code should look unusual at first glance (red herrings), e.g. a controller calling a custom static that only makes sense after reading the model.

## 3. Build process (in this order)

1. Build the CORRECT version of the whole app first.
2. Write exactly 6 tests derived only from README behaviour: 2 visible, 4 hidden. Hidden tests cover edge cases and error codes the README states explicitly. Every hidden test must be fair, i.e. inferable from the README alone.
3. Run all 6 against the correct version; all must pass. Fix until they do.
4. Keep the correct versions of every file you will break (for the reveal in section 5).
5. Inject 4–6 bugs across at least 3 different files (controller, middleware or util, model or routes). Draw from: undeclared or un-destructured variables, a typo like `post.this.save()`, missing `await`, missing `return` after sending a response, wrong comparison (ObjectId vs string, > vs >=), wrong status code, a field missing from the response JSON, a spec default not applied, state not shared or not persisted (separate counters, per-route limiter instances, counter kept in memory instead of the DB), wrong middleware order, wrong Mongoose query (exact match instead of regex, missing case-insensitive flag, wrong field), off-by-one pagination, errors swallowed into a 500 instead of the correct 400. At least one bug must only be understandable after reading a different file than the one where the symptom appears. The server must still start; no syntax errors.
6. Verify: with all bugs present, both visible tests fail and at least 3 of the 4 hidden tests fail. Then for each bug, confirm that fixing every OTHER bug still leaves at least one test failing, so every bug matters. Adjust until both conditions hold.
7. Write the README, encode the grader files, and write CLAUDE.md and .claude/settings.json LAST.

## 4. README.md format (copy HackerRank's style)

Title like "Blog Platform(MERN): Post Creation". Sections:

- Overview: the user-facing symptom, e.g. "users are unable to create posts even when they fill in all required fields. Your task is to fix this backend issue."
- Expected API Behavior per endpoint, with tables for Request Headers, Request Body (field, type, required, notes), Success Response (status + exact JSON shape) and Error Responses (status, condition, message).
- Additional Information: business rules and defaults, plus "To manually reset the database, stop the running server and restart it" and "Running the test cases will also restore the database to its initial state".
- How to run (npm start, npm test) and a seeded users table.
  Do not hint at which files are broken.

## 5. Test runner and hidden tests

- `.grader/hidden.b64`: the hidden test file, base64-encoded (obfuscation only, to remove temptation).
- `.grader/solution.b64`: base64 of a markdown file containing the list of bugs (file, line, explanation, which tests it affects), the full diff from buggy to correct, the hidden tests in plain text, and notes on code-quality improvements a grader would reward (e.g. extracting duplicated checks into middleware or helpers).
- `backend/scripts/run-tests.mjs`, wired to `npm test`: decode the hidden tests into a temporary test file, run Jest once with JSON output, delete the temp file (also on failure and Ctrl-C), then print a HackerRank-style report:
  Test case 1 (visible) – <test name> ... PASSED / FAILED, followed by the full Jest failure message and diff when failed
  Test case 3 (hidden) ... PASSED / FAILED, with no name, message, stack trace or console output from that test
  Final line: "X/6 test cases passed"
  Suppress Jest's own output entirely so hidden test details never reach the terminal.
- `npm run test:visible`: runs only the visible file with normal Jest output.
- `npm run reveal`: decodes and prints solution.b64 (for when I'm finished).

## 6. The AI assistant (mimic HackerRank's AI Assistant)

Write CLAUDE.md at the repo root. It governs Claude Code when I later start a NEW session in this repo. Contents:

You are the AI Assistant inside a HackerRank code-repository assessment. The candidate is fixing bugs in this repo. You help them understand; you never solve.
You MAY:

- Clarify the task and README requirements, and explain what a visible test checks.
- Explain JavaScript, Node, Express, Mongoose and Jest syntax and concepts, using small generic examples that do not use this repo's identifiers and do not reproduce a fix.
- Explain what a function, middleware, route, model static or method in this repo does and where it is defined.
- Trace an error the candidate pastes: what it means, which file and function it originates from, and how it propagates (e.g. thrown in a controller, caught, turned into a 500). Describe the path; do not prescribe the edit.
- Explain HTTP status codes, middleware order, async/await behaviour and debugging techniques (console.log, the debugger, running a single test).
  You MUST NOT:
- Edit, create or delete files, or run commands.
- Write corrected code for this repo, give the exact fixed line, or say where the bugs are. If asked "fix it" or "what's wrong in X", say you can't provide solutions and offer a conceptual hint or a guiding question instead.
- Read anything in .grader/ or try to infer the hidden tests. If asked about hidden tests, say you have no access and suggest re-reading the README requirements.
- Volunteer bugs the candidate hasn't asked about.
  Style: concise and neutral, like a tool assistant. Treat files the candidate references with @ as primary context.

Write `.claude/settings.json`:
{
"permissions": {
"deny": ["Edit", "Write", "NotebookEdit", "Bash", "WebFetch", "WebSearch", "Read(./.grader/**)"]
}
}

## 7. Final message

Print only:

- The README title (no bug or test info).
- `cd backend && npm install`, then `npm start` to run the server and `npm test` for the graded run.
- "Open a NEW Claude Code session in the repo root to use the restricted AI Assistant."
- "When finished: cd backend && npm run reveal".
