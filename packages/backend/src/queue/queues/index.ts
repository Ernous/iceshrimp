import { Worker, Queue, BackoffStrategy, Processor, Job } from "bullmq";
import config from "@/config/index.js";
import { queueLogger, renderError } from "../logger.js";

const connectionDetails = {
	port: config.redis.port,
	host: config.redis.host,
	family: config.redis.family == null ? 0 : config.redis.family,
	username: config.redis.user ?? "default",
	password: config.redis.pass,
	db: config.redis.db || 0,
	tls: config.redis.tls,
	lazyConnect: true,
	maxRetriesPerRequest: null,
};

// ref. https://github.com/misskey-dev/misskey/pull/7635#issue-971097019
function apBackoff(attemptsMade: number) {
	const baseDelay = 60 * 1000; // 1min
	const maxBackoff = 8 * 60 * 60 * 1000; // 8hours
	let backoff = (Math.pow(2, attemptsMade) - 1) * baseDelay;
	backoff = Math.min(backoff, maxBackoff);
	backoff += Math.round(backoff * Math.random() * 0.2);
	return backoff;
}

export function createQueue<D>(
	name: string,
	processor: Processor<D>,
	opts: {
		backoff?: BackoffStrategy,
		limitPerSec?: number,
		concurrency?: number,
	} = {}
): [Queue<D>, () => Promise<void>] {
	const backoffStrategy = opts.backoff || apBackoff;
	const sublogger = queueLogger.createSubLogger(name);

	const queue = new Queue<D>(
		name,
		{
			connection: connectionDetails,
			prefix: config.redis.prefix,
		},
	);
	queue.on("waiting", (job) => sublogger.debug(`waiting id=${job.id}`));

	const initWorker = () => {
		return new Worker<D>(
			name,
			processor,
			{
				connection: connectionDetails,
				prefix: config.redis.prefix,
				settings: {
					backoffStrategy,
				},
				limiter: (opts.limitPerSec === undefined || opts.limitPerSec === -1)
					? undefined : {
						max: opts.limitPerSec,
						duration: 1000,
					},
				concurrency: opts.concurrency || 1,
			},
		)
			.on("ready", () => {})
			.on("active", (job) => sublogger.debug(`active id=${job.id}`))
			.on("completed", (job) => sublogger.debug(`completed id=${job.id}`))
			.on("failed", (job, err) =>
				sublogger.warn(`failed(${err}) id=${job?.id}`, {
					job,
					e: renderError(err),
				}),
			)
			.on("error", (err) =>
				sublogger.error(`error(${err})`, { e: renderError(err) }),
			)
			.on("stalled", (jobId) =>
				sublogger.warn(`stalled id=${jobId}`),
			)
			.waitUntilReady()
			.then(() => {});
	}

	return [queue, initWorker];
}

export function processorTimeout<P extends Processor>(processor: P, timeout: number) {
	return (job: Job) => {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error("timeout reached")), timeout * 1000);
			processor(job)
				.then(resolve)
				.catch(reject)
				.finally(() => clearTimeout(timer));
		});
	};
}

export const defaultJobOpts = {
	removeOnComplete: process.env["NODE_ENV"] === "production" ? { age: 600 } : true,
	removeOnFail: process.env["NODE_ENV"] === "production" ? { age: 3600 } : true,
}
