<template>
  <div class="common-table" v-loading="isLoading">
    <!-- 操作栏插槽，可获取当前选中行数据 currentRow -->
    <slot name="operaNav" :row="currentRow"></slot>
    
    <el-table
      @current-change="handleTableCurrentChange"
      v-bind="tableConf"
      v-on="tableConf.on"
      class="fit-empty"
      ref="commonTable"
    >
      <template v-if="tableConf.selection">
        <el-table-column
          v-for="(v, i) in tableConf.selection"
          :key="i"
          v-bind="v"
        ></el-table-column>
      </template>

      <cm-table-dynamic-column
        v-for="(v, i) in tableConf.columnList"
        :key="'column-' + i"
        :conf="v"
      />
    </el-table>

    <el-row
      type="flex"
      align="middle"
      class="common-pagination"
      v-if="tableConf.pagintion"
    >
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-bind="dynamicPagintion"
      ></el-pagination>
    </el-row>
  </div>
</template>

<script>
import { apiTools, chainAccess, getValue } from '../../tools'
import CmTableDynamicColumn from './cm-table-dynamic-column.vue'

export default {
  name: 'CommonTable',
  components: {
    CmTableDynamicColumn,
  },
  props: {
    headTitle: [String, Array],
    tableConf: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    calcPageSize() {
      const size = this.$get(() => this.tableConf.requester.params[1])
      return size || this.pageSize
    },
    dynamicPagintion() {
      const { tableConf, pageInfo, calcPageSize } = this
      const {
        currentPage,
        totalPages,
        totalCounts,
      } = pageInfo || {}

      const attrs = {
        'page-size': calcPageSize,
        'current-page': currentPage,
        'page-count': totalPages,
        'page-sizes': [5, 10, 20],
        total: totalCounts,
        layout: 'total, prev, sizes, pager, next',
        background: true,
        ...tableConf?.pagintion.bind,
      }

      return attrs
    },
  },
  data() {
    return {
      isLoading: false,
      pageInfo: {},
      pageSize: 10,
      keywords: '',
      currentRow: null,
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...apiTools,

    $get: getValue,
    async init() {
      const { initData, restTableLayout } = this

      await initData()
      restTableLayout()
    },
    restTableLayout() {
      this.$refs.commonTable?.doLayout?.()
    },
    handleTableCurrentChange(val) {
      if (!this.tableConf['highlight-current-row']) return
      this.currentRow = val
    },
    handleCurrentChange(cur) {
      const { $get, initData, tableConf } = this

      $get(() => (tableConf.requester.params[0] = cur))
      initData()
    },
    handleSizeChange(size) {
      const { $get, initData, tableConf } = this

      $get(() => (tableConf.requester.params[1] = size))
      initData()
    },
    async initData() {
      const { tableConf, apiReq, decodeData } = this
      const { requester } = tableConf

      if (!requester) return

      const { api, params } = requester

      this.isLoading = true

      const { object } = await apiReq(api)(...(params ?? []))
      this.pageInfo = object
      tableConf.data = decodeData(object) || []

      this.isLoading = false
    },
    decodeData(res) {
      const { getter, path } = this.tableConf.requester ?? {}
      const decode = path ? chainAccess(res, path) : res
      const data = getter?.(decode) ?? decode

      return data
    },
    async search(...parmasSearch) {
      const { tableConf, apiReq, decodeData } = this
      const { api, params } = tableConf.requester
      const p = parmasSearch.length ? [...parmasSearch] : [...params]

      this.isLoading = true
      const { object } = await apiReq(api)(...p)
      this.isLoading = false

      this.pageInfo = object
      tableConf.data = decodeData(object) || []
    },
  },
}
</script>

<style lang="scss" scoped></style>
