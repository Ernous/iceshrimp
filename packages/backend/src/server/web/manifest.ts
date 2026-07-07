import type Koa from "koa";
import { fetchMeta } from "@/misc/fetch-meta.js";
import fs from "fs";
import path from 'path';

const manifest = JSON.parse(fs.readFileSync(path.resolve('./src/server/web/manifest.json'), 'utf-8'));

export const manifestHandler = async (ctx: Koa.Context) => {
	const res = manifest;
	const instance = await fetchMeta(true);

	res.short_name = instance.name || "Iceshrimp";
	res.name = instance.name || "Iceshrimp";
	if (instance.themeColor) res.theme_color = instance.themeColor;

	ctx.set("Cache-Control", "max-age=300");
	ctx.body = res;
};
