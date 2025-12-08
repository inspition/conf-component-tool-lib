<template>
  <!-- 动态列配置容器
    v-bind="conf" 将列配置对象的所有属性绑定到 el-table-column
    支持的属性包括: prop, label, align, width, formatter, headerRender, render, columnList 等
  -->
  <el-table-column v-bind="conf">
    <!-- 递归渲染多级树表头
      当列配置中包含 columnList 时，递归渲染子列
      用于实现复杂的嵌套表头结构
    -->
    <cm-table-dynamic-column
      v-for="(v, i) in conf.columnList"
      :key="'cmdc-' + i"
      :conf="v"
    />

    <!-- 单元格内容插槽：支持自定义渲染和默认渲染两种模式 -->
    <template slot-scope="scope">
      <!-- 自定义单元格渲染模式
        当 conf.render 存在时，使用自定义渲染组件/函数
        conf.render 对象格式:
        {
          props: ['data', 'row'],  // 组件接收的 props 名称列表
          render() {  // 返回 JSX/VNode
            return <el-link>this.data</el-link>
          }
        }
        传入的 props:
        - data: 当前单元格的字段值
        - row: 当前行的完整数据对象
        - scope: el-table slot-scope 完整对象
        - conf: 当前列的配置对象
      -->
      <component
        v-if="conf.render"
        :is="conf.render"
        :data="getPropVal(scope)"
        :row="scope.row"
        :scope="scope"
        :conf="conf"
      ></component>

      <!-- 默认单元格渲染模式
        当没有 conf.render 时，使用 $renderScope 处理格式化
        流程: 获取单元格值 -> 应用 formatter 函数 -> 显示最终内容
      -->
      {{ (!conf.render && $renderScope(scope)) || '' }}
    </template>

    <!-- 表头插槽：支持自定义表头渲染和默认渲染两种模式 -->
    <template slot="header" slot-scope="scope">
      <!-- 自定义表头渲染模式
        当 conf.headerRender 存在时，使用自定义表头渲染组件/函数
        conf.headerRender 对象格式:
        {
          render() {  // 返回 JSX/VNode
            return <el-row>
              <el-col>表头标题</el-col>
              <el-col>导出按钮</el-col>
            </el-row>
          }
        }
        传入的 props:
        - scope: 表头 scope 对象
        - conf: 当前列的配置对象
        示例用途: 在表头中添加导出按钮、筛选器等额外功能
      -->
      <component
        v-if="conf.headerRender"
        :is="conf.headerRender"
        :scope="scope"
        :conf="conf"
      ></component>

      <!-- 默认表头文本显示 -->
      {{ (!conf.headerRender && conf.label) || '' }}
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'cm-table-dynamic-column',
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
        return {}
      },
    },
  },
  computed: {
    /**
     * 判断当前列是否有子列（用于树表头结构判断）
     * @return {Boolean} 当 columnList 存在且长度大于0 时返回 true
     */
    hasChildren() {
      return this.conf?.columnList?.length > 0
    },
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
    getPropVal({ column: { property }, row = {} } = { column: {} }) {
      return row[property]
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
    $renderScope(scope) {
      // console.log(scope)
      const {
        column: { property, formatter },
        row,
      } = scope || {}
      const cellVal =
        // 数值0判断：保留数值0不被当作 falsy 值处理
        (typeof row[property] === 'number' && row[property].toString()) ||
        row[property] ||
        '--'

      return formatter ? formatter(row, scope.column, cellVal) : cellVal
    },
  },
}
</script>

<style lang="scss" scoped></style>
