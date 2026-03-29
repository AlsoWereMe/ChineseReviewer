import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local dev / Netlify root: base "/".
// GitHub Actions sets GITHUB_REPOSITORY=owner/repo so assets resolve on project pages.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repo ? `/${repo}/` : "/";

export default defineConfig({
  plugins: [react()],
  base,
});
