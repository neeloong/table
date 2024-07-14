import { defineComponent, h } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: null,
    data: Object,
    column: /** @type {import('vue').PropType<import('@neeloong/table').Column>} */(Object),
    level: Number,
  },
  render() { return h('span', `Vue: ${this.value}`); },
})
