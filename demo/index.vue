<script lang="ts" setup>
import { ref, computed, watch, markRaw } from 'vue';
import { Source } from '@neeloong/table';
import Gantt from '@neeloong/table-gantt';
import { useGroup, Header, Body, Group, useColumns, type VueColumn } from '@neeloong/table-vue';

import createLine, { type GanttLine } from './createLine';
import createDot, { type GanttDot } from './createDot';
import ganttTooltip from './ganttTooltip';
import rows from './data'
import baseColumns from './columns';
import units from './units';
import { id, parent } from './symbol.mts';

const dotDefines: GanttDot[] = [];
const lineDefines: GanttLine[] = [{
	label: '计划',
	start: 'startDate',
	end: 'endDate',
	position: 5,
	width: 10,
}];


const key = ref<keyof typeof units>('month');
const unit = computed(() => units[key.value]);


const checkedIds = ref<any[]>([]);
const selectedId = ref<any>();
const expandedIds = ref<any[]>([]);
const dots = computed(() => dotDefines.map(createDot));
const lines = computed(() => lineDefines.map(createLine))
const tooltip = computed(() => ganttTooltip.bind(null, lineDefines))

const startFixed = computed(() => 1);
const ganttColumn = computed<VueColumn>(() => {
	const { width, headers, bg, showDate } = unit.value;
	return {
		extensions: [Gantt({
			summarize: () => true,
			dayWidth: width,
			headers: headers,
			bg: bg,
			showDate: showDate,
			tooltip: tooltip.value,
			dots: dots.value || [],
			lines: lines.value || [],
		})]
	}
})
const table = markRaw(new Source({
	idKey: [id],
	parentKey: parent,
}));
table.selectable = true
const source = ref(table)
watch(() => rows, rows => {
	table.setValue(rows);
}, { immediate: true });
watch(selectedId, v => {
	table.selectedId = v;
}, { immediate: true });
watch(expandedIds, expanded => {
	table.expanded = expanded || [];
}, { immediate: true });
watch(checkedIds, checked => {
	table.checked = checked || [];
}, { immediate: true });
table.listen('checkedChange', v => { checkedIds.value = v });
table.listen('selectedChange', v => { selectedId.value = v });
table.listen('collapseChange', v => { expandedIds.value = v });
const [columns, CellRenderer] = useColumns(baseColumns)
const [ganttColumns, GanttCellRenderer] = useColumns(computed(() => [ganttColumn.value]))
const group = useGroup(source, columns, startFixed)
const ganttGroup = useGroup(source, ganttColumns)


const list = Object.entries(units).map(([k, { label }]) => [k, label])


const header1 = ref<HTMLElement>();
const header2 = ref<HTMLElement>();
const body1 = ref<HTMLElement>();
const body2 = ref<HTMLElement>();

function p1(e: PointerEvent) {
	const s = e.target as HTMLElement;
	const pointerId = e.pointerId;
	s.setPointerCapture(pointerId);
	set(e, body1.value, header1.value)
}
function p2(e: PointerEvent) {
	const s = e.target as HTMLElement;
	const pointerId = e.pointerId;
	s.setPointerCapture(pointerId);
	set(e, body2.value, header2.value)
}
function c(e: PointerEvent) {
	const s = e.target as HTMLElement;
	const pointerId = e.pointerId;
	if (!s.hasPointerCapture(pointerId)) { return }
	s.releasePointerCapture(pointerId)
}
function set(e: PointerEvent, body?: HTMLElement, header?: HTMLElement) {
	const s = e.target as HTMLElement;
	if (!s.hasPointerCapture(e.pointerId)) { return }
	const k = e.offsetX / s.clientWidth;
	if (!body) { return; }
	const { scrollWidth, clientWidth } = body
	if (scrollWidth <= clientWidth) { return; }
	const v = k * scrollWidth - clientWidth / 2
	body.scrollLeft = v;
	if (header) {
		header.scrollLeft = v;

	}

}
function set1(e: PointerEvent) {
	set(e, body1.value, header1.value)
}
function set2(e: PointerEvent) {
	set(e, body2.value, header2.value)
}
</script>

<template>
	<select v-model="key">
		<option v-for="[v, l] in list" :value="v">{{ l }}</option>
	</select>
	<Group #default="{ group }" :source="source" :columns="[...baseColumns, ganttColumn]">
		111
		<Header :group="group" :class="$style.header" />
		222

		<Body :group="group" />
		3333
	</Group>
	<div :class="$style.root">

		<div :class="$style.container">
			<div :class="$style.header" ref="header1">
				<Header :group="group" />
			</div>
			<div :class="$style.header" ref="header2">
				<Header :group="ganttGroup" />

			</div>
			<div :class="$style.body" ref="body1">

				<Body :group="group" />

			</div>
			<div :class="$style.body" ref="body2">


				<Body :group="ganttGroup" />

			</div>
			<span :class="$style.scrollbar" @pointermove="set1" @pointerdown="p1" @pointercancel="c" @pointerup="c" />
			<span :class="$style.scrollbar" @pointermove="set2" @pointerdown="p2" @pointercancel="c" @pointerup="c" />

		</div>
	</div>
	<CellRenderer />
	<GanttCellRenderer />
</template>
<style module lang="less">
body {
	margin: 0;
}

.scrollbar {
	background: #000;

	position: sticky;
	inset-block-end: 0;
	block-size: 20px;
	inline-size: 100%;
	z-index: 100;

}

.root {
	margin-bottom: 50px;
}

.header {

	overflow: scroll;
	position: sticky !important;
	inset-block-start: 0;
	z-index: 100;

	&::-webkit-scrollbar {
		height: 0;
		width: 0;

	}
}

.body {
	overflow: scroll;

	&::-webkit-scrollbar {
		height: 0;
		width: 0;

	}
}

.container {
	padding-block-end: 20px;
	// margin: 50px;
	display: grid;
	grid-template-columns: 50% 50%;
	grid-template-rows: 24px auto auto;
	flex-direction: row;
	width: 100%;


	--neeloong-table-header-background-color: #f5f7f7;
	--neeloong-table-row-border-color: rgba(189, 195, 199, 0.58);
	font-size: 12px;

	// --neeloong-table-inline-offset: 50px;
	// --neeloong-table-block-offset: 50px;
	:global {
		.neeloong-table {
			flex: 1
		}

		.neeloong-table-header:not(.neeloong-table-gantt-header, .neeloong-table-checkable) {
			padding-inline: 12px;
		}

		.neeloong-table-cell:not(.neeloong-table-gantt-lines, .neeloong-table-checkable) {
			padding-inline: 12px;
		}
	}
}
</style>
