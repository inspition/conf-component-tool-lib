import { toRefs as Z, ref as g, computed as L, onMounted as K, resolveComponent as M, resolveDirective as Q, withDirectives as W, openBlock as d, createElementBlock as $, renderSlot as ee, createVNode as O, mergeProps as S, unref as y, toHandlers as te, withCtx as V, Fragment as F, renderList as A, createBlock as C, createCommentVNode as z, resolveDynamicComponent as I, createTextVNode as J, toDisplayString as U, defineComponent as ne, useModel as re, mergeModels as ce, isVNode as ue } from "vue";
import { ElMessage as se, ElMessageBox as ie, ElTable as de, ElTableColumn as Y, ElRow as me, ElPagination as fe, ElSelect as pe, ElOption as ge } from "element-plus";
import { $downloadFile as he, $thenBack as ae, getValue as G, chainAccess as oe } from "@conf-tool/shared";
export * from "@conf-tool/shared";
function X(a = "") {
  return function(u) {
    const [s, r] = [
      { ...u },
      a + ((u == null ? void 0 : u.errorMsg) || (u == null ? void 0 : u.msg) || (u == null ? void 0 : u.message) || "")
    ];
    return se.error(r), s;
  };
}
function B(a) {
  return (...u) => a(...u ?? []).then(ae).catch(X());
}
async function Te(a = "", u = (s) => null) {
  await ie.confirm(a, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  }).then((s) => {
    setTimeout(() => u(s), 300);
  });
}
async function we(a = new Blob()) {
  var r;
  const u = await ((r = a == null ? void 0 : a.text) == null ? void 0 : r.call(a));
  let s = !1;
  try {
    const m = JSON.parse(u ?? "null") ?? {};
    s = m.code !== 0, X()(m);
  } catch (m) {
    console.log("JSON 无法解析", m);
  }
  return s;
}
const Ve = { apiReq: B, $thenBack: ae, $catchBack: X, $downloadFile: he }, ye = { class: "common-table" }, ze = {
  __name: "index",
  props: {
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
          path: "",
          getter: () => null
        }
      })
    }
  },
  setup(a, { expose: u }) {
    const s = a, { tableConf: r } = Z(s), m = g(!1), v = g({}), _ = g(10), R = g(null), q = g(), x = L(() => G(() => r.value.requester.params[1]) || _.value), T = L(() => {
      var l;
      const { tableConf: e } = s, { page: n, pageSize: t, total: c } = v.value || {};
      return {
        "page-size": x.value,
        "current-page": n,
        "page-size": t,
        "page-sizes": [5, 10, 20],
        total: c,
        layout: "total, sizes, prev, pager, next, jumper",
        ...(l = e == null ? void 0 : e.pagintion) == null ? void 0 : l.bind
      };
    }), k = async () => {
      const { tableConf: e } = s, { requester: n } = e;
      if (!n) return;
      const { api: t, params: c } = n;
      m.value = !0;
      const { data: l } = await B(t)(...c ?? []);
      v.value = l, e.data = b(l) || [], m.value = !1;
    }, j = (e) => {
      r.value["highlight-current-row"] && (R.value = e);
    }, D = ({ column: { property: e }, row: n = {} } = { column: {} }) => n[e], E = (e) => {
      const { column: { property: n, formatter: t }, row: c } = e || {}, l = typeof c[n] == "number" && c[n].toString() || c[n] || "--";
      return t ? t(c, e.column, l) : l;
    }, i = (e) => {
      G(() => r.value.requester.params[0] = e), k();
    }, h = (e) => {
      G(() => r.value.requester.params[1] = e), k();
    }, b = (e) => {
      const { getter: n, path: t } = r.value.requester ?? {}, c = t ? oe(e, t) : e;
      return (n == null ? void 0 : n(c)) ?? c;
    }, f = async (...e) => {
      const { api: n, params: t } = r.value.requester, c = e.length ? [...e] : [...t];
      m.value = !0;
      const { object: l } = await B(n)(...c);
      m.value = !1, v.value = l, r.value.data = b(l) || [];
    };
    function w() {
      var e, n;
      (n = (e = q.value) == null ? void 0 : e.doLayout) == null || n.call(e);
    }
    function o() {
      k(), w();
    }
    return u({ initData: k, search: f, restTableLayout: w }), K(o), (e, n) => {
      const t = M("el-table-column"), c = M("el-table"), l = M("el-pagination"), N = M("el-row"), le = Q("loading");
      return W((d(), $("div", ye, [
        ee(e.$slots, "operaNav", { row: R.value }),
        O(c, S({ onCurrentChange: j }, y(r), te(y(r).on ?? {}), {
          class: "fit-empty",
          ref_key: "commonTable",
          ref: q
        }), {
          default: V(() => [
            y(r).selection ? (d(!0), $(F, { key: 0 }, A(y(r).selection, (p, H) => (d(), C(t, S({ key: H }, { ref_for: !0 }, p), null, 16))), 128)) : z("", !0),
            (d(!0), $(F, null, A(y(r).columnList, (p, H) => (d(), C(t, S({
              key: "column-" + H
            }, { ref_for: !0 }, p), {
              default: V((P) => [
                p.render ? (d(), C(I(p.render), {
                  key: 0,
                  data: D(P),
                  row: P.row,
                  scope: P,
                  conf: p
                }, null, 8, ["data", "row", "scope", "conf"])) : z("", !0),
                J(" " + U(!p.render && E(P) || ""), 1)
              ]),
              header: V((P) => [
                p.headerRender ? (d(), C(I(p.headerRender), {
                  key: 0,
                  scope: P,
                  conf: p
                }, null, 8, ["scope", "conf"])) : z("", !0),
                J(" " + U(!p.headerRender && p.label || ""), 1)
              ]),
              _: 2
            }, 1040))), 128))
          ]),
          _: 1
        }, 16),
        y(r).pagintion ? (d(), C(N, {
          key: 0,
          type: "flex",
          align: "middle",
          class: "common-pagination"
        }, {
          default: V(() => [
            O(l, S({
              onSizeChange: h,
              onCurrentChange: i
            }, T.value), null, 16)
          ]),
          _: 1
        })) : z("", !0)
      ])), [
        [le, m.value]
      ]);
    };
  }
}, be = { class: "common-table" }, qe = /* @__PURE__ */ ne({
  __name: "CommonTableTs",
  props: /* @__PURE__ */ ce({
    headTitle: {},
    tableConf: {}
  }, {
    modelValue: {},
    modelModifiers: {}
  }),
  emits: ["update:modelValue"],
  setup(a, { expose: u }) {
    const s = re(a, "modelValue"), r = g(!1), m = g({
      pageNum: 1,
      pageSize: 10,
      total: 0
    }), v = g(null), _ = g(), R = g(10), q = L(
      () => {
        var o, e, n;
        return ((n = (e = (o = a.tableConf) == null ? void 0 : o.requester) == null ? void 0 : e.params) == null ? void 0 : n[1]) ?? R.value;
      }
    ), x = L(() => {
      const {
        bind: o,
        pageFiled: e = "page",
        totalFiled: n = "total"
      } = a.tableConf.pagintion ?? {}, { [e]: t, [n]: c } = m.value ?? {};
      return {
        pageSize: q.value,
        currentPage: t,
        pageSizes: [5, 10, 20],
        total: c,
        layout: "total, sizes, prev, pager, next, jumper",
        ...o
      };
    }), T = async () => {
      const { requester: o } = a.tableConf;
      if (!o) return;
      const { api: e = () => Promise.resolve(), params: n } = o;
      r.value = !0;
      const { data: t } = await B(e)(...n ?? []);
      m.value = t, k(t), r.value = !1;
    }, k = (o) => {
      const e = b(o) ?? [];
      s.value ? s.value = e : a.tableConf.data = e;
    }, j = (o) => {
      a.tableConf.highlightCurrentRow && (v.value = o);
    }, D = ({ column: { property: o }, row: e = {} }) => e == null ? void 0 : e[o], E = (o) => {
      const { column: e, row: n } = o || {}, { property: t, formatter: c } = e ?? {}, l = n == null ? void 0 : n[t], N = typeof l == "number" && (l == null ? void 0 : l.toString()) || l || "--";
      return c ? c(n, o.column, N) : N;
    }, i = (o) => {
      var e, n, t;
      (t = (n = (e = a.tableConf) == null ? void 0 : e.requester) == null ? void 0 : n.params) != null && t[0] && (a.tableConf.requester.params[0] = o), T();
    }, h = (o) => {
      var e, n, t;
      (t = (n = (e = a.tableConf) == null ? void 0 : e.requester) == null ? void 0 : n.params) != null && t[1] && (a.tableConf.requester.params[1] = o), T();
    }, b = (o) => {
      const { getter: e, path: n } = a.tableConf.requester ?? {}, t = n ? oe(o, n) : o;
      return (e == null ? void 0 : e(t)) ?? t;
    };
    function f() {
      var o, e;
      (e = (o = _.value) == null ? void 0 : o.doLayout) == null || e.call(o);
    }
    function w() {
      T(), f();
    }
    return u({ initData: T, restTableLayout: f }), K(w), (o, e) => {
      const n = Q("loading");
      return W((d(), $("div", be, [
        ee(o.$slots, "operaNav", { row: v.value }),
        O(y(de), S({ onCurrentChange: j }, a.tableConf, te(a.tableConf.on ?? {}), {
          data: s.value ?? a.tableConf.data,
          class: "fit-empty",
          ref_key: "commonTable",
          ref: _
        }), {
          default: V(() => [
            a.tableConf.selection ? (d(!0), $(F, { key: 0 }, A(a.tableConf.selection, (t, c) => (d(), C(y(Y), S({ key: c }, { ref_for: !0 }, t), null, 16))), 128)) : z("", !0),
            (d(!0), $(F, null, A(a.tableConf.columnList, (t, c) => (d(), C(y(Y), S({
              key: t.label ?? `column-${c}`
            }, { ref_for: !0 }, t), {
              default: V((l) => [
                t.render ? (d(), C(I(t.render), {
                  key: 0,
                  data: D(l),
                  row: l.row,
                  scope: l,
                  conf: t
                }, null, 8, ["data", "row", "scope", "conf"])) : z("", !0),
                J(" " + U(!t.render && E(l) || ""), 1)
              ]),
              header: V((l) => [
                t.headerRender ? (d(), C(I(t.headerRender), {
                  key: 0,
                  scope: l,
                  conf: t
                }, null, 8, ["scope", "conf"])) : z("", !0),
                J(" " + U(!t.headerRender && t.label || ""), 1)
              ]),
              _: 2
            }, 1040))), 128))
          ]),
          _: 1
        }, 16, ["data"]),
        a.tableConf.pagintion ? (d(), C(y(me), {
          key: 0,
          type: "flex",
          justify: "end",
          align: "middle",
          class: "common-pagination"
        }, {
          default: V(() => [
            O(y(fe), S({
              onSizeChange: h,
              onCurrentChange: i
            }, x.value), null, 16)
          ]),
          _: 1
        })) : z("", !0)
      ])), [
        [n, r.value]
      ]);
    };
  }
});
function Ce(a) {
  return typeof a == "function" || Object.prototype.toString.call(a) === "[object Object]" && !ue(a);
}
const xe = /* @__PURE__ */ ne({
  name: "CommonSelect",
  emits: ["update:modelValue"],
  props: {
    modelValue: String,
    /**
     * 配置选项，通过传入一个 CmOptions 对象进行定制
     */
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    /**
     * 直接传入的数据数组，用于显示下拉选项
     */
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    /**
     * 额外绑定的属性，类型定义参考 Element Plus 的 ElSelect 组件 props
     */
    bind: {
      type: Object
    }
  },
  setup(a, {
    emit: u,
    attrs: s,
    slots: r
  }) {
    const {
      modelValue: m,
      options: v,
      data: _,
      bind: R
    } = Z(a), q = g([]), x = g(!1), T = {
      key: "label",
      value: "value",
      path: "",
      api: () => Promise.resolve({})
    }, k = L(() => ({
      ...T,
      ...v.value
    }));
    function j(i) {
      const {
        key: h,
        value: b
      } = k.value, {
        [h]: f,
        [b]: w
      } = i ?? {};
      return {
        key: f,
        value: w
      };
    }
    async function D() {
      const {
        path: i,
        api: h
      } = k.value ?? {};
      x.value = !0;
      const {
        code: b,
        data: f
      } = await (h == null ? void 0 : h());
      if (b === 0) {
        const w = i ? f[i] : f;
        q.value = w ?? [];
      }
      x.value = !1;
    }
    function E(i) {
      u("update:modelValue", i);
    }
    return K(() => {
      var i;
      (i = v.value) != null && i.api && D();
    }), () => {
      let i;
      return W(O(pe, S({
        modelValue: m.value,
        "onUpdate:modelValue": E,
        filterable: !0,
        clearable: !0
      }, s ?? R.value), Ce(i = (_.value ?? q.value).map((h) => {
        const {
          key: b,
          value: f
        } = j(h);
        return O(ge, {
          key: f,
          label: b,
          value: f
        }, r);
      })) ? i : {
        default: () => [i]
      }), [[Q("loading"), x.value]]);
    };
  }
});
export {
  X as $catchBack,
  Te as $confirmReq,
  xe as CommonSelect,
  ze as CommonTable,
  qe as CommonTableTs,
  B as apiReq,
  Ve as apiTools,
  we as checkFileCatch
};
