import net from "node:net";
import repl from "node:repl";
import cluster from "node:cluster";
import { initDb } from "../db/postgre.js";
import config from "@/config/index.js";

/**
 * Init worker process
 */
export async function workerMain() {
	await initDb();

	if (!config.onlyQueueProcessor) {
		// start server
		await import("../server/index.js").then((x) => x.default());
	}

	// start job queue
	import("../queue/index.js").then((x) => x.default());

	if (cluster.isWorker) {
		// Send a 'ready' message to parent process
		process.send!("ready");
		cluster.worker.on("message", (message, handle) => {
			if (message == "debug-shell") spawnWorkerShell(handle);
		});
	}
}

function spawnWorkerShell(socket: net.Socket) {
	const r = repl.start({ input: socket, output: socket });
	r.defineCommand("worker", (iid) => {
		r.close();
		const id = parseInt(iid.trim());
		cluster.workers[id].send("debug-shell", socket);
	});
}
