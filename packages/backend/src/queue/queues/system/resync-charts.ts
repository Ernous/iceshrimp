import { queueLogger } from "../../logger.js";
import { driveChart, notesChart, usersChart } from "@/services/chart/index.js";

const logger = queueLogger.createSubLogger("resync-charts");

export async function resyncCharts(): Promise<string> {
	logger.info("Resync charts...");

	// TODO: ユーザーごとのチャートも更新する
	// TODO: インスタンスごとのチャートも更新する
	await Promise.all([
		driveChart.resync(),
		notesChart.resync(),
		usersChart.resync(),
	]);

	logger.succ("All charts successfully resynced.");
	return "Success";
}
