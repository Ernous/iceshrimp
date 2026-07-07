import Logger from "@/services/logger.js";

export const queueLogger = new Logger("queue", "orange");

export function renderError(e: Error): any {
	return {
		stack: e.stack,
		message: e.message,
		name: e.name,
	};
}
