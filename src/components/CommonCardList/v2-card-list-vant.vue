<template>
  <van-pull-refresh
    v-model="refreshConf.isLoading"
    @refresh="onRefresh"
    :disabled="!listConf.refreshConf"
  >
    <van-list
      v-model="listConf.modeLoading"
      v-bind="listConf.bind"
      v-on="listConf.listeners"
      @load="onLoad"
      class="common-card-list"
    >
      <lazy-component class="lazy-wrap">
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

          <!-- slots JSX -->
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
import { apiReq, chainAccess } from '@/utils/common-tools'

export default {
  name: 'card-list',
  props: {
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
            paramGetter: params => params,
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
              new Promise(resolve => setTimeout(() => resolve([]), 1500)),
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
    cellBind() {
      return this.listConf?.cellBind ?? {}
    },
    cellSlotName() {
      return this.cellBind.slotName ?? 'default'
    },
    operation() {
      return this.listConf?.operation ?? {}
    },
    refreshConf() {
      return this.listConf?.refreshConf ?? { isLoading: false }
    },
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
    getListKey(val) {
      const { key } = this.listConf
      return val?.[key]
    },
    async onRefresh() {
      const { refreshConf, listConf, initData, search, defaultRefresh } = this
      const userRefresh = refreshConf.onRefresh || defaultRefresh // 刷新前执行的调用方回调
      // (() => {
      //   throw new Error('has no refresh function')
      // }) // 刷新前执行的调用方回调

      refreshConf.isLoading = true
      listConf.data = []
      userRefresh()
      !listConf.hasPagination ? await initData() : await search() // 根据分页选择不同加载策略
      refreshConf.isLoading = false
    },
    /**
     * 默认刷新处理
     */
    defaultRefresh() {
      const { pageIndexProp, params } = this.requester

      if (pageIndexProp in params) params[pageIndexProp] = 1
    },
    onLoad(ev) {
      const { listConf, search } = this
      const { hasPagination, bind } = listConf
      console.log('on load:', listConf.requester.params)

      if (hasPagination && !bind.finished) search() // 分页开启执行list
    },
    handleCellClick(params) {
      const cellClick = this.listConf?.cellClick ?? (() => null)

      cellClick?.(params)
    },
    init() {
      const { listConf, initData } = this

      if (listConf.hasPagination) initData()
    },
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
        requester: { incrementPageNo, params, pageInfo },
      } = listConf
      const options = { params, result, pageInfo }
      const total = getTotal(pageInfo)

      if (
        // 分页开启，且加载完最大数量
        (hasPagination && data.length >= total) ||
        // 未开启分页则首加载后结束
        !hasPagination ||
        // 数据异常
        !result
      )
        bind.finished = true

      // if (hasPagination && incrementPageNo) incrementPageNo(options) // 页码叠加
      if (hasPagination && data.length < total) handleIncrement(options) // 页码叠加
    },
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
        // 默认执行页码参数叠加
        pageIndexProp && params[pageIndexProp]++
      }
    },
    /**
     * 搜索分页
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

      // !overlayLoadDisabled && $sfLoading('加载中...');
      !overlayLoadDisabled && this.$emit('loading', true) // 局部阻断导航栏操作
      listConf.bind.finished = false
      listConf.modeLoading = true

      const result = await reqList()
      console.log({ result })

      await $nextTick()

      handleFinished(result)
      listConf.modeLoading = false
      // !overlayLoadDisabled && $sfLoadingClose(0);
      !overlayLoadDisabled && this.$emit('loading', false) // 局部阻断导航栏操作
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
