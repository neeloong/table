import T1 from './A1.vue'
import {Check, Tree} from '@neeloong/table';
import type {VueColumn} from '@neeloong/table-vue';
import { id, parent } from './symbol.mts';

const columns:VueColumn[] = [
  {
    width: 200,
    title: 'id',
    field: 'id',
    component: T1,
    resizable: true,
    minWidth: 20,
    extensions: [Check],
  },
  {
    extensions: [Tree],
    width: 200,
    title: 'name',
    field: [id],
    minWidth: 20,
    resizable: true
  },
  {
    width: 100,
    title: 'parent',
    field: parent,
    minWidth: 20,
    resizable: true
  },
  {
    width: 200,
    title: 'title',
    field: 'title',
    minWidth: 20,
    resizable: true
  },
  {
    width: 200,
    title: 'title',
    field: 'title',
    component: T1,
    minWidth: 20,
    resizable: true
  },
]

export default columns
