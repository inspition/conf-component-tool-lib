<template>
  <div class="common-table" v-loading="isLoading">
    <!-- <slot name="header">
      <cm-header
        @title-click="$emit('title-click', $event)"
        :icon="tableConf.icon"
        :title="headTitle || tableConf.headTitle"
      />
    </slot> -->

    <slot name="operaNav" :row="currentRow"></slot>
    <el-table
      @current-change="handleTableCurrentChange"
      v-bind="tableConf"
      v-on="tableConf.on"
      class="fit-empty"
      ref="commonTable"
    >
      <!-- 独立多选列 -->
      <template v-if="tableConf.selection">
        <el-table-column
          v-for="(v, i) in tableConf.selection"
          :key="i"
          v-bind="v"
        ></el-table-column>
      </template>

      <!-- 动态列配置，支持多级树表头 -->
      <cm-table-dynamic-column
        v-for="(v, i) in tableConf.columnList"
        :key="'column-' + i"
        :conf="v"
      />

      <!-- 动态列配置 -->
      <!-- <el-table-column
        v-for="(v, i) in tableConf.columnList"
        :key="'column-' + i"
        v-bind="v"
      >
        <template slot-scope="scope">
          !-- render || JSX --
          <component
            v-if="v.render"
            :is="v.render"
            :data="getPropVal(scope)"
            :row="scope.row"
            :scope="scope"
            :conf="v"
          ></component>

          {{ (!v.render && $renderScope(scope)) || '' }}
        </template>

        <template slot="header" slot-scope="scope">
          !-- render || JSX --
          <component
            v-if="v.headerRender"
            :is="v.headerRender"
            :scope="scope"
            :conf="v"
          ></component>

          {{ (!v.headerRender && v.label) || '' }}
        </template>
      </el-table-column> -->

      <!-- 缺省行 -->
      <!-- <template slot="empty">
        <None type="noData" />
      </template>-->
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
// import CmHeader from "@/components/CmHeader";
import { apiTools, chainAccess, getValue } from '@/utils/common-tools'
import CmTableDynamicColumn from './cm-table-dynamic-column.vue'

export default {
  name: 'CommonTable',
  components: {
    // CmHeader,
    CmTableDynamicColumn,
  },
  props: {
    headTitle: [String, Array],
    tableConf: {
      type: Object,
      default() {
        return {
          data: [],
          columnList: [
            // {
            //   prop: "prop1",
            //   // label: "商机编码",
            //   align: "center"
            // },
          ],
          requester: {
            params: [1, 10],
            api: () => Promise.resolve(),
            path: '', // 接口返回后数据解析路径
            getter: () => null, // 返回数据过滤方法
          },
        }
      },
    },
  },
  computed: {
    calcPageSize() {
      const size = this.$get(() => this.tableConf.requester.params[1])
      return size || this.pageSize
    },
    /**
     * 分页属性动态处理
     *
     * @return  {[type]}  [return description]
     */
    dynamicPagintion() {
      const { tableConf, pageInfo, calcPageSize } = this
      const {
        currentPage,
        totalPages,
        totalCounts,

        // // 非正式版分页兼容
        // totalElements,
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
    handleTableCurrentChange(val) {
      if (!this.tableConf['highlight-current-row']) return
      // console.log('handleTableCurrentChange', val);

      this.currentRow = val
    },
    /**
     * 获取字段值
     */
    getPropVal({ column: { property }, row = {} } = { column: {} }) {
      return row[property]
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
    /**
     * 解析数据
     *
     * @param   {[type]}  res  [res description]
     *
     * @return  {[type]}       [return description]
     */
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

<style lang="scss" scoped>
.common-table ::v-deep {
  // .el-table {
  //   font-size: 13px;
  //   th {
  //     font-weight: 700;
  //     color: #333;
  //   }
  //   td {
  //     color: #3b426b;
  //   }
  // }
  .common-pagination {
    justify-content: flex-end;
    margin-top: 13px;
  }
}
</style>
