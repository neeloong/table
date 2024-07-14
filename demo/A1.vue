<script setup lang="ts">
import type { Column } from '@neeloong/table';

defineProps<{
	value: any;
	data: object;
	column: Column;
	level: number;
}>();

</script>
<script lang="ts">

// 声明额外的选项
export default {
  inheritAttrs: false,
}
</script>
<template>
	<span>
		Vue: {{value}}
	</span>
</template>
