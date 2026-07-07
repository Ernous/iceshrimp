import Xev from "xev";
import * as osUtils from "os-utils";
import { fetchMeta } from "@/misc/fetch-meta.js";
import * as os from "node:os";

const ev = new Xev();

const interval = 10000;

const roundCpu = (num: number) => Math.round(num * 1000) / 1000;
const round = (num: number) => Math.round(num * 10) / 10;

export default function () {
	const log = [] as any[];

	ev.on("requestServerStatsLog", (x) => {
		ev.emit(`serverStatsLog:${x.id}`, log.slice(0, x.length || 50));
	});

	fetchMeta().then((meta) => {
		if (!meta.enableServerMachineStats) return;
	});

	async function tick() {
		const cpu = await cpuUsage();
		const memStats = getMemStats();

		const stats = {
			cpu: roundCpu(cpu),
			mem: {
				used: round(memStats.used),
				active: round(memStats.used),
				total: round(memStats.total),
			},
		};
		ev.emit("serverStats", stats);
		log.unshift(stats);
		if (log.length > 200) log.pop();
	}

	tick();
	setInterval(tick, interval);
}

function cpuUsage(): Promise<number> {
	return new Promise((res) => {
		osUtils.cpuUsage((cpuUsage) => {
			res(cpuUsage);
		});
	});
}

function getMemStats() {
	const total = os.totalmem() / 1024 / 1024 / 1024;
	const free = os.freemem() / 1024 / 1024 / 1024;
	return { total, used: total - free };
}
