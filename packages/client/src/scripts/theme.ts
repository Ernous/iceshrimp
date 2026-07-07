import { ref } from "vue";
import tinycolor from "tinycolor2";
import { globalEvents } from "@/events";

export type Theme = {
	id: string;
	name: string;
	author: string;
	desc?: string;
	base?: "dark" | "light";
	props: Record<string, string>;
};

import lightTheme from "@/themes/_light.json5";
import darkTheme from "@/themes/_dark.json5";
import lightThemeBasic from "@/themes/l-iceshrimp.json5";
import darkThemeBasic from "@/themes/d-iceshrimp.json5";
import { deepClone } from "./clone";
import { defaultStore } from "@/store";

export const themeProps = Object.keys(lightTheme.props).filter(
	(key) => !key.startsWith("X"),
);

const _additionalThemeModules = import.meta.glob<{ default: Theme }>([
	"@/themes/l-rosepinedawn.json5",
	"@/themes/l-light.json5",
	"@/themes/l-nord.json5",
	"@/themes/l-gruvbox.json5",
	"@/themes/l-coffee.json5",
	"@/themes/l-apricot.json5",
	"@/themes/l-rainy.json5",
	"@/themes/l-vivid.json5",
	"@/themes/l-cherry.json5",
	"@/themes/l-sushi.json5",
	"@/themes/l-u0.json5",
	"@/themes/d-rosepine.json5",
	"@/themes/d-rosepinemoon.json5",
	"@/themes/d-dark.json5",
	"@/themes/d-nord.json5",
	"@/themes/d-gruvbox.json5",
	"@/themes/d-catppuccin-frappe.json5",
	"@/themes/d-catppuccin-mocha.json5",
	"@/themes/d-persimmon.json5",
	"@/themes/d-astro.json5",
	"@/themes/d-future.json5",
	"@/themes/d-botanical.json5",
	"@/themes/d-green-lime.json5",
	"@/themes/d-green-orange.json5",
	"@/themes/d-cherry.json5",
	"@/themes/d-ice.json5",
	"@/themes/d-u0.json5",
], { eager: false });

export const getBuiltinThemes = () =>
	Promise.all(
		Object.values(_additionalThemeModules).map((loader) => loader().then((m) => m.default)),
	).then((themes) => [...themes, lightThemeBasic, darkThemeBasic]);

export const getBuiltinThemesRef = () => {
	const builtinThemes = ref<Theme[]>([]);
	getBuiltinThemes().then((themes) => (builtinThemes.value = themes));
	return builtinThemes;
};

let timeout = null;

export function applyTheme(theme: Theme, persist = true) {
	if (timeout) window.clearTimeout(timeout);

	document.documentElement.classList.add("_themeChanging_");

	timeout = window.setTimeout(() => {
		document.documentElement.classList.remove("_themeChanging_");
	}, 1000);

	const colorSchema = theme.base === "dark" ? "dark" : "light";

	// Deep copy
	const _theme = deepClone(theme);

	if (_theme.base) {
		const base = [lightTheme, darkTheme].find((x) => x.id === _theme.base);
		if (base) _theme.props = Object.assign({}, base.props, _theme.props);
	}

	const props = compile(_theme);

	for (const tag of document.head.children) {
		if (tag.tagName === "META" && tag.getAttribute("name") === "theme-color") {
			tag.setAttribute("content", props["htmlThemeColor"]);
			break;
		}
	}

	for (const [k, v] of Object.entries(props)) {
		document.documentElement.style.setProperty(`--${k}`, v.toString());
	}

	document.documentElement.style.setProperty("color-schema", colorSchema);

	if (persist) {
		localStorage.setItem("theme", JSON.stringify(props));
		localStorage.setItem("colorSchema", colorSchema);
	}

	// Site-wide notification that the theme has changed
	globalEvents.emit("themeChanged");
}

function compile(theme: Theme): Record<string, string> {
	function getColor(val: string, key?: string): tinycolor.Instance {
		// ref (prop)
		if (val[0] === "@") {
			return getColor(theme.props[val.slice(1)]);
		}

		// ref (const)
		else if (val[0] === "$") {
			return getColor(theme.props[val]);
		}

		// func
		else if (val[0] === ":") {
			const parts = val.split("<");
			const func = parts.shift().slice(1);
			const arg = parseFloat(parts.shift());
			const color = getColor(parts.join("<"));

			const ignoreAlphaForKeys = ["windowHeader", "acrylicPanel", "pageHeader"];

			switch (func) {
				case "darken":
					return color.darken(arg);
				case "lighten":
					return color.lighten(arg);
				case "alpha":
					if (!defaultStore.state.useBlurEffect && key && ignoreAlphaForKeys.includes(key)) {
						return color.setAlpha(1.0);
					}
					else {
						return color.setAlpha(arg);
					}
				case "hue":
					return color.spin(arg);
				case "saturate":
					return color.saturate(arg);
			}
		}

		// other case
		return tinycolor(val);
	}

	const props = {};

	for (const [k, v] of Object.entries(theme.props)) {
		if (k.startsWith("$")) continue; // ignore const

		props[k] = v.startsWith('"')
			? v.replace(/^"\s*/, "")
			: genValue(getColor(v, k));
	}

	return props;
}

function genValue(c: tinycolor.Instance): string {
	return c.toRgbString();
}

export function validateTheme(theme: Record<string, any>): boolean {
	if (theme.id == null || typeof theme.id !== "string") return false;
	if (theme.name == null || typeof theme.name !== "string") return false;
	if (theme.base == null || !["light", "dark"].includes(theme.base))
		return false;
	if (theme.props == null || typeof theme.props !== "object") return false;
	return true;
}
