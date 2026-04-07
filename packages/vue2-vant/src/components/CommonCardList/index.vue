<template>
  <!-- 下拉刷新容器：只有配置了 refreshConf 时才启用 -->
  <van-pull-refresh
    v-model="refreshConf.isLoading"
    @refresh="onRefresh"
    :disabled="!listConf.refreshConf"
  >
    <!-- 列表加载容器：由 modeLoading 与 bind.finished 控制加载与结束状态 -->
    <van-list
      v-model="listConf.modeLoading"
      v-bind="listConf.bind"
      v-on="listConf.listeners"
      @load="onLoad"
      class="common-card-list"
    >
      <lazy-component class="lazy-wrap">
        <!-- 每条数据渲染为一个 cell，优先使用业务 key，兆底使用索引 -->
        <van-cell
          v-for="(val, i) in listConf.data"
          v-bind="cellBind"
          @click="handleCellClick(val)"
          :key="getListKey(val) || i"
          class="card-item"
        >
          <template #[cellSlotName]>
            <template v-for="(row, rI) in listConf.rows">
              <van-row
                v-if="row.type === 'info'"
                :key="rI"
                v-bind="row.bind"
                class="item-row"
              >
                <van-col v-bind="row.labelBind" :span="5" class="row-label">
                  {{ row.label }}
                </van-col>

                <van-col v-bind="row.valueBind" :span="18" class="row-value">
                  {{ val[row.prop] }}
                </van-col>
              </van-row>

              <!-- JSX -->
              <component
                v-else-if="row.render"
                :is="row.render"
                v-bind="{ data: val }"
              />
            </template>

            <!-- 操作栏 -->
            <van-row
              v-if="operation.render"
              :key="i + '-opera'"
              type="flex"
              justify="end"
              class="item-row"
            >
              <component
                v-bind="combBindProps(operation.bind, val)"
                :is="operation.render"
              />
            </van-row>
          </template>

          <!-- 自定义具名插槽渲染：由 listConf.slots 动态注入 -->
          <template v-for="(slot, sI) in listConf.slots" #[slot.name]>
            <component
              v-bind="combBindProps(slot.bind, val)"
              :is="slot.render"
              :key="i + '-' + sI"
            />
          </template>
        </van-cell>
      </lazy-component>
    </van-list>
  </van-pull-refresh>
</template>

<script>
import { apiReq, chainAccess } from '../../tools'

