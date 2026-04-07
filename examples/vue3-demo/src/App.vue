<script setup lang="ts">
import { ref } from 'vue'
import {
  CommonTable,
  CommonTableTs,
  CommonSelect,
} from '@conf-component-tool-lib/vue3-element-plus'
import type { TableConf } from '@conf-component-tool-lib/vue3-element-plus'

const selectValue = ref('')
const selectData = ref([
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
])

const tableConf = ref<TableConf>({
  data: [
    { name: '张三', age: 28, dept: '技术部' },
    { name: '李四', age: 32, dept: '产品部' },
    { name: '王五', age: 25, dept: '设计部' },
  ],
  columnList: [
    { prop: 'name', label: '姓名', align: 'center' },
    { prop: 'age', label: '年龄', align: 'center' },
    { prop: 'dept', label: '部门', align: 'center' },
  ],
})

const tableConfTs = ref<TableConf>({
  data: [
    { id: 1, title: 'TypeScript 组件', status: '完成' },
    { id: 2, title: '类型安全', status: '进行中' },
  ],
  columnList: [
    { prop: 'id', label: 'ID', align: 'center' },
    { prop: 'title', label: '标题', align: 'center' },
    { prop: 'status', label: '状态', align: 'center' },
  ],
})
</script>

<template>
  <div id="app" style="padding: 24px">
    <h1>Vue3 + Element Plus Demo</h1>

    <h2>CommonTable（JS 版）</h2>
    <CommonTable :tableConf="tableConf" />

    <h2 style="margin-top: 24px">CommonTableTs（TS 版）</h2>
    <CommonTableTs :tableConf="tableConfTs" />

    <h2 style="margin-top: 24px">CommonSelect 测试</h2>
    <CommonSelect
      v-model="selectValue"
      :data="selectData"
      :options="{ key: 'label', value: 'value' }"
    />
    <p>选中值: {{ selectValue }}</p>
  </div>
</template>
