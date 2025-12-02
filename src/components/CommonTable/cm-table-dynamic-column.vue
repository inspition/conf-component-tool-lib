<template>
  <!-- 动态列配置 -->
  <el-table-column v-bind="conf">
    <!-- 递归渲染动态多级树表头 -->
    <cm-table-dynamic-column
      v-for="(v, i) in conf.columnList"
      :key="'cmdc-' + i"
      :conf="v"
    />

    <template slot-scope="scope">
      <!-- render || JSX -->
      <component
        v-if="conf.render"
        :is="conf.render"
        :data="getPropVal(scope)"
        :row="scope.row"
        :scope="scope"
        :conf="conf"
      ></component>

      <!-- <div class="pre-line" v-else>{{ $renderScope(scope) }}</div> -->
      {{ (!conf.render && $renderScope(scope)) || '' }}
    </template>

    <template slot="header" slot-scope="scope">
      <!-- render || JSX -->
      <component
        v-if="conf.headerRender"
        :is="conf.headerRender"
        :scope="scope"
        :conf="conf"
      ></component>

      {{ (!conf.headerRender && conf.label) || '' }}
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'cm-table-dynamic-column',
  props: {
    conf: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    hasChildren() {
      return this.conf?.columnList?.length > 0
    },
  },
  methods: {
    /**
     * 获取字段值
     */
    getPropVal({ column: { property }, row = {} } = { column: {} }) {
      return row[property]
    },
    /**
     * 插槽属性转换
     * @param {Object} scope [插槽属性]
     */
    $renderScope(scope) {
      // console.log(scope)
      const {
        column: { property, formatter },
        row,
      } = scope || {}
      const cellVal =
        // 数值0判断
        (typeof row[property] === 'number' && row[property].toString()) ||
        row[property] ||
        '--'

      return formatter ? formatter(row, scope.column, cellVal) : cellVal
    },
  },
}
</script>

<style lang="scss" scoped></style>
