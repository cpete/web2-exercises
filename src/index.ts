import { argv } from "node:process";
import { fileURLToPath } from "node:url";

import { createApp } from "./app.js";

const isMain = argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env["PORT"] ?? 3000);
  const app = createApp();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
