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
import { apiReq, chainAccess, getValue } from '../../tools';

const props = defineProps({
  /**
   * 表格头部标题，可覆盖 tableConf.headTitle
   */
  headTitle: [String, Array],
  /**
   * 表格配置对象，包含所有表格相关配置
   * @property {Array} data - 表格数据
   * @property {Array} columnList - 列配置数组
   * @property {Object} requester - 数据请求配置
   *   @property {Array} params - 请求参数 [pageIndex, pageSize]
   *   @property {Function} api - API 函数
   *   @property {String} path - 数据解析路径
   *   @property {Function} getter - 数据转换函数
   */
  tableConf: {
    type: Object,
    default: () => ({
      data: [],
      columnList: [],
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

const isLoading = ref(false);
const pageInfo = ref({});
const pageSize = ref(10);
const currentRow = ref(null);
const commonTable = ref()

/** 分页尺寸计算属性 */
const calcPageSize = computed(() => getValue(() => tableConf.value.requester.params[1]) || pageSize.value);

/** 动态分页配置（合并默认配置与用户配置） */
const dynamicPagintion = computed(() => {
  const { tableConf } = props;
  const { page, pageSize, total } = pageInfo.value || {};

  return {
    'page-size': calcPageSize.value,
    'current-page': page,
    'page-size': pageSize,
    'page-sizes': [5, 10, 20],
    total: total,
    layout: 'total, sizes, prev, pager, next, jumper',
    ...tableConf?.pagintion?.bind,
  };
});

/** 初始化表格数据 */
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

/** 当前行变化处理 */
const handleTableCurrentChange = (val) => {
  if (!tableConf.value['highlight-current-row']) return;
  currentRow.value = val;
};

/** 获取单元格值 */
const getPropVal = ({ column: { property }, row = {} } = { column: {} }) => row[property];

/** 单元格内容渲染 */
const $renderScope = (scope) => {
  const { column: { property, formatter }, row } = scope || {};
  const cellVal = (typeof row[property] === 'number' && row[property].toString()) || row[property] || '--';
  return formatter ? formatter(row, scope.column, cellVal) : cellVal;
};

/** 分页页码变化处理 */
const handleCurrentChange = (cur) => {
  getValue(() => (tableConf.value.requester.params[0] = cur));
  initData();
};

/** 分页大小变化处理 */
const handleSizeChange = (size) => {
  getValue(() => (tableConf.value.requester.params[1] = size));
  initData();
};

/** 解析 API 返回数据 */
const decodeData = (res) => {
  const { getter, path } = tableConf.value.requester ?? {};
  const decode = path ? chainAccess(res, path) : res;
  return getter?.(decode) ?? decode;
};

/** 自定义搜索方法 */
const search = async (...parmasSearch) => {
  const { api, params } = tableConf.value.requester;
  const p = parmasSearch.length ? [...parmasSearch] : [...params];
  isLoading.value = true;
  const { object } = await apiReq(api)(...p);
  isLoading.value = false;
  pageInfo.value = object;
  tableConf.value.data = decodeData(object) || [];
};

/** 重置表格布局 */
function restTableLayout() {
  commonTable.value?.doLayout?.()
}

/** 组件初始化 */
function init() {
  initData()
  restTableLayout()
}

defineExpose({ initData, search, restTableLayout })

onMounted(init);
</script>

<style lang="scss" scoped></style>
