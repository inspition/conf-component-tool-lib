<template>
  <div class="common-table" v-loading="isLoading">
    <!-- <slot name="header">
      <cm-header
        @title-click="$emit('title-click', $event)"
        :icon="tableConf.icon"
        :title="headTitle || tableConf.headTitle"
      />
    </slot> -->

    <!-- 操作栏插槽，可获取当前选中行数据 currentRow -->
    <slot name="operaNav" :row="currentRow"></slot>
    
    <!-- 主表格元素
      - v-bind="tableConf" 绑定所有表格配置属性（data, header-cell-style, highlight-current-row 等）
      - v-on="tableConf.on" 绑定 tableConf.on 中定义的自定义事件监听
      - @current-change 监听行选中变化事件
    -->
    <el-table
      @current-change="handleTableCurrentChange"
      v-bind="tableConf"
      v-on="tableConf.on"
      class="fit-empty"
      ref="commonTable"
    >
      <!-- 独立多选列：当 tableConf.selection 存在时，为每个配置生成对应的多选列 -->
      <template v-if="tableConf.selection">
        <el-table-column
          v-for="(v, i) in tableConf.selection"
          :key="i"
          v-bind="v"
        ></el-table-column>
      </template>

      <!-- 动态列配置组件，支持多级树表头
        根据 tableConf.columnList 递归生成表列
        - prop/label: 基础列属性
        - formatter: 格式化单元格内容
        - headerRender: 自定义表头渲染
        - render: 自定义单元格渲染
        - columnList: 嵌套子列（树表头）
      -->
      <cm-table-dynamic-column
        v-for="(v, i) in tableConf.columnList"
        :key="'column-' + i"
        :conf="v"
      />
    </el-table>

    <!-- 分页栏：当 tableConf.pagintion 配置存在时显示
      dynamicPagintion 计算属性会动态合并默认分页配置和自定义配置
    -->
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
    /**
     * 表格头部标题，可覆盖 tableConf.headTitle
     * @type {String|Array}
     */
    headTitle: [String, Array],
    /**
     * 表格配置对象，包含所有表格相关配置
     * @type {Object}
     * @property {Array} data - 表格数据
     * @property {Object} header-cell-style - 表头样式，如 {color: 'white', background: '#CF324A'}
     * @property {Object} on - el-table 事件绑定
     * @property {Boolean} highlight-current-row - 是否高亮当前行
     * @property {Object} selection - 多选列配置数组
     * @property {Object} pagintion - 分页配置，包含 bind 属性用于覆盖默认分页属性
     * @property {Array} columnList - 列配置数组，支持多级嵌套树表头
     *   @property {String} prop - 数据字段名
     *   @property {String} label - 列标题
     *   @property {String} align - 对齐方式，如 'center'
     *   @property {Function} formatter - 格式化函数
     *   @property {Object} headerRender - 自定义表头渲染对象，包含 render() 函数
     *   @property {Object} render - 自定义单元格渲染对象，包含 props 和 render() 函数
     *   @property {Array} columnList - 子列配置，用于多级树表头
     * @property {Object} requester - 数据请求配置
     *   @property {Function} api - 数据请求 API 函数
     *   @property {Array} params - 请求参数，[pageIndex, pageSize]，默认 [1, 10]
     *   @property {String} path - 接口返回数据解析路径，如 'data.list'，用于定位表格数据
     *   @property {Function} getter - 数据过滤/转换函数，接收解析后的数据
     */
    tableConf: {
      type: Object,
      default() {
        return {
          // data: [],
          // columnList: [],
          // requester: {
          //   params: [1, 10],
          //   api: () => Promise.resolve(),
          //   path: '', // 接口返回后数据解析路径
          //   getter: () => null, // 返回数据过滤方法
          // },
        }
      },
    },
  },
  computed: {
    /**
     * 计算当前页大小
     * @return {Number} 从 requester.params[1] 中获取页大小，或使用默认 pageSize
     */
    calcPageSize() {
      const size = this.$get(() => this.tableConf.requester.params[1])
      return size || this.pageSize
    },
    /**
     * 动态分页属性处理，合并默认配置和自定义配置
     * 监听 pageInfo 变化后，将数据同步到分页组件显示
     * 
     * @return {Object} el-pagination 的完整配置对象
     *   - page-size: 当前页大小
     *   - current-page: 当前页码
     *   - page-count: 总页数
     *   - page-sizes: 可选的页大小列表 [5, 10, 20]
     *   - total: 总数据条数
     *   - layout: 分页组件布局（显示总条数、上一页、页大小选择器、页码、下一页）
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
      /** 分页信息对象，包含 currentPage, totalPages, totalCounts 等 */
      pageInfo: {},
      /** 默认每页大小 */
      pageSize: 10,
      /** 搜索关键词 */
      keywords: '',
      /** 当前选中行数据 */
      currentRow: null,
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...apiTools,

    $get: getValue,
    /**
     * 组件初始化：加载数据并重置表格布局
     */
    async init() {
      const { initData, restTableLayout } = this

      await initData()

      restTableLayout()
    },
    /**
     * 重置表格布局（处理动态列变化后的列宽问题）
     */
    restTableLayout() {
      this.$refs.commonTable?.doLayout?.()
    },
    /**
     * 处理表格当前行变化事件，用于高亮当前行和获取当前选中行
     * @param {Object} val - 当前行数据
     */
    handleTableCurrentChange(val) {
      if (!this.tableConf['highlight-current-row']) return
      // console.log('handleTableCurrentChange', val);

      this.currentRow = val
    },
    /**
     * 处理分页组件页码变化，更新 requester.params[0]（页码）并重新加载数据
     * @param {Number} cur - 新的页码
     */
    handleCurrentChange(cur) {
      const { $get, initData, tableConf } = this

      $get(() => (tableConf.requester.params[0] = cur))
      initData()
    },
    /**
     * 处理分页组件页大小变化，更新 requester.params[1]（页大小）并重新加载数据
     * @param {Number} size - 新的每页大小
     */
    handleSizeChange(size) {
      const { $get, initData, tableConf } = this

      $get(() => (tableConf.requester.params[1] = size))
      initData()
    },
    /**
     * 初始化表格数据：调用 API 加载数据并更新表格
     * 流程：
     * 1. 获取 requester 配置（api 和 params）
     * 2. 调用 API 获取原始数据
     * 3. 通过 decodeData 解析和过滤数据
     * 4. 更新 tableConf.data 和 pageInfo
     */
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
     * 解析 API 返回数据
     * 处理流程：
     * 1. 使用 path 从返回数据中提取目标数据（如 'data.list' 会从多层对象中提取）
     * 2. 若配置了 getter 函数，则对数据进行自定义过滤/转换
     * 3. 返回最终处理后的数据供表格展示
     * 
     * @param {Object} res - API 返回的原始数据
     * @return {Array} 解析后用于表格渲染的数据数组
     */
    decodeData(res) {
      const { getter, path } = this.tableConf.requester ?? {}
      const decode = path ? chainAccess(res, path) : res
      const data = getter?.(decode) ?? decode

      return data
    },
    /**
     * 自定义搜索方法：使用新参数调用 API 并更新表格数据
     * 常用于搜索、筛选操作
     * 
     * @param {...*} parmasSearch - 新的搜索参数，会覆盖原有的 requester.params
     */
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
  .common-pagination {
    justify-content: flex-end;
    margin-top: 13px;
  }
}
</style>
