import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import zlib from "node:zlib";

function compressDir(dir, pattern) {
	if (!existsSync(dir)) {
		console.log(`skipping ${dir} (not found)`);
		return;
	}
	console.log(`compressing ${dir}`);
	for (const file of readdirSync(dir)) {
		if (!pattern.test(file)) continue;
		const filePath = join(dir, file);
		const buf = readFileSync(filePath);
		const compressed = zlib.brotliCompressSync(buf);
		writeFileSync(filePath + ".br", compressed);
	}
}

compressDir(join(import.meta.dirname, "../built/_client_dist_"), /\.(js|json|css)$/);
compressDir(join(import.meta.dirname, "../built/_sw_dist_"), /^sw\.js$/);
