import { computed, ref, onMounted, onUnmounted, shallowRef, watchEffect } from 'vue';

/**
 * @template {{destroy(): void}} T
 * @param {() => T | undefined} create 
 * @returns {import('vue').ComputedRef<T | undefined>}
 */
export default function useDestroyable(create) {
	/** @type {T | undefined} */
	let oldArea;
	const areaRef = shallowRef(oldArea);
	const mounted = ref(false);
	function update() {
		if (oldArea) { oldArea.destroy(); }
		oldArea = mounted.value ? create() : undefined;
		areaRef.value = oldArea;
	}
	watchEffect(update);
	onMounted(() => mounted.value = true)
	onUnmounted(() => {mounted.value = false; update();});
	return computed(() => areaRef.value);
}
