<template>
  <el-table-column v-bind="conf">
    <cm-table-dynamic-column
      v-for="(v, i) in conf.columnList"
      :key="'cmdc-' + i"
      :conf="v"
    />

    <template slot-scope="scope">
      <component
        v-if="conf.render"
        :is="conf.render"
        :data="getPropVal(scope)"
        :row="scope.row"
        :scope="scope"
        :conf="conf"
      ></component>

      {{ (!conf.render && $renderScope(scope)) || '' }}
    </template>

    <template slot="header" slot-scope="scope">
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
    getPropVal({ column: { property }, row = {} } = { column: {} }) {
      return row[property]
    },
    $renderScope(scope) {
      const {
        column: { property, formatter },
        row,
      } = scope || {}
      const cellVal =
        (typeof row[property] === 'number' && row[property].toString()) ||
        row[property] ||
        '--'

      return formatter ? formatter(row, scope.column, cellVal) : cellVal
    },
  },
}
</script>
