<script lang="ts" setup>
import type {
  TableProps as _TableProps,
  ElTable,
  PaginationProps,
  TableColumnCtx,
} from 'element-plus';
// import type { TableColumnCtx } from 'element-plus/lib/components/index.js';

import type { Component } from 'vue';

import { computed, onMounted, ref } from 'vue';

import { ElPagination } from 'element-plus';

import { apiTools, chainAccess } from '#/utils/common-tools';

type ColumnProps = TableColumnCtx<any>;

interface ColumnDefaultScope {
  row: any;
  column: any;
  $index: number;
}

// 类型定义
interface ColumnDef extends ColumnProps {
  // prop?: string;
  // label?: string;
  // align?: 'center' | 'left' | 'right';
  render?: Component;
  headerRender?: Component;
  // formatter?: (row: any, column: any, cellValue: any) => string;
  [key: string]: any;
}

interface Requester {
  params?: any[];
  api?: (...args: any[]) => Promise<any>;
  path?: string;
  getter?: (data: any) => any[];
}

interface TableConf extends Partial<_TableProps<any>> {
  // interface TableConf extends Partial<TableInstance['$props']> {
  // interface TableConf extends TableInstance['$props'] {
  data?: any[];
  columnList: ColumnDef[];
  selection?: ColumnDef[];
  requester?: Requester;
  pagintion?: {
    bind?: PaginationProps;
  };
  on?: Record<string, (...args: any[]) => void>;
  // 'highlight-current-row'?: boolean;
  // [key: string]: any;
}

// interface Pagination {
//   page?: number;
//   pageSize?: number;
//   total?: number;
// }

interface TableProps {
  headTitle?: any[] | string;
  tableConf: TableConf;
}

const props = defineProps<TableProps>();
const {
  tableConf,
  // tableConf = {
  //   data: [],
  //   columnList: [
  //     // {
  //     //   prop: "prop1",
  //     //   // label: "商机编码",
  //     //   align: "center"
  //     // },
  //   ],
  //   requester: {
  //     params: [1, 10],
  //     api: () => Promise.resolve(),
  //     path: '',
  //     getter: () => null,
  //   },
  // },
} = props;
// const { tableConf } = toRefs(props);

const { apiReq } = apiTools;
const isLoading = ref(false);
const pageInfo = ref({ page: 1, pageSize: 10, total: 0 });
const pageSize = ref(10);
const currentRow = ref(null);
const commonTable = ref();

const calcPageSize = computed(
  () => tableConf?.requester?.params?.[1] ?? pageSize.value,
);

const dynamicPagintion = computed<Partial<PaginationProps>>(() => {
  const { tableConf } = props;
  const { page: currentPage, total } = pageInfo.value ?? {};

  return {
    pageSize: calcPageSize.value,
    currentPage,
    pageSizes: [5, 10, 20],
    total,
    // layout: 'total, prev, sizes, pager, next',
    layout: 'total, sizes, prev, pager, next, jumper',
    // background: true,
    ...tableConf?.pagintion?.bind,
  };
});

const initData = async () => {
  const { tableConf } = props;
  const { requester } = tableConf;
  if (!requester) return;

  const { api = () => Promise<null>, params } = requester;
  isLoading.value = true;
  const { data } = await apiReq(api)(...(params ?? []));
  pageInfo.value = data;
  tableConf.data = decodeData(data) || [];
  isLoading.value = false;
};

const handleTableCurrentChange = (val: any) => {
  if (!tableConf.highlightCurrentRow) return;
  currentRow.value = val;
};

const getPropVal = ({ column: { property }, row = {} }: any) => row?.[property];

const $renderScope = (scope: ColumnDefaultScope) => {
  const {
    column: { property, formatter },
    row,
  } = scope || {};
  const cellVal =
    (typeof row[property] === 'number' && row[property].toString()) ||
    row[property] ||
    '--';
  return formatter ? formatter(row, scope.column, cellVal) : cellVal;
};

const handleCurrentChange = (cur: number) => {
  if (tableConf?.requester?.params?.[0]) {
    tableConf.requester.params[0] = cur;
  }
  // getValue(() => (tableConf.requester.params[0] = cur));
  initData();
};

const handleSizeChange = (size: number) => {
  if (tableConf?.requester?.params?.[1]) {
    tableConf.requester.params[1] = size;
  }
  // getValue(() => (tableConf.requester.params[1] = size));
  initData();
};

const decodeData = (res: any) => {
  const { getter, path } = tableConf.requester ?? {};
  const decode = path ? chainAccess(res, path) : res;
  return getter?.(decode) ?? decode;
};

// const search = async (...parmasSearch) => {
//   const { api, params } = tableConf.requester;
//   const p = parmasSearch.length > 0 ? [...parmasSearch] : [...params];
//   isLoading.value = true;
//   const { object } = await apiReq(api)(...p);
//   isLoading.value = false;
//   pageInfo.value = object;
//   tableConf.data = decodeData(object) || [];
// };

function restTableLayout() {
  commonTable.value?.doLayout?.();
}

function init() {
  initData();
  restTableLayout();
}

onMounted(init);
</script>

<template>
  <div class="common-table" v-loading="isLoading">
    <slot name="operaNav" :row="currentRow"></slot>
    <el-table
      @current-change="handleTableCurrentChange"
      v-bind="tableConf"
      v-on="tableConf.on ?? {}"
      class="fit-empty"
      ref="commonTable"
    >
      <!-- 独立多选列 -->
      <template v-if="tableConf.selection">
        <el-table-column
          v-for="(v, i) in tableConf.selection"
          :key="i"
          v-bind="v"
        />
      </template>

      <!-- 动态列配置 -->
      <el-table-column
        v-for="(v, i) in tableConf.columnList"
        :key="`column-${i}`"
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
      </el-table-column>
    </el-table>

    <el-row
      type="flex"
      align="middle"
      class="common-pagination"
      v-if="tableConf.pagintion"
    >
      <ElPagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-bind="dynamicPagintion"
      />
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
// .common-table {
//   /* Your styles here */
// }
</style>
