import { globSync } from "glob";
import { writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = globSync("**/package.json");

for (const file of files) {
	const json = JSON.parse(readFileSync(file));
	json["devDependencies"] = undefined;
	writeFileSync(file, JSON.stringify(json, null, "\t"));
}

execSync("bun install --production", { stdio: "inherit" });
