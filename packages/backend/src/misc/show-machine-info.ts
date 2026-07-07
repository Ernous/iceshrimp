import * as os from "node:os";
import type Logger from "@/services/logger.js";

export async function showMachineInfo(parentLogger: Logger) {
	const logger = parentLogger.createSubLogger("machine");
	logger.debug(`Hostname: ${os.hostname()}`);
	logger.debug(`Platform: ${process.platform} Arch: ${process.arch}`);
	const totalmem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
	const freemem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
	logger.debug(
		`CPU: ${os.cpus().length} core MEM: ${totalmem}GB (free: ${freemem}GB)`,
	);
}
