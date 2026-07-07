import { rmSync } from "node:fs";
import execa from "execa";
import { join } from "node:path";

rmSync(join(import.meta.dirname, "/../packages/backend/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/backend/node_modules"), {
	recursive: true,
	force: true,
});

rmSync(join(import.meta.dirname, "/../packages/client/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/client/node_modules"), {
	recursive: true,
	force: true,
});

rmSync(join(import.meta.dirname, "/../packages/sw/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/sw/node_modules"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/iceshrimp-sdk/built"), {
	recursive: true,
	force: true,
});
rmSync(join(import.meta.dirname, "/../packages/iceshrimp-sdk/node_modules"), {
	recursive: true,
	force: true,
});

rmSync(join(import.meta.dirname, "/../built"), { recursive: true, force: true });
rmSync(join(import.meta.dirname, "/../node_modules"), {
	recursive: true,
	force: true,
});

execa("bun", ["run", "clean"], {
	cwd: join(import.meta.dirname, "/../"),
	stdio: "inherit",
});
