<script lang="ts" setup>
/* 通用表格组件
  ---------------------------------------------------------------
  功能特性：
  1. 支持动态列配置与自定义渲染
  2. 集成分页功能与数据请求
  3. 兼容Element Plus Table所有原生属性
  4. 支持多选列配置
  5. 提供表格布局自动重置能力
  ----------------------------------------------------------------
  使用步骤：
  1. 导入组件：import CommonTable from '#/components/CommonTable.vue'
  2. 配置表格参数：按照TableConf类型定义配置
  3. 绑定数据请求逻辑
  4. 自定义列渲染（可选）
  ----------------------------------------------------------------
*/

import type {
  TableProps as _TableProps,
  PaginationProps,
  TableColumnCtx,
} from 'element-plus'

import type { ComponentInstance } from 'vue'

import { computed, onMounted, ref, defineModel } from 'vue'

import { ElPagination, ElRow, ElTable, ElTableColumn } from 'element-plus'

import { apiReq, chainAccess } from '#/utils/common-tools'

// ====================== 类型定义 ======================
type ColumnProps = Partial<TableColumnCtx<unknown>>

/** 列默认作用域类型 */
interface ColumnDefaultScope {
  row: any
  column: any
  $index: number
}

/** 列配置类型 */
export interface ColumnDef extends ColumnProps {
  /** 自定义单元格渲染组件 */
  render?: ComponentInstance<any>
  /** 自定义表头渲染组件 */
  headerRender?: ComponentInstance<any>
  /** 其他自定义属性 */
  [key: string]: any
}

/** 数据请求器配置 */
export interface Requester {
  /** 请求参数数组 */
  params?: [number, number, any]
  /** 请求API方法 */
  api?: (...args: any[]) => Promise<any>
  /** 响应数据路径（支持链式访问，如 'data.list'） */
  path?: string
  /** 数据转换方法 */
  getter?: (data: any) => any[]
}

/** 表格主配置类型（继承Element Table所有属性） */
export interface TableConf extends Partial<_TableProps<any>> {
  /** 列配置数组（必需） */
  columnList: ColumnDef[]
  /** 多选列配置 */
  selection?: ColumnDef[]
  /** 数据请求配置 */
  requester?: Requester
  /** 分页配置 */
  pagintion?:
    | {
        /** Element Pagination组件属性 */
        bind?: PaginationProps
        pageFiled?: string
        totalFiled?: string
      }
    | boolean
  /** 事件监听配置 */
  on?: Record<string, (...args: any[]) => void>
}
type Pagition = Exclude<TableConf['pagintion'], boolean | undefined>

/** 组件Props类型 */
interface TableProps {
  /** 顶部标题（支持字符串或数组） */
  headTitle?: any[] | string
  /** 表格配置（核心配置） */
  tableConf: TableConf
}

// ====================== 组件逻辑 ======================
const { tableConf } = defineProps<TableProps>()
const model = defineModel<any[]>()
// const { tableConf } = props;
// const { tableConf: confRefs } = toRefs(props);
/** 响应式状态 */
const isLoading = ref(false) // 加载状态
const pageInfo = ref<{ [k: string]: any }>({
  pageNum: 1,
  pageSize: 10,
  total: 0,
}) // 分页信息
const currentRow = ref(null) // 当前选中行
const commonTable = ref<InstanceType<typeof ElTable>>() // 表格实例引用
const pageSize = ref(10)

/** 分页尺寸计算属性 */
const calcPageSize = computed(
  () => tableConf?.requester?.params?.[1] ?? pageSize.value
)

/** 动态分页配置（合并默认配置与用户配置） */
const dynamicPagintion = computed<Partial<PaginationProps>>(() => {
  // const { tableConf } = props;
  const {
    bind,
    pageFiled = 'page',
    totalFiled = 'total',
  } = (tableConf.pagintion as Pagition) ?? {}
  const { [pageFiled]: currentPage, [totalFiled]: total } = pageInfo.value ?? {}

  return {
    pageSize: calcPageSize.value,
    currentPage,
    pageSizes: [5, 10, 20],
    total,
    // layout: 'total, prev, sizes, pager, next',
    layout: 'total, sizes, prev, pager, next, jumper',
    // background: true,
    ...bind,
  }
})

