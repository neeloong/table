/** @import { PropType } from 'vue' */
/** @import { Column } from '@neeloong/table' */

import { defineComponent, h } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: null,
    data: Object,
    column: /** @type {PropType<Column>} */(Object),
    level: Number,
  },
  render() { return h('span', `Vue: ${this.value}`); },
})
