import { Message as h, MessageBox as _ } from "element-ui";
import { $downloadFile as g, $thenBack as m, getValue as p, chainAccess as u } from "@conf-tool/shared";
export * from "@conf-tool/shared";
function d(e = "") {
  return function(t) {
    const [n, a] = [
      { ...t },
      e + ((t == null ? void 0 : t.errorMsg) || (t == null ? void 0 : t.msg) || (t == null ? void 0 : t.message) || "")
    ];
    return h.error(a), n;
  };
}
function b(e) {
  return (...t) => e(...t ?? []).then(m).catch(d());
}
async function V(e = "", t = (n) => null) {
  await _.confirm(e, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  }).then((n) => {
    setTimeout(() => t(n), 300);
  });
}
async function A(e = new Blob()) {
  var a;
  const t = await ((a = e == null ? void 0 : e.text) == null ? void 0 : a.call(e));
  let n = !1;
  try {
    const o = JSON.parse(t ?? "null") ?? {};
    n = o.code !== 0, d()(o);
  } catch (o) {
    console.log("JSON 无法解析", o);
  }
  return n;
}
const f = { apiReq: b, $thenBack: m, $catchBack: d, $downloadFile: g };
function c(e, t, n, a, o, s, r, l) {
  var i = typeof e == "function" ? e.options : e;
  return t && (i.render = t, i.staticRenderFns = n, i._compiled = !0), s && (i._scopeId = "data-v-" + s), {
    exports: e,
    options: i
  };
}
const C = {
  name: "cm-table-dynamic-column",
  props: {
    /**
     * 列配置对象，包含该列的所有配置信息
     * @type {Object}
     * @property {String} prop - 数据字段名，绑定行数据中的属性
     * @property {String} label - 列标题文本
     * @property {String} align - 列对齐方式: 'left'|'center'|'right'
     * @property {Number} width - 列宽度（像素）
     * @property {Function} formatter - 格式化函数，用于处理单元格显示内容
     *   参数: formatter(row, column, cellValue)
     *   返回: 格式化后的显示值
     *   示例: (row, {property}) => row.totalFlag === 'Y' ? '' : row[property]
     * @property {Object} render - 自定义单元格渲染配置
     *   @property {Array} props - 组件 props 名称列表
     *   @property {Function} render - 返回 JSX/VNode 的渲染函数
     * @property {Object} headerRender - 自定义表头渲染配置
     *   @property {Function} render - 返回 JSX/VNode 的渲染函数
     * @property {Array} columnList - 子列配置数组，用于多级树表头结构
     *   当存在此属性时，该列成为分组列，包含多个子列
     *   示例:
     *   {
     *     label: '库存礼品',
     *     columnList: [
     *       { prop: 'quantity', label: '数量' },
     *       { prop: 'checkTime', label: '盘库时间' }
     *     ]
     *   }
     */
    conf: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    /**
     * 判断当前列是否有子列（用于树表头结构判断）
     * @return {Boolean} 当 columnList 存在且长度大于0 时返回 true
     */
    hasChildren() {
      var e, t;
      return ((t = (e = this.conf) == null ? void 0 : e.columnList) == null ? void 0 : t.length) > 0;
    }
  },
  methods: {
    /**
     * 从行数据中提取指定列的字段值
     * 用于在 render 自定义渲染时获取原始数据
     * 
     * @param {Object} scope - el-table slot-scope 参数
     *   @property {Object} column - 列对象，包含 property 字段
     *   @property {Object} row - 行数据对象
     * @return {*} 提取出的单元格数据
     * 
     * 使用示例:
     * getPropVal({column: {property: 'stockQuantity'}, row: {stockQuantity: 100}})
     * // 返回: 100
     */
    getPropVal({ column: { property: e }, row: t = {} } = { column: {} }) {
      return t[e];
    },
    /**
     * 处理单元格内容的显示渲染
     * 核心逻辑:
     * 1. 获取原始单元格值
     * 2. 对数值0进行特殊处理（避免被当作 falsy 值处理）
     * 3. 若配置了 formatter 函数，应用格式化处理
     * 4. 若无数据则显示占位符 '--'
     * 
     * @param {Object} scope - el-table slot-scope 作用域插槽参数
     *   @property {Object} column - 列配置对象
     *     @property {String} property - 数据字段名
     *     @property {Function} formatter - 可选的格式化函数
     *   @property {Object} row - 当前行的完整数据对象
     * @return {String|Number} 格式化后的最终显示值
     * 
     * 使用示例:
     * // 示例 1: 基础显示
     * $renderScope({
     *   column: {property: 'deptName'},
     *   row: {deptName: '财务部'}
     * })
     * // 返回: '财务部'
     * 
     * // 示例 2: 应用 formatter 处理
     * $renderScope({
     *   column: {
     *     property: 'checkTime',
     *     formatter: (row, column) => row.totalFlag === 'Y' ? '' : row[column.property]
     *   },
     *   row: {checkTime: '2025-01-01', totalFlag: 'Y'}
     * })
     * // 返回: '' (因为 totalFlag === 'Y')
     * 
     * // 示例 3: 数值 0 的正确显示
     * $renderScope({
     *   column: {property: 'quantity'},
     *   row: {quantity: 0}
     * })
     * // 返回: '0' (而不是 '--')
     */
    $renderScope(e) {
      const {
        column: { property: t, formatter: n },
        row: a
      } = e || {}, o = (
        // 数值0判断：保留数值0不被当作 falsy 值处理
        typeof a[t] == "number" && a[t].toString() || a[t] || "--"
      );
      return n ? n(a, e.column, o) : o;
    }
  }
};
var y = function() {
  var t = this, n = t._self._c;
  return n("el-table-column", t._b({ scopedSlots: t._u([{ key: "default", fn: function(a) {
    return [t.conf.render ? n(t.conf.render, { tag: "component", attrs: { data: t.getPropVal(a), row: a.row, scope: a, conf: t.conf } }) : t._e(), t._v(" " + t._s(!t.conf.render && t.$renderScope(a) || "") + " ")];
  } }, { key: "header", fn: function(a) {
    return [t.conf.headerRender ? n(t.conf.headerRender, { tag: "component", attrs: { scope: a, conf: t.conf } }) : t._e(), t._v(" " + t._s(!t.conf.headerRender && t.conf.label || "") + " ")];
  } }]) }, "el-table-column", t.conf, !1), t._l(t.conf.columnList, function(a, o) {
    return n("cm-table-dynamic-column", { key: "cmdc-" + o, attrs: { conf: a } });
  }), 1);
}, v = [], $ = /* @__PURE__ */ c(
  C,
  y,
  v,
  !1,
  null,
  null
);
const L = $.exports, T = {
  name: "CommonTable",
  components: {
    // CmHeader,
    CmTableDynamicColumn: L
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
        };
      }
    }
  },
  computed: {
    /**
     * 计算当前页大小
     * @return {Number} 从 requester.params[1] 中获取页大小，或使用默认 pageSize
     */
    calcPageSize() {
      return this.$get(() => this.tableConf.requester.params[1]) || this.pageSize;
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
      const { tableConf: e, pageInfo: t, calcPageSize: n } = this, {
        currentPage: a,
        totalPages: o,
        totalCounts: s
      } = t || {};
      return {
        "page-size": n,
        "current-page": a,
        "page-count": o,
        "page-sizes": [5, 10, 20],
        total: s,
        layout: "total, prev, sizes, pager, next",
        background: !0,
        ...e == null ? void 0 : e.pagintion.bind
      };
    }
  },
  data() {
    return {
      isLoading: !1,
      /** 分页信息对象，包含 currentPage, totalPages, totalCounts 等 */
      pageInfo: {},
      /** 默认每页大小 */
      pageSize: 10,
      /** 搜索关键词 */
      keywords: "",
      /** 当前选中行数据 */
      currentRow: null
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    ...f,
    $get: p,
    /**
     * 组件初始化：加载数据并重置表格布局
     */
    async init() {
      const { initData: e, restTableLayout: t } = this;
      await e(), t();
    },
    /**
     * 重置表格布局（处理动态列变化后的列宽问题）
     */
    restTableLayout() {
      var e, t;
      (t = (e = this.$refs.commonTable) == null ? void 0 : e.doLayout) == null || t.call(e);
    },
    /**
     * 处理表格当前行变化事件，用于高亮当前行和获取当前选中行
     * @param {Object} val - 当前行数据
     */
    handleTableCurrentChange(e) {
      this.tableConf["highlight-current-row"] && (this.currentRow = e);
    },
    /**
     * 处理分页组件页码变化，更新 requester.params[0]（页码）并重新加载数据
     * @param {Number} cur - 新的页码
     */
    handleCurrentChange(e) {
      const { $get: t, initData: n, tableConf: a } = this;
      t(() => a.requester.params[0] = e), n();
    },
    /**
     * 处理分页组件页大小变化，更新 requester.params[1]（页大小）并重新加载数据
     * @param {Number} size - 新的每页大小
     */
    handleSizeChange(e) {
      const { $get: t, initData: n, tableConf: a } = this;
      t(() => a.requester.params[1] = e), n();
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
      const { tableConf: e, apiReq: t, decodeData: n } = this, { requester: a } = e;
      if (!a) return;
      const { api: o, params: s } = a;
      this.isLoading = !0;
      const { object: r } = await t(o)(...s ?? []);
      this.pageInfo = r, e.data = n(r) || [], this.isLoading = !1;
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
    decodeData(e) {
      const { getter: t, path: n } = this.tableConf.requester ?? {}, a = n ? u(e, n) : e;
      return (t == null ? void 0 : t(a)) ?? a;
    },
    /**
     * 自定义搜索方法：使用新参数调用 API 并更新表格数据
     * 常用于搜索、筛选操作
     * 
     * @param {...*} parmasSearch - 新的搜索参数，会覆盖原有的 requester.params
     */
    async search(...e) {
      const { tableConf: t, apiReq: n, decodeData: a } = this, { api: o, params: s } = t.requester, r = e.length ? [...e] : [...s];
      this.isLoading = !0;
      const { object: l } = await n(o)(...r);
      this.isLoading = !1, this.pageInfo = l, t.data = a(l) || [];
    }
  }
};
var w = function() {
  var t = this, n = t._self._c;
  return n("div", { directives: [{ name: "loading", rawName: "v-loading", value: t.isLoading, expression: "isLoading" }], staticClass: "common-table" }, [t._t("operaNav", null, { row: t.currentRow }), n("el-table", t._g(t._b({ ref: "commonTable", staticClass: "fit-empty", on: { "current-change": t.handleTableCurrentChange } }, "el-table", t.tableConf, !1), t.tableConf.on), [t.tableConf.selection ? t._l(t.tableConf.selection, function(a, o) {
    return n("el-table-column", t._b({ key: o }, "el-table-column", a, !1));
  }) : t._e(), t._l(t.tableConf.columnList, function(a, o) {
    return n("cm-table-dynamic-column", { key: "column-" + o, attrs: { conf: a } });
  })], 2), t.tableConf.pagintion ? n("el-row", { staticClass: "common-pagination", attrs: { type: "flex", align: "middle" } }, [n("el-pagination", t._b({ on: { "size-change": t.handleSizeChange, "current-change": t.handleCurrentChange } }, "el-pagination", t.dynamicPagintion, !1))], 1) : t._e()], 2);
}, k = [], x = /* @__PURE__ */ c(
  T,
  w,
  k,
  !1,
  null,
  "816b4bed"
);
const N = x.exports, R = {
  name: "CommonDescriptions",
  // components: { CmHeader },
  props: {
    headTitle: [String, Array],
    tableConf: {
      type: Object,
      default() {
        return {
          // headTitle: '客户基本信息',
          // icon: require('@/assets/img/u1130.png'),
          // data: {},
          // requester: {
          //   params: [1, 10],
          //   api: () => Promise.resolve(),
          //   path: "", // 接口返回后数据解析路径
          //   getter: () => null, // 返回数据过滤方法
          // },
          // trList: [
          //   {
          //     tdList: [
          //       { label: '客户名称', prop: '重庆高安安建筑劳务有限公司' },
          //       { label: '客户编号', prop: 'P0001' }
          //     ]
          //   },
          //   {
          //     tdList: [
          //       { label: '异常状态', prop: '本金逾期' },
          //       { label: '信用评级', prop: '13级' }
          //     ]
          //   },
          // ]
        };
      }
    }
  },
  data() {
    return {
      isLoading: !1
    };
  },
  computed: {
    iconImg() {
      const e = this.tableConf.icon;
      return e && { backgroundImage: `url(${e})` };
    },
    calcTitle() {
      return this.headTitle || this.tableConf.headTitle;
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    ...f,
    $get: p,
    async initData() {
      const { tableConf: e, apiReq: t, decodeData: n } = this, { requester: a } = e;
      if (!a) return;
      const { api: o, params: s } = a;
      this.isLoading = !0;
      const { object: r } = await t(o)(...s ?? []);
      this.pageInfo = r, e.data = n(r) || [], this.isLoading = !1;
    },
    /**
     * 解析数据
     *
     * @param   {[type]}  res  [res description]
     *
     * @return  {[type]}       [return description]
     */
    decodeData(e) {
      const { getter: t, path: n } = this.tableConf.requester ?? {}, a = n ? u(e, n) : e;
      return (t == null ? void 0 : t(a)) ?? a;
    },
    /**
     * 计算单元格内容
     */
    calcText(e = {}) {
      const { text: t, prop: n, formatter: a = () => {
      } } = e, o = this.$get(() => this.tableConf.data[n], "");
      return (
        // 定制格式
        a(o) || // 字段值
        o || // 默认文本
        "--"
      );
    },
    /**
     * 获取字段值
     */
    getPropVal({ prop: e = "" } = {}) {
      return this.$get(() => this.tableConf.data[e]);
    }
  }
};
var S = function() {
  var t = this, n = t._self._c;
  return n("div", { directives: [{ name: "loading", rawName: "v-loading", value: t.isLoading, expression: "isLoading" }], staticClass: "common-descriptions" }, [n("table", { staticClass: "desc_tb" }, [n("tbody", t._l(t.tableConf.trList, function(a, o) {
    return n("tr", t._b({ key: "tr-" + o }, "tr", a.attrs, !1), [t._l(a.tdList, function(s, r) {
      return [n("th", t._b({ key: o + "-th-" + r, staticClass: "tb-label" }, "th", s.attrs_label, !1), [t._v(" " + t._s(s.label) + " ")]), n("td", t._b({ key: o + "-td-" + r, staticClass: "tb-info" }, "td", s.attrs_info, !1), [s.render ? n(s.render, { tag: "component", attrs: { data: t.getPropVal(s), dataParent: t.tableConf.data, conf: s } }) : s.v_html ? n("div", { staticClass: "td-richText", domProps: { innerHTML: t._s(t.getPropVal(s)) } }) : !s.render && t.calcText(s) ? n("span", [t._v(t._s(!s.render && t.calcText(s) || ""))]) : t._e()], 1)];
    })], 2);
  }), 0)])]);
}, D = [], P = /* @__PURE__ */ c(
  R,
  S,
  D,
  !1,
  null,
  "e3180940"
);
const J = P.exports, q = {
  key: "label",
  value: "value",
  path: "",
  api: () => Promise.resolve([])
}, z = {
  name: "CommonSelect",
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    /**
     * 配置项
     */
    options: {
      type: Object,
      default() {
        return {
          key: "label",
          value: "value",
          path: "",
          api: () => Promise.resolve([]),
          // 远程搜索参数加工函数
          searchParams: (e) => e,
          // 自定义值更新回调
          customChange: (e, t) => e
        };
      }
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    /**
     * el-select API覆盖
     */
    bind: {
      type: Object,
      default() {
        return {
          style: { width: "100%" },
          filterable: !0,
          clearable: !0,
          remote: !0,
          multiple: !0,
          "multiple-limit": 3
        };
      }
    }
  },
  computed: {
    /**
     * 合并传入的Options与默认配置
     *
     * @return  {[type]}  [return description]
     */
    dynamicOptions() {
      return { ...q, ...this.options };
    }
  },
  data() {
    return {
      isLoading: !1,
      list: []
    };
  },
  mounted() {
    const { init: e, options: t } = this;
    t.api && e();
  },
  methods: {
    ...f,
    handleChange(e) {
      const { options: t, list: n } = this, { customChange: a } = t ?? {}, o = a ? a(e, n) : e;
      this.$emit("change", o);
    },
    formateOption(e) {
      const { key: t, value: n } = this.options, { [t]: a, [n]: o } = e ?? {};
      return { key: a, value: o, label: a };
    },
    async init(...e) {
      const { dynamicOptions: t } = this, { api: n, path: a } = t;
      this.isLoading = !0;
      const o = await (n == null ? void 0 : n(...e));
      this.list = a ? u(o, a) : o, this.isLoading = !1;
    },
    remoteMethod(e) {
      const { options: t, init: n } = this, { searchParams: a } = t ?? {}, o = a == null ? void 0 : a(e);
      this.list = [], n(o);
    }
  }
};
var O = function() {
  var t = this, n = t._self._c;
  return n("el-select", t._b({ attrs: { value: t.value, "remote-method": t.remoteMethod, loading: t.isLoading }, on: { change: t.handleChange } }, "el-select", t.bind, !1), t._l(t.list, function(a) {
    return n("el-option", t._b({ key: t.formateOption(a).key }, "el-option", t.formateOption(a), !1), [t._t("default", null, null, a)], 2);
  }), 1);
}, j = [], I = /* @__PURE__ */ c(
  z,
  O,
  j,
  !1,
  null,
  "0c303db0"
);
const H = I.exports;
export {
  d as $catchBack,
  V as $confirmReq,
  L as CmTableDynamicColumn,
  J as CommonDescriptions,
  H as CommonSelect,
  N as CommonTable,
  b as apiReq,
  f as apiTools,
  A as checkFileCatch
};