/** 初始化表格数据 */
const initData = async () => {
  // const { tableConf } = props;
  const { requester } = tableConf
  if (!requester) return

  const { api = () => Promise.resolve(), params } = requester
  isLoading.value = true
  const { data } = await apiReq(api)(...(params ?? []))
  pageInfo.value = data

  // tableConf.data = decodeData(data) || [];
  syncData(data)

  isLoading.value = false
}

/** 同步数据，未传入双向绑定参数则修改配置data */
const syncData = (data: any) => {
  const decode = decodeData(data) ?? []

  if (model.value) {
    model.value = decode
  } else {
    tableConf.data = decode
  }
}

/** 当前行变化处理 */
const handleTableCurrentChange = (val: any) => {
  if (!tableConf.highlightCurrentRow) return
  currentRow.value = val
}

/** 获取单元格值 */
const getPropVal = ({ column: { property }, row = {} }: any) => {
  return row?.[property]
}

/** 单元格内容渲染 */
const $renderScope = (scope: ColumnDefaultScope) => {
  const { column, row } = scope || {}
  const { property, formatter } = column ?? {}
  const val = row?.[property]

  const cellVal = (typeof val === 'number' && val?.toString()) || val || '--'

  return formatter ? formatter(row, scope.column, cellVal) : cellVal
}

/** 分页变化处理 */
const handleCurrentChange = (cur: number) => {
  if (tableConf?.requester?.params?.[0]) {
    tableConf.requester.params[0] = cur
  }
  // getValue(() => (tableConf.requester.params[0] = cur));
  initData()
}
const handleSizeChange = (size: number) => {
  if (tableConf?.requester?.params?.[1]) {
    tableConf.requester.params[1] = size
  }
  // getValue(() => (tableConf.requester.params[1] = size));
  initData()
}

/** 数据解码（支持路径访问和数据转换） */
const decodeData = (res: any) => {
  const { getter, path } = tableConf.requester ?? {}
  const decode = path ? chainAccess(res, path) : res
  return getter?.(decode) ?? decode
}

// const search = async (...parmasSearch) => {
//   const { api, params } = tableConf.requester;
//   const p = parmasSearch.length > 0 ? [...parmasSearch] : [...params];
//   isLoading.value = true;
//   const { object } = await apiReq(api)(...p);
//   isLoading.value = false;
//   pageInfo.value = object;
//   tableConf.data = decodeData(object) || [];
// };

/** 重置表格布局 */
function restTableLayout() {
  commonTable.value?.doLayout?.()
}

// 初始化
function init() {
  initData()
  restTableLayout()
}

// 暴露方法给父组件
defineExpose({ initData, restTableLayout })

onMounted(init)
</script>

<template>
  <div class="common-table" v-loading="isLoading">
    <slot name="operaNav" :row="currentRow"></slot>
    <ElTable
      @current-change="handleTableCurrentChange"
      v-bind="tableConf"
      v-on="tableConf.on ?? {}"
      :data="model ?? tableConf.data"
      class="fit-empty"
      ref="commonTable"
    >
      <!-- 独立多选列 -->
      <template v-if="tableConf.selection">
        <ElTableColumn
          v-for="(v, i) in tableConf.selection"
          :key="i"
          v-bind="v"
        />
      </template>

      <!-- 动态列配置 -->
      <ElTableColumn
        v-for="(v, i) in tableConf.columnList"
        :key="v.label ?? `column-${i}`"
        v-bind="v"
      >
        <template #default="scope">
          <component
            v-if="v.render"
            :is="v.render"
            :data="getPropVal(scope)"
            :row="scope.row"
            :scope="scope"
            :conf="v"
          />
          {{ (!v.render && $renderScope(scope)) || '' }}
        </template>

        <template #header="scope">
          <component
            v-if="v.headerRender"
            :is="v.headerRender"
            :scope="scope"
            :conf="v"
          />
          {{ (!v.headerRender && v.label) || '' }}
        </template>
      </ElTableColumn>
    </ElTable>

    <ElRow
      type="flex"
      justify="end"
      align="middle"
      class="common-pagination"
      v-if="tableConf.pagintion"
    >
      <ElPagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-bind="dynamicPagintion"
      />
    </ElRow>
  </div>
</template>

<style lang="scss" scoped>
.common-table {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
