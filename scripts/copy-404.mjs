import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const index = join(root, "dist", "index.html");
const dest = join(root, "dist", "404.html");
if (existsSync(index)) {
  copyFileSync(index, dest);
}
