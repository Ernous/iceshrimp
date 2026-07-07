<template>
	<button class="kpoogebi _button bite-button" :class="{
		full,
		large,
		wait,
		active: hasBittenBack,
	}" :disabled="wait" @click.stop="onClick" :aria-label="`bite ${user.name || user.username} back`">
		<span>{{ i18n.ts.biteBack }}</span><i class="ph-tooth ph-bold ph-lg"></i>
	</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import type * as Misskey from "iceshrimp-sdk";
import * as os from "@/os";
import { i18n } from "@/i18n";

const props = withDefaults(
	defineProps<{
		user: Misskey.entities.UserLite,
		bite: Misskey.entities.Bite,
		full: boolean,
		large: boolean,
	}>(),
	{
		full: false,
		large: false
	},
);

let wait = ref(false);
let hasBittenBack = ref<boolean>(props.bite.replied);

async function onClick() {
	wait.value = true;

	try {
		await os.api("bites/create", {
			targetType: "bite",
			targetId: props.bite.id,
		});
		hasBittenBack.value = true;
	} finally {
		wait.value = false;
	}
}
</script>

<style lang="scss" scoped>
.bite-button {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	color: var(--accent);
	border: solid 1px var(--accent);
	padding: 0;
	font-size: 16px;
	width: 2em;
	height: 2em;
	border-radius: 100px;
	background: var(--bg);
	vertical-align: middle;
	margin-left: 0.5em;

	&.full {
		padding: 0.2em 0.7em;
		width: auto;
		font-size: 14px;
	}

	&.large {
		font-size: 16px;
		height: 38px;
		padding: 0 12px 0 16px;
	}

	&:not(.full) {
		width: 31px;

		span {
			display: none;
		}
	}

	&:focus-visible {
		&:after {
			content: "";
			pointer-events: none;
			position: absolute;
			top: -5px;
			right: -5px;
			bottom: -5px;
			left: -5px;
			border: 2px solid var(--focus);
			border-radius: 32px;
		}
	}

	&.active {
		color: var(--fgOnAccent);
		background: var(--accent);

		&:hover {
			background: var(--accentLighten);
			border-color: var(--accentLighten);
		}

		&:active {
			background: var(--accentDarken);
			border-color: var(--accentDarken);
		}
	}

	&.wait {
		cursor: wait !important;
		opacity: 0.7;
	}

	>span {
		margin-right: 6px;
	}
}
</style>
