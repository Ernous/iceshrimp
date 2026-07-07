import { readFileSync, writeFileSync } from "node:fs";
import exec from "execa";

const json = JSON.parse(readFileSync("package.json"));

const match = json['version'].match(/^[\d.]*(?:-pre\d+|)?/);
const version = match ? `${match[0]}-dev` : "dev";
const revision = process.argv.length > 2
	? process.argv[2]
	: (await exec("git", ["rev-parse", "--short", "HEAD"])).stdout;

json['version'] = `${version}-${revision}`;
console.log(`Package version was updated to ${json['version']}`);
writeFileSync("package.json", JSON.stringify(json, null, '\t'));
