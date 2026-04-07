import { Toast as g } from "vant";
import { $downloadFile as C, $thenBack as h, chainAccess as u } from "@conf-component-tool-lib/shared";
export * from "@conf-component-tool-lib/shared";
function p(n = "") {
  return function(e) {
    const [t, s] = [
      { ...e },
      n + ((e == null ? void 0 : e.errorMsg) || (e == null ? void 0 : e.msg) || (e == null ? void 0 : e.message) || "")
    ];
    return g.fail(s), t;
  };
}
function m(n) {
  return (...e) => n(...e ?? []).then(h).catch(p());
}
const q = { apiReq: m, $thenBack: h, $catchBack: p, $downloadFile: C };
function _(n, e, t, s, o, a, i, l) {
  var r = typeof n == "function" ? n.options : n;
  return e && (r.render = e, r.staticRenderFns = t, r._compiled = !0), r._scopeId = "data-v-" + a, {
    exports: n,
    options: r
  };
}
const b = {
  name: "card-list",
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
          modeLoading: !1,
          hasPagination: !1,
          // 开启分页
          data: [],
          requester: {
            params: { page: 1, size: 10, other: {} },
            // 位于requester.params的页码字段
            pageIndexProp: "page",
            // 位于requester.params的每页个数字段
            pageSizeProp: "size",
            // list路径
            path: "",
            paramGetter: (n) => n,
            // 分页体路径
            pageInfoPath: "",
            // 总条目字段
            pageInfoTotalProp: "total",
            pageInfo: null,
            // 接口完成回调
            handleFinally: () => null,
            // 分页递进回调
            incrementPageNo: () => null,
            api: () => new Promise((n) => setTimeout(() => n([]), 1500))
          },
          refreshConf: {
            isLoading: !1,
            onRefresh: () => null
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
            finished: !0
          },
          listeners: {}
          // 插槽配置
          // slots: [{ name: 'title', render: {} }]
        };
      }
    },
    /**
     * 遮罩加载禁用
     */
    overlayLoadDisabled: {
      type: Boolean,
      default: !1
    }
  },
  computed: {
    // van-cell 属性透传
    cellBind() {
      var n;
      return ((n = this.listConf) == null ? void 0 : n.cellBind) ?? {};
    },
    // 兼容自定义 slotName，默认渲染到 default 插槽
    cellSlotName() {
      return this.cellBind.slotName ?? "default";
    },
    // 操作栏渲染配置
    operation() {
      var n;
      return ((n = this.listConf) == null ? void 0 : n.operation) ?? {};
    },
    // 刷新配置
    refreshConf() {
      var n;
      return ((n = this.listConf) == null ? void 0 : n.refreshConf) ?? { isLoading: !1 };
    },
    // 请求配置
    requester() {
      var n;
      return ((n = this.listConf) == null ? void 0 : n.requester) ?? {};
    }
  },
  created() {
    this.init();
  },
  methods: {
    /**
     * 组合配置与行数据
     *
     * @param   {[type]}  bind  插槽配置
     * @param   {[type]}  data   行数据
     */
    combBindProps(n, e) {
      return { ...n, data: e };
    },
    /**
     * 列表项 key 生成策略：按 listConf.key 指定字段读取
     */
    getListKey(n) {
      const { key: e } = this.listConf;
      return n == null ? void 0 : n[e];
    },
    /**
     * 下拉刷新：清空数据后重新加载
     * - 非分页：走 initData（重置后首刷）
     * - 分页：走 search（按分页逻辑加载）
     */
    async onRefresh() {
      const { refreshConf: n, listConf: e, initData: t, search: s, defaultRefresh: o } = this, a = n.onRefresh || o;
      n.isLoading = !0, e.data = [], a(), e.hasPagination ? await s() : await t(), n.isLoading = !1;
    },
    /**
     * 默认刷新处理
     */
    defaultRefresh() {
      const { pageIndexProp: n, params: e } = this.requester;
      n in e && (e[n] = 1);
    },
    /**
     * van-list 触底回调，仅分页且未结束时继续请求
     */
    onLoad() {
      const { listConf: n, search: e } = this, { hasPagination: t, bind: s } = n;
      t && !s.finished && e();
    },
    /**
     * 单元格点击事件，透传给业务方
     */
    handleCellClick(n) {
      var t;
      const e = ((t = this.listConf) == null ? void 0 : t.cellClick) ?? (() => null);
      e == null || e(n);
    },
    /**
     * 初始化入口：分页模式下立即触发首轮加载
     */
    init() {
      const { listConf: n, initData: e } = this;
      n.hasPagination && e();
    },
    /**
     * 初始化加载：重置状态并拉取第一页数据
     */
    async initData() {
      const { listConf: n, $nextTick: e, reqList: t } = this, { bind: s, requester: o } = n ?? {};
      o && (s.finished = !1, n.modeLoading = !0, n.data = [], await t(), await e(), n.bind.finished = !0, n.modeLoading = !1);
    },
    /**
     * 请求列表数据并合并到 data
     * - path: 列表数据路径
     * - pageInfoPath: 分页信息路径（不传则使用 res）
     */
    async reqList() {
      const { requester: n, listConf: e } = this, { api: t, params: s, paramGetter: o, path: a, pageInfoPath: i, handleFinally: l } = n, r = o ? o(s) : s, f = await m(t)(r), c = u(f, a) ?? [], d = i ? u(f, i) : f;
      return n.pageInfo = d, e.data.push(...c), l == null || l({ pageInfo: d }), c;
    },
    /**
     * 结束状态处理
     */
    handleFinished(n = {}) {
      const { handleIncrement: e, listConf: t, getTotal: s } = this, {
        hasPagination: o,
        bind: a,
        data: i,
        requester: { pageInfo: l }
      } = t, r = s(l);
      (o && i.length >= r || !o || !n) && (a.finished = !0), o && i.length < r && e({ params: t.requester.params, result: n, pageInfo: l });
    },
    /**
     * 获取总条数，默认读取 requester.pageInfoTotalProp 字段
     */
    getTotal(n) {
      const { pageInfoTotalProp: e } = this.requester;
      return (n == null ? void 0 : n[e]) ?? 0;
    },
    /**
     * 叠加回调
     */
    handleIncrement(n) {
      const { incrementPageNo: e, pageIndexProp: t, params: s } = this.requester;
      e ? e(n) : t && s[t]++;
    },
    /**
     * 搜索分页
     * 负责分页请求的标准流程：loading -> reqList -> 结束态处理
     */
    async search() {
      const {
        listConf: n,
        overlayLoadDisabled: e,
        handleFinished: t,
        reqList: s,
        $nextTick: o
      } = this;
      if (!n.requester) return;
      !e && this.$emit("loading", !0), n.bind.finished = !1, n.modeLoading = !0;
      const a = await s();
      await o(), t(a), n.modeLoading = !1, !e && this.$emit("loading", !1);
    }
  }
};
var y = function() {
  var e = this, t = e._self._c;
  return t("van-pull-refresh", { attrs: { disabled: !e.listConf.refreshConf }, on: { refresh: e.onRefresh }, model: { value: e.refreshConf.isLoading, callback: function(s) {
    e.$set(e.refreshConf, "isLoading", s);
  }, expression: "refreshConf.isLoading" } }, [t("van-list", e._g(e._b({ staticClass: "common-card-list", on: { load: e.onLoad }, model: { value: e.listConf.modeLoading, callback: function(s) {
    e.$set(e.listConf, "modeLoading", s);
  }, expression: "listConf.modeLoading" } }, "van-list", e.listConf.bind, !1), e.listConf.listeners), [t("lazy-component", { staticClass: "lazy-wrap" }, e._l(e.listConf.data, function(s, o) {
    return t("van-cell", e._b({ key: e.getListKey(s) || o, staticClass: "card-item", on: { click: function(a) {
      return e.handleCellClick(s);
    } }, scopedSlots: e._u([{ key: e.cellSlotName, fn: function() {
      return [e._l(e.listConf.rows, function(a, i) {
        return [a.type === "info" ? t("van-row", e._b({ key: i, staticClass: "item-row" }, "van-row", a.bind, !1), [t("van-col", e._b({ staticClass: "row-label", attrs: { span: 5 } }, "van-col", a.labelBind, !1), [e._v(" " + e._s(a.label) + " ")]), t("van-col", e._b({ staticClass: "row-value", attrs: { span: 18 } }, "van-col", a.valueBind, !1), [e._v(" " + e._s(s[a.prop]) + " ")])], 1) : a.render ? t(a.render, e._b({ tag: "component" }, "component", { data: s }, !1)) : e._e()];
      }), e.operation.render ? t("van-row", { key: o + "-opera", staticClass: "item-row", attrs: { type: "flex", justify: "end" } }, [t(e.operation.render, e._b({ tag: "component" }, "component", e.combBindProps(e.operation.bind, s), !1))], 1) : e._e()];
    }, proxy: !0 }, e._l(e.listConf.slots, function(a, i) {
      return { key: a.name, fn: function() {
        return [t(a.render, e._b({ key: o + "-" + i, tag: "component" }, "component", e.combBindProps(a.bind, s), !1))];
      }, proxy: !0 };
    })], null, !0) }, "van-cell", e.cellBind, !1));
  }), 1)], 1)], 1);
}, L = [], v = /* @__PURE__ */ _(
  b,
  y,
  L,
  !1,
  null,
  "39dda630"
);
const B = v.exports;
export {
  p as $catchBack,
  B as CommonCardList,
  m as apiReq,
  q as apiTools
};