export default {
  name: 'card-list',
  props: {
    /**
     * 列表总配置（核心协议）
     * - data: 列表数据源
     * - requester: 请求与分页相关参数
     * - rows/slots/operation: 行内容、插槽、操作栏渲染配置
     * - bind/listeners: 透传给 van-list 的属性与事件
     */
    listConf: {
      type: Object,
      default() {
        return {
          modeLoading: false,
          hasPagination: false, // 开启分页
          data: [],
          requester: {
            params: { page: 1, size: 10, other: {} },
            // 位于requester.params的页码字段
            pageIndexProp: 'page',
            // 位于requester.params的每页个数字段
            pageSizeProp: 'size',
            // list路径
            path: '',
            paramGetter: (params) => params,
            // 分页体路径
            pageInfoPath: '',
            // 总条目字段
            pageInfoTotalProp: 'total',
            pageInfo: null,
            // 接口完成回调
            handleFinally: () => null,
            // 分页递进回调
            incrementPageNo: () => null,
            api: () =>
              new Promise((resolve) => setTimeout(() => resolve([]), 1500)),
          },
          refreshConf: {
            isLoading: false,
            onRefresh: () => null,
          },
          // van-cell动态属性
          cellBind: {
            // class: 'common-round',
            // 'is-link': true
          },
          // 操作栏
          operation: {
            // bind: {},
            // render: {}
          },
          bind: {
            finished: true,
          },
          listeners: {},

          // 插槽配置
          // slots: [{ name: 'title', render: {} }]
        }
      },
    },
    /**
     * 遮罩加载禁用
     */
    overlayLoadDisabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // van-cell 属性透传
    cellBind() {
      return this.listConf?.cellBind ?? {}
    },
    // 兼容自定义 slotName，默认渲染到 default 插槽
    cellSlotName() {
      return this.cellBind.slotName ?? 'default'
    },
    // 操作栏渲染配置
    operation() {
      return this.listConf?.operation ?? {}
    },
    // 刷新配置
    refreshConf() {
      return this.listConf?.refreshConf ?? { isLoading: false }
    },
    // 请求配置
    requester() {
      return this.listConf?.requester ?? {}
    },
  },
  created() {
    this.init()
  },
  methods: {
    /**
     * 组合配置与行数据
     *
     * @param   {[type]}  bind  插槽配置
     * @param   {[type]}  data   行数据
     */
    combBindProps(bind, data) {
      return { ...bind, data }
    },
    /**
     * 列表项 key 生成策略：按 listConf.key 指定字段读取
     */
    getListKey(val) {
      const { key } = this.listConf
      return val?.[key]
    },
    /**
     * 下拉刷新：清空数据后重新加载
     * - 非分页：走 initData（重置后首刷）
     * - 分页：走 search（按分页逻辑加载）
     */
    async onRefresh() {
      const { refreshConf, listConf, initData, search, defaultRefresh } = this
      const userRefresh = refreshConf.onRefresh || defaultRefresh

      refreshConf.isLoading = true
      listConf.data = []
      userRefresh()
      !listConf.hasPagination ? await initData() : await search()
      refreshConf.isLoading = false
    },
    /**
     * 默认刷新处理
     */
    defaultRefresh() {
      const { pageIndexProp, params } = this.requester

      if (pageIndexProp in params) params[pageIndexProp] = 1
    },
    /**
     * van-list 触底回调，仅分页且未结束时继续请求
     */
    onLoad() {
      const { listConf, search } = this
      const { hasPagination, bind } = listConf

      if (hasPagination && !bind.finished) search()
    },
    /**
     * 单元格点击事件，透传给业务方
     */
    handleCellClick(params) {
      const cellClick = this.listConf?.cellClick ?? (() => null)
      cellClick?.(params)
    },
    /**
     * 初始化入口：分页模式下立即触发首轮加载
     */
    init() {
      const { listConf, initData } = this
      if (listConf.hasPagination) initData()
    },
    /**
     * 初始化加载：重置状态并拉取第一页数据
     */
    async initData() {
      const { listConf, $nextTick, reqList } = this
      const { bind, requester } = listConf ?? {}

      if (!requester) return

      bind.finished = false
      listConf.modeLoading = true
      listConf.data = []

      await reqList()

      await $nextTick()
      listConf.bind.finished = true
      listConf.modeLoading = false
    },
    /**
     * 请求列表数据并合并到 data
     * - path: 列表数据路径
     * - pageInfoPath: 分页信息路径（不传则使用 res）
     */
    async reqList() {
      const { requester, listConf } = this
      const { api, params, paramGetter, path, pageInfoPath, handleFinally } =
        requester
      const body = paramGetter ? paramGetter(params) : params

      const res = await apiReq(api)(body)

      const list = chainAccess(res, path) ?? []
      const pageInfo = pageInfoPath ? chainAccess(res, pageInfoPath) : res

      requester.pageInfo = pageInfo
      listConf.data.push(...list)

      handleFinally?.({ pageInfo })

      return list
    },
    /**
     * 结束状态处理
     */
    handleFinished(result = {}) {
      const { handleIncrement, listConf, getTotal } = this
      const {
        hasPagination,
        bind,
        data,
        requester: { pageInfo },
      } = listConf
      const total = getTotal(pageInfo)

      if (
        (hasPagination && data.length >= total) ||
        !hasPagination ||
        !result
      )
        bind.finished = true

      if (hasPagination && data.length < total) handleIncrement({ params: listConf.requester.params, result, pageInfo })
    },
    /**
     * 获取总条数，默认读取 requester.pageInfoTotalProp 字段
     */
    getTotal(pageInfo) {
      const { pageInfoTotalProp } = this.requester
      return pageInfo?.[pageInfoTotalProp] ?? 0
    },
    /**
     * 叠加回调
     */
    handleIncrement(options) {
      const { incrementPageNo, pageIndexProp, params } = this.requester

      if (incrementPageNo) {
        incrementPageNo(options)
      } else {
        pageIndexProp && params[pageIndexProp]++
      }
    },
    /**
     * 搜索分页
     * 负责分页请求的标准流程：loading -> reqList -> 结束态处理
     */
    async search() {
      const {
        listConf,
        overlayLoadDisabled,
        handleFinished,
        reqList,
        $nextTick,
      } = this
      if (!listConf.requester) return

      !overlayLoadDisabled && this.$emit('loading', true)
      listConf.bind.finished = false
      listConf.modeLoading = true

      const result = await reqList()

      await $nextTick()

      handleFinished(result)
      listConf.modeLoading = false
      !overlayLoadDisabled && this.$emit('loading', false)
    },
  },
}
</script>

<style lang="scss" scoped>
.common-card-list ::v-deep {
  .lazy-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .item-row {
    line-height: 250%;
    font-size: 14px;
    color: #000;
  }
}
</style>
