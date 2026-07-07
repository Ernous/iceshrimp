import { rmSync } from "node:fs";
import { join } from "node:path";

rmSync(join(import.meta.dirname, "/../packages/backend/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/client/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/sw/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/iceshrimp-sdk/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../built"), { recursive: true, force: true });
