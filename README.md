# AI-Assisted Prep

Practice replicas for SWE Intern "Code Repository" online assessment (HackerRank, AI-assisted, MERN stack).

- `oa-prompt.md`: the prompt given to an AI agent to generate a new simulation.
- `oa-sim-1/`: Movie Database, movie search.
- `oa-sim-2/`: Car Marketplace, wishlist.

Each simulation has its own `README.md` with the task statement. Hidden tests and the reference solution are encoded in `.grader/`.

## Instructions

1. Create a new `oa-sim-n` folder and open a new terminal inside it.
2. Generate the simulation (Windows PowerShell). This may take a while:

   ```powershell
   Get-Content ..\oa-prompt.md -Raw | claude -p "Follow these instructions exactly." --permission-mode bypassPermissions
   ```

3. When you've finished the task, reveal the solution from `backend/`:

   ```powershell
   npm run reveal
   ```
