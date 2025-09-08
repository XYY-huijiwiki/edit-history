# Edit History

> A fast alternative to 'Special:RecentChanges' on Wikimedia based sites.

> [!IMPORTANT] This is an early prototype. It is not yet ready for any real use.

## Development

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start the development server:

   ```bash
   bun run dev
   ```

3. Open a wiki page. Ensure the page contains `<div id="dcb40fa"></div>`, either through page editing or modification in browser's devtools.

4. Open the browser console, run `import("http://localhost:5173/src/main.ts")` to load the app.
