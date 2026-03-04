# Frontend Setup Workflow

This workflow describes how to bootstrap a React + TS + Tailwind v4 + Shadcn/UI project in this workspace.

## Prerequisites
- Node.js
- `pnpm` (If not found, use `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && pnpm`)

## Steps
1. **Initialize Vite**:
   ```bash
   npx -y create-vite@latest frontend --template react-ts
   ```
2. **Install Tailwind v4**:
   ```bash
   pnpm add tailwindcss @tailwindcss/vite postcss autoprefixer
   ```
3. **Setup Vite Plugin**:
   Add `tailwindcss()` to `vite.config.ts`.
4. **Setup Path Aliases**:
   - `vite.config.ts`: Add `alias: { "@": path.resolve(__dirname, "./src") }`.
   - `tsconfig.app.json`: Add `paths: { "@/*": ["./src/*"] }`.
5. **Configure CSS**:
   Replace `src/index.css` with Tailwind v4 `@import "tailwindcss";` and shadcn theme variables.
6. **Install UI Libs**:
   ```bash
   pnpm add lucide-react clsx tailwind-merge tailwindcss-animate class-variance-authority @radix-ui/react-slot
   ```
7. **Create Utils**:
   Create `src/lib/utils.ts` for the `cn` function.

## Known Issues
- `shadcn init` fails on paths with spaces (e.g. `EDUCATION CONTENT`). Manual setup is preferred for these cases.
- Tailwind v4 does not use `tailwind.config.js` by default; use `@theme` in CSS.
