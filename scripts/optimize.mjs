import { exec } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const execPromise = promisify(exec);

console.log("compressing client");
await execPromise("brotli -f *.js *.json *.css", {
	cwd: join(import.meta.dirname, "../built/_client_dist_"),
});
console.log("compressing service worker");
await execPromise("brotli -f sw.js", {
	cwd: join(import.meta.dirname, "../built/_sw_dist_"),
});
