<template>
  <div class="common-table" v-loading="isLoading">
    <slot name="operaNav" :row="currentRow"></slot>
    <el-table @current-change="handleTableCurrentChange" v-bind="tableConf" v-on="tableConf.on ?? {}" class="fit-empty"
      ref="commonTable">
      <!-- 独立多选列 -->
      <template v-if="tableConf.selection">
        <el-table-column v-for="(v, i) in tableConf.selection" :key="i" v-bind="v"></el-table-column>
      </template>

      <!-- 动态列配置 -->
      <el-table-column v-for="(v, i) in tableConf.columnList" :key="'column-' + i" v-bind="v">
        <template #default="scope">
          <component v-if="v.render" :is="v.render" :data="getPropVal(scope)" :row="scope.row" :scope="scope" :conf="v">
          </component>
          {{ (!v.render && $renderScope(scope)) || '' }}
        </template>

        <template #header="scope">
          <component v-if="v.headerRender" :is="v.headerRender" :scope="scope" :conf="v"></component>
          {{ (!v.headerRender && v.label) || '' }}
        </template>
      </el-table-column>
    </el-table>

    <el-row type="flex" align="middle" class="common-pagination" v-if="tableConf.pagintion">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" v-bind="dynamicPagintion" />
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, toRefs, onMounted } from 'vue';
import { apiTools, chainAccess, getValue } from '@/utils/common-tools';

const props = defineProps({
  headTitle: [String, Array],
  tableConf: {
    type: Object,
    default: () => ({
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
        path: '',
        getter: () => null,
      },
    }),
  },
});
const { tableConf } = toRefs(props)

const { apiReq } = apiTools;
const isLoading = ref(false);
const pageInfo = ref({});
const pageSize = ref(10);
const currentRow = ref(null);
const commonTable = ref()

const calcPageSize = computed(() => getValue(() => tableConf.value.requester.params[1]) || pageSize.value);

const dynamicPagintion = computed(() => {
  const { tableConf } = props;
  const { page, pageSize, total } = pageInfo.value || {};

  return {
    'page-size': calcPageSize.value,
    'current-page': page,
    'page-count': pageSize,
    'page-sizes': [5, 10, 20],
    total: total,
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

  const { api, params } = requester;
  isLoading.value = true;
  const { data } = await apiReq(api)(...(params ?? []));
  pageInfo.value = data;
  tableConf.data = decodeData(data) || [];
  isLoading.value = false;
};

const handleTableCurrentChange = (val) => {
  if (!tableConf.value['highlight-current-row']) return;
  currentRow.value = val;
};

const getPropVal = ({ column: { property }, row = {} } = { column: {} }) => row[property];

const $renderScope = (scope) => {
  const { column: { property, formatter }, row } = scope || {};
  const cellVal = (typeof row[property] === 'number' && row[property].toString()) || row[property] || '--';
  return formatter ? formatter(row, scope.column, cellVal) : cellVal;
};

const handleCurrentChange = (cur) => {
  getValue(() => (tableConf.value.requester.params[0] = cur));
  initData();
};

const handleSizeChange = (size) => {
  getValue(() => (tableConf.value.requester.params[1] = size));
  initData();
};

const decodeData = (res) => {
  const { getter, path } = tableConf.value.requester ?? {};
  const decode = path ? chainAccess(res, path) : res;
  return getter?.(decode) ?? decode;
};

const search = async (...parmasSearch) => {
  const { api, params } = tableConf.value.requester;
  const p = parmasSearch.length ? [...parmasSearch] : [...params];
  isLoading.value = true;
  const { object } = await apiReq(api)(...p);
  isLoading.value = false;
  pageInfo.value = object;
  tableConf.value.data = decodeData(object) || [];
};

function restTableLayout() {
  commonTable.value?.doLayout?.()
}

function init() {
  initData()
  restTableLayout()
}

onMounted(init);
</script>

<style lang="scss" scoped>
// .common-table {
//   /* Your styles here */
// }</style>
