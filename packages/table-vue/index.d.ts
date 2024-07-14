import type { Group as TableGroup, Source, Header as TableHeader, ColumnOptions } from '@neeloong/table';
import type { Component, ComputedRef, Raw, Ref } from 'vue';

export interface VueColumn extends ColumnOptions {
	class?: string;
	component?: any;
}

export const Body: Component<{
	group?: TableGroup
	rowHeight?: number;
}>;

export const Group: Component<{
	columns?: VueColumn[];
	startFixed?: number;
	source?: Source;
}>;

export const Header: Component<{ group?: TableGroup }>;

export function useBody(
	root?: Ref<HTMLElement | undefined | null> | HTMLElement | undefined | null,
	group?: Ref<TableGroup | undefined> | TableGroup | undefined,
	rowHeight?: number | undefined
): ComputedRef<Body | undefined>;

export function useColumns(
	columns?: VueColumn[] | undefined | Ref<VueColumn[] | undefined>,
): [ComputedRef<ColumnOptions[]>, Component]

export function useGroup(
	source?: Source | Ref<Source | undefined | null>,
	columns?: VueColumn[] | Ref<VueColumn[]>,
	startFixed?: number | Ref<number | undefined>,
): ComputedRef<TableGroup | undefined>

export function useHeader(
	root?: Ref<HTMLElement | undefined | null> | HTMLElement | null,
	group?: Ref<TableGroup | undefined> | TableGroup,
): ComputedRef<TableHeader | undefined>;

export function useSource(data?: object[] | Ref<object[]> | undefined, options?: {
	selectable?: boolean | Ref<boolean> | undefined;
} | undefined): ComputedRef<Raw<Source> | undefined>
