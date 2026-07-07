import { Job, Processor } from "bullmq";
import { createQueue, defaultJobOpts } from "../index.js";
import { clean } from "./clean.js";
import { cleanCharts } from "./clean-charts.js";
import { checkExpiredMutings } from "./check-expired-mutings.js";
import { resyncCharts } from "./resync-charts.js";
import { tickCharts } from "./tick-charts.js";
import { verifyLinks } from "./verify-links.js";

const processors = {
	clean,
	cleanCharts,
	checkExpiredMutings,
	resyncCharts,
	tickCharts,
	verifyLinks,
} as Record<string, Processor>;

async function process(job: Job<any>): Promise<string> {
	const processor = processors[job.name];
	if (processor === undefined) return "skip: unknown job name";
	return await processor(job);
}

const [systemQueue_, systemInitQueue] =
	createQueue("system", process, { concurrency: Object.keys(processors).length });
export const systemQueue = systemQueue_;

export async function systemInit() {
	await systemInitQueue();
	for (const { name, seconds } of [
		{ name: "clean", seconds: 60 * 60 },
		{ name: "cleanCharts", seconds: 60 * 60 },
		{ name: "checkExpiredMutings", seconds: 5 * 60 },
		{ name: "resyncCharts", seconds: 60 * 60 },
		{ name: "tickCharts", seconds: 60 },
		{ name: "verifyLinks", seconds: 60 * 60 * 24 },
	]) {
		await systemQueue.upsertJobScheduler(
			name,
			{ every: seconds * 1000 },
			{ opts: defaultJobOpts }
		);
	}
}
