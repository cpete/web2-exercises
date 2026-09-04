import { argv } from "node:process";
import { fileURLToPath } from "node:url";

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

const isMain = argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  console.log(greet("world"));
}
