import type { ColumnOptions } from '@neeloong/table';

export interface VueColumn extends ColumnOptions {
	class?: string;
	component?: any;
}
