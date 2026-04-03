<script lang="ts" setup>
import type {
  TableProps as _TableProps,
  PaginationProps,
  TableColumnCtx,
} from 'element-plus'

import type { ComponentInstance } from 'vue'

import { computed, onMounted, ref, defineModel } from 'vue'

import { ElPagination, ElRow, ElTable, ElTableColumn } from 'element-plus'

import { apiReq, chainAccess } from '../../tools'

// ====================== 类型定义 ======================
type ColumnProps = Partial<TableColumnCtx<unknown>>

interface ColumnDefaultScope {
  row: any
  column: any
  $index: number
}

export interface ColumnDef extends ColumnProps {
  render?: ComponentInstance<any>
  headerRender?: ComponentInstance<any>
  [key: string]: any
}

export interface Requester {
  params?: [number, number, any]
  api?: (...args: any[]) => Promise<any>
  path?: string
  getter?: (data: any) => any[]
}

export interface TableConf extends Partial<_TableProps<any>> {
  columnList: ColumnDef[]
  selection?: ColumnDef[]
  requester?: Requester
  pagintion?:
    | {
        bind?: PaginationProps
        pageFiled?: string
        totalFiled?: string
      }
    | boolean
  on?: Record<string, (...args: any[]) => void>
}
type Pagition = Exclude<TableConf['pagintion'], boolean | undefined>

interface TableProps {
  headTitle?: any[] | string
  tableConf: TableConf
}

// ====================== 组件逻辑 ======================
const { tableConf } = defineProps<TableProps>()
const model = defineModel<any[]>()

const isLoading = ref(false)
const pageInfo = ref<{ [k: string]: any }>({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})
const currentRow = ref(null)
const commonTable = ref<InstanceType<typeof ElTable>>()
const pageSize = ref(10)

const calcPageSize = computed(
  () => tableConf?.requester?.params?.[1] ?? pageSize.value
)

const dynamicPagintion = computed<Partial<PaginationProps>>(() => {
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
    layout: 'total, sizes, prev, pager, next, jumper',
    ...bind,
  }
})

const initData = async () => {
  const { requester } = tableConf
  if (!requester) return

  const { api = () => Promise.resolve(), params } = requester
  isLoading.value = true
  const { data } = await apiReq(api)(...(params ?? []))
  pageInfo.value = data

  syncData(data)

  isLoading.value = false
}

const syncData = (data: any) => {
  const decode = decodeData(data) ?? []

  if (model.value) {
    model.value = decode
  } else {
    tableConf.data = decode
  }
}

const handleTableCurrentChange = (val: any) => {
  if (!tableConf.highlightCurrentRow) return
  currentRow.value = val
}

const getPropVal = ({ column: { property }, row = {} }: any) => {
  return row?.[property]
}

const $renderScope = (scope: ColumnDefaultScope) => {
  const { column, row } = scope || {}
  const { property, formatter } = column ?? {}
  const val = row?.[property]

  const cellVal = (typeof val === 'number' && val?.toString()) || val || '--'

  return formatter ? formatter(row, scope.column, cellVal) : cellVal
}

const handleCurrentChange = (cur: number) => {
  if (tableConf?.requester?.params?.[0]) {
    tableConf.requester.params[0] = cur
  }
  initData()
}
const handleSizeChange = (size: number) => {
  if (tableConf?.requester?.params?.[1]) {
    tableConf.requester.params[1] = size
  }
  initData()
}

const decodeData = (res: any) => {
  const { getter, path } = tableConf.requester ?? {}
  const decode = path ? chainAccess(res, path) : res
  return getter?.(decode) ?? decode
}

function restTableLayout() {
  commonTable.value?.doLayout?.()
}

function init() {
  initData()
  restTableLayout()
}

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
      <template v-if="tableConf.selection">
        <ElTableColumn
          v-for="(v, i) in tableConf.selection"
          :key="i"
          v-bind="v"
        />
      </template>

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

<style lang="scss" scoped></style>
