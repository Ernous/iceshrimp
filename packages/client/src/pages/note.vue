<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
				:to="`#${noteId}`"
		/></template>
		<MkSpacer :content-max="800" :marginMin="6">
			<div class="fcuexfpr">
				<transition
					:name="$store.state.animation ? 'fade' : ''"
					mode="out-in"
				>
					<div v-if="appearNote" class="note">
						<div class="main _gap">
							<div class="note _gap">
								<MkRemoteCaution
									v-if="appearNote.user.host != null"
									:href="appearNote.url ?? appearNote.uri"
								/>
								<XNoteDetailed
									:key="appearNote.id"
									v-model:note="appearNote"
									:expandAllCws="expandAllCws"
									class="note"
								/>
							</div>
						</div>
					</div>
					<MkError v-else-if="error" @retry="fetch()" />
					<MkLoading v-else />
				</transition>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, defineComponent, watch, ref } from 'vue';
import * as misskey from "iceshrimp-sdk";
import XNoteDetailed from "@/components/MkNoteDetailed.vue";
import XNotes from "@/components/MkNotes.vue";
import MkRemoteCaution from "@/components/MkRemoteCaution.vue";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";

const props = defineProps<{
	noteId: string;
}>();

let note = ref<null | misskey.entities.Note>();
let error = ref();
let isRenote = ref(false);
let appearNote = ref<null | misskey.entities.Note>();
let expandAllCws = ref(defaultStore.state.alwaysExpandCws);

const prevPagination = {
	endpoint: "users/notes" as const,
	limit: 10,
	params: computed(() =>
		appearNote.value
			? {
					userId: appearNote.value.userId,
					untilId: appearNote.value.id,
			  }
			: null,
	),
};

const nextPagination = {
	reversed: true,
	endpoint: "users/notes" as const,
	limit: 10,
	params: computed(() =>
		appearNote.value
			? {
					userId: appearNote.value.userId,
					sinceId: appearNote.value.id,
			  }
			: null,
	),
};

function fetchNote() {
	note.value = null;
	os.api("notes/show", {
		noteId: props.noteId,
	})
		.then((res) => {
			note.value = res;
			isRenote.value =
				note.value.renote != null &&
				note.value.text == null &&
				note.value.fileIds.length === 0 &&
				note.value.poll == null;
			appearNote.value = isRenote.value
				? (note.value.renote as misskey.entities.Note)
				: note.value;
		})
		.catch((err) => {
			error.value = err;
		});
}

function toggleAllCws() {
	expandAllCws.value = !expandAllCws.value;
}

watch(() => props.noteId, fetchNote, {
	immediate: true,
});

const headerActions = computed(() => appearNote.value ? [
	{
		icon: `${expandAllCws.value ? "ph-eye" : "ph-eye-slash"} ph-bold ph-lg`,
		text: expandAllCws.value ? i18n.ts.collapseAllCws : i18n.ts.expandAllCws,
		handler: toggleAllCws,
	},
]:[]);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		appearNote.value
			? {
					title: i18n.t("noteOf", {
						user: appearNote.value.user.name || appearNote.value.user.username,
					}),
					subtitle: new Date(appearNote.value.createdAt).toLocaleString(),
					avatar: appearNote.value.user,
					path: `/notes/${appearNote.value.id}`,
					share: {
						title: i18n.t("noteOf", {
							user:
								appearNote.value.user.name ||
								appearNote.value.user.username,
						}),
						text: appearNote.value.text,
					},
			  }
			: null,
	),
);
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.fcuexfpr {
	#iceshrimp_app > :not(.wallpaper) & {
		background: var(--bg);
	}

	> .note {
		> .main {
			> .load {
				min-width: 0;
				margin: 0 auto;
				border-radius: 999px;

				&.next {
					margin-bottom: var(--margin);
				}

				&.prev {
					margin-top: var(--margin);
				}
			}

			> .note {
				> .note {
					border-radius: var(--radius);
					background: var(--panel);
				}
			}
		}
	}
}
</style>
