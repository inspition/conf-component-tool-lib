<template>
  <div id="app" style="padding: 24px">
    <h1>Vue2 + Element UI Demo</h1>

    <h2>CommonTable 测试</h2>
    <CommonTable :tableConf="tableConf" />

    <h2 style="margin-top: 24px">CommonSelect 测试</h2>
    <CommonSelect
      :value="selectValue"
      :data="selectData"
      :options="{ key: 'label', value: 'value' }"
      :bind="{ filterable: true, clearable: true, style: { width: '300px' } }"
      @change="selectValue = $event"
    />

    <h2 style="margin-top: 24px">CommonDescriptions 测试</h2>
    <CommonDescriptions :tableConf="descConf" />
  </div>
</template>

<script>
import {
  CommonTable,
  CommonSelect,
  CommonDescriptions,
} from '@conf-tool/vue2-element'

export default {
  name: 'App',
  components: { CommonTable, CommonSelect, CommonDescriptions },
  data() {
    return {
      selectValue: [],
      selectData: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' },
        { label: '选项三', value: '3' },
      ],
      tableConf: {
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
        on: {},
      },
      descConf: {
        data: {
          name: '张三',
          age: 28,
          dept: '技术部',
          phone: '13800138000',
        },
        trList: [
          {
            tdList: [
              { label: '姓名', prop: 'name' },
              { label: '年龄', prop: 'age' },
            ],
          },
          {
            tdList: [
              { label: '部门', prop: 'dept' },
              { label: '电话', prop: 'phone' },
            ],
          },
        ],
      },
    }
  },
}
</script>
