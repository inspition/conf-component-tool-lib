var v = (e) => {
  throw TypeError(e);
};
var y = (e, t, n) => t.has(e) || v("Cannot " + n);
var l = (e, t, n) => (y(e, t, "read from private field"), n ? n.call(e) : t.get(e)), a = (e, t, n) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), b = (e, t, n, o) => (y(e, t, "write to private field"), o ? o.call(e, n) : t.set(e, n), n), w = (e, t, n) => (y(e, t, "access private method"), n);
var g = (e, t, n, o) => ({
  set _(r) {
    b(e, t, r, n);
  },
  get _() {
    return l(e, t, o);
  }
});
function N(e, t) {
  return Math.floor(Math.random() * (t - e + 1)) + e;
}
function q(e, t) {
  try {
    const n = e();
    if (!n && [null, void 0].includes(n))
      throw new Error(`get fn() error: ${n}`);
    return n;
  } catch {
    return t;
  }
}
function C(e, t) {
  var r;
  const n = t.split(".");
  let o = e == null ? void 0 : e[((r = n == null ? void 0 : n.shift) == null ? void 0 : r.call(n)) || ""];
  return n.length && o && (o = C(o, n.join("."))), o;
}
function B() {
  let e;
  return (t, n = 500) => {
    clearTimeout(e), e = setTimeout(t, n);
  };
}
function P(e) {
  return e.map((n) => (async () => await n)());
}
function S(e) {
  const t = e == null ? void 0 : e.data;
  if ((t == null ? void 0 : t.code) !== 0) throw t;
  return t;
}
function T(e, t) {
  var j;
  const { data: n, headers: o } = e || {}, r = !n, i = t ?? "filename=";
  if (r) throw e;
  const { "content-disposition": h, "content-type": p } = o || {}, E = p == null ? void 0 : p.split(";").find((m) => m.includes("application")), k = (j = h == null ? void 0 : h.split(";").find((m) => m.includes(i))) == null ? void 0 : j.replace(i, ""), R = k ? decodeURIComponent(k) : "附件", [U, c] = [
    new Blob([n], { type: E }),
    document.createElement("a")
  ];
  c.download = R, c.style.display = "none", c.href = URL.createObjectURL(U), document.body.appendChild(c), c.click(), URL.revokeObjectURL(c.href), document.body.removeChild(c);
}
function $(e) {
  return function(t = {}) {
    const n = {};
    return Object.entries(e).forEach(([o, r]) => {
      Object.defineProperty(n, o, {
        value: C(t, r),
        writable: !0,
        enumerable: !0,
        configurable: !0
      });
    }), n;
  };
}
function L(e, t, n = []) {
  for (const o in e) {
    if (!Object.prototype.hasOwnProperty.call(e, o)) continue;
    const r = [...n, o];
    if (e[o] === t) return r;
    if (typeof e[o] == "object" && e[o] !== null) {
      const i = L(e[o], t, r);
      if (i) return i;
    }
  }
  return null;
}
function F(e) {
  const t = [Number.name, Boolean.name, String.name, "Null", "Undefined"], n = Object.prototype.toString.call(e);
  let o;
  if (n.includes(Array.name))
    o = [];
  else if (n.includes(Object.name))
    o = {};
  else {
    if (n.includes(Function.name))
      return;
    if (t.some((r) => n.includes(r)))
      return e;
    o = {};
  }
  for (const r in e) {
    const i = e[r];
    Object.prototype.toString.call(i).includes(Function.name) || (o[r] = F(i));
  }
  return o;
}
var s, f, u, d, O;
class x {
  constructor(t = 5) {
    a(this, d);
    a(this, s, 0);
    a(this, f, 0);
    a(this, u, []);
    b(this, f, t);
  }
  dequeue(t) {
    return new Promise((n, o) => {
      l(this, u).push({ task: t, resolve: n, reject: o }), w(this, d, O).call(this);
    });
  }
}
s = new WeakMap(), f = new WeakMap(), u = new WeakMap(), d = new WeakSet(), O = function() {
  if (l(this, s) < l(this, f) && l(this, u).length > 0) {
    const { task: t, resolve: n, reject: o } = l(this, u).shift();
    g(this, s)._++, t().then(n).catch(o).finally(() => {
      g(this, s)._--, w(this, d, O).call(this);
    });
  }
};
export {
  T as $downloadFile,
  S as $thenBack,
  x as ConcurrencyManager,
  C as chainAccess,
  F as deepCopy,
  L as findValuePath,
  P as genrateParallels,
  q as getValue,
  $ as itemFiledsMap,
  B as joinDebounce,
  N as random
};
