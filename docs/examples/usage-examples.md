# 使用示例

## 示例 1：基础表格 + 异步分页

```vue
<template>
  <div>
    <h2>用户管理</h2>
    <CommonTable ref="userTable" :tableConf="tableConf">
      <template #operaNav="{ row }">
        <el-button size="small" @click="editUser(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
      </template>
    </CommonTable>
  </div>
</template>

<script>
import { CommonTable } from '@conf-tool/vue2-element'
import { getUserList, removeUser } from '@/api/user'
import { $confirmReq } from '@conf-tool/vue2-element'

export default {
  components: { CommonTable },
  data() {
    return {
      tableConf: {
        data: [],
        columnList: [
          { prop: 'name', label: '姓名', width: 120 },
          { prop: 'phone', label: '手机号', width: 140 },
          { prop: 'department', label: '部门' },
          { prop: 'role', label: '角色' },
          {
            prop: 'status',
            label: '状态',
            formatter: (row, col, val) => (val === 1 ? '启用' : '禁用'),
          },
          {
            prop: 'createTime',
            label: '创建时间',
            width: 180,
          },
        ],
        requester: {
          api: getUserList,
          params: [1, 10],
          path: 'list',
        },
        pagintion: {
          pageSize: 10,
          pageSizes: [10, 20, 50],
        },
        selection: true,
        bind: { border: true, stripe: true },
      },
    }
  },
  methods: {
    editUser(row) {
      this.$router.push(`/user/edit/${row.id}`)
    },
    deleteUser(row) {
      $confirmReq('确定删除该用户?', removeUser, [row.id], () => {
        this.$message.success('删除成功')
        this.$refs.userTable.search()
      })
    },
  },
}
</script>
```

---

## 示例 2：自定义渲染 + 树形表头

```vue
<template>
  <CommonTable :tableConf="tableConf" />
</template>

<script>
import { CommonTable } from '@conf-tool/vue2-element'
import { getEmployeeList } from '@/api/hr'

// 状态标签渲染组件
const StatusTag = {
  props: ['data', 'row'],
  render() {
    const map = { active: 'success', inactive: 'danger', pending: 'warning' }
    const label = { active: '在职', inactive: '离职', pending: '待入职' }
    return <el-tag type={map[this.data]}>{label[this.data]}</el-tag>
  },
}

// 操作按钮渲染组件
const ActionButtons = {
  props: ['row'],
  render() {
    return (
      <div>
        <el-button size="mini" onClick={() => this.$emit('edit', this.row)}>编辑</el-button>
        <el-button size="mini" type="danger" onClick={() => this.$emit('delete', this.row)}>
          删除
        </el-button>
      </div>
    )
  },
}

export default {
  components: { CommonTable },
  data() {
    return {
      tableConf: {
        data: [],
        columnList: [
          { prop: 'empNo', label: '工号', width: 100 },
          { prop: 'name', label: '姓名', width: 120 },
          {
            label: '基本信息',
            columnList: [
              { prop: 'age', label: '年龄', align: 'center', width: 80 },
              { prop: 'gender', label: '性别', width: 80 },
              {
                label: '联系方式',
                columnList: [
                  { prop: 'phone', label: '手机', width: 140 },
                  { prop: 'email', label: '邮箱', width: 200 },
                ],
              },
            ],
          },
          { prop: 'status', label: '状态', render: StatusTag },
          { prop: '_action', label: '操作', render: ActionButtons, width: 180 },
        ],
        requester: {
          api: getEmployeeList,
          params: [1, 20],
          path: 'list',
        },
        pagintion: {},
      },
    }
  },
}
</script>
```

---

## 示例 3：Vue 3 TypeScript 表格

```vue
<template>
  <CommonTableTs v-model:tableConf="tableConf" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { CommonTableTs } from '@conf-tool/vue3-element-plus'
import type { TableConf, ColumnDef } from '@conf-tool/vue3-element-plus'
import { getProjectList } from '@/api/project'

const columns: ColumnDef[] = [
  { prop: 'projectName', label: '项目名称' },
  { prop: 'manager', label: '负责人', width: 120 },
  {
    prop: 'progress',
    label: '进度',
    formatter: (row, col, val) => `${val}%`,
  },
  {
    prop: 'status',
    label: '状态',
    render: {
      props: ['data'],
      render() {
        const colors: Record<string, string> = {
          running: 'success',
          paused: 'warning',
          done: 'info',
        }
        return <ElTag type={colors[this.data]}>{this.data}</ElTag>
      },
    },
  },
]

const tableConf = reactive<TableConf>({
  data: [],
  columnList: columns,
  requester: {
    api: getProjectList,
    params: [1, 10],
    path: 'list',
  },
  pagintion: {
    pageSize: 10,
    pageFiled: 'pageNum',
    totalFiled: 'total',
  },
})
</script>
```

---

## 示例 4：移动端卡片列表

```vue
<template>
  <CommonCardList :listConf="listConf" />
</template>

<script>
import { CommonCardList } from '@conf-tool/vue2-vant'
import { getNoticeList } from '@/api/notice'

export default {
  components: { CommonCardList },
  data() {
    return {
      listConf: {
        data: [],
        requester: {
          api: getNoticeList,
          params: { page: 1, size: 10 },
          path: 'list',
        },
        refreshConf: {
          pullingText: '下拉即可刷新...',
          loosingText: '释放即可刷新...',
          loadingText: '加载中...',
        },
        cellBind: {
          'is-link': true,
        },
        operation: [
          {
            text: '查看详情',
            type: 'primary',
            click: (row) => {
              this.$router.push(`/notice/${row.id}`)
            },
          },
        ],
        slots: {
          title: {
            props: ['data'],
            render() {
              return (
                <div class="notice-title">
                  <span class="title-text">{this.data.title}</span>
                  {this.data.isNew && <van-tag type="danger">NEW</van-tag>}
                </div>
              )
            },
          },
          label: {
            props: ['data'],
            render() {
              return <span class="notice-date">{this.data.publishTime}</span>
            },
          },
        },
      },
    }
  },
}
</script>
```

---

## 示例 5：描述详情页

```vue
<template>
  <CommonDescriptions :tableConf="descConf" />
</template>

<script>
import { CommonDescriptions } from '@conf-tool/vue2-element'
import { getOrderDetail } from '@/api/order'

const StatusRender = {
  props: ['data'],
  render() {
    const map = { 0: '待审核', 1: '审核通过', 2: '已拒绝', 3: '已完成' }
    const color = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'info' }
    return <el-tag type={color[this.data]}>{map[this.data]}</el-tag>
  },
}

export default {
  components: { CommonDescriptions },
  data() {
    return {
      descConf: {
        data: {},
        requester: {
          api: getOrderDetail,
          params: [this.$route.params.id],
          path: 'detail',
        },
        trList: [
          {
            tdList: [
              { label: '订单编号', prop: 'orderNo', span: 1 },
              { label: '下单时间', prop: 'createTime', span: 1 },
            ],
          },
          {
            tdList: [
              { label: '客户名称', prop: 'customer.name', span: 1 },
              { label: '联系电话', prop: 'customer.phone', span: 1 },
            ],
          },
          {
            tdList: [
              { label: '订单状态', prop: 'status', span: 1, render: StatusRender },
              {
                label: '订单金额',
                prop: 'amount',
                span: 1,
                formatter: (val) => `¥${Number(val).toFixed(2)}`,
              },
            ],
          },
          {
            tdList: [
              { label: '备注', prop: 'remark', span: 2, richText: true },
            ],
          },
        ],
      },
    }
  },
}
</script>
```

---

## 示例 6：下拉选择器 — 多场景

```vue
<template>
  <el-form :model="form" label-width="100px">
    <!-- 场景1: 静态数据 -->
    <el-form-item label="类型">
      <CommonSelect
        v-model="form.type"
        :data="typeList"
        :options="{ key: 'label', value: 'value' }"
      />
    </el-form-item>

    <!-- 场景2: 异步加载 -->
    <el-form-item label="部门">
      <CommonSelect
        v-model="form.deptId"
        :options="{
          api: fetchDeptList,
          key: 'deptName',
          value: 'deptId',
          path: 'list',
        }"
      />
    </el-form-item>

    <!-- 场景3: 远程搜索 -->
    <el-form-item label="负责人">
      <CommonSelect
        v-model="form.managerId"
        :options="{
          api: searchEmployee,
          key: 'name',
          value: 'id',
          path: 'list',
        }"
        :bind="{
          filterable: true,
          remote: true,
          placeholder: '输入姓名搜索',
        }"
      />
    </el-form-item>

    <!-- 场景4: 带自定义回调 -->
    <el-form-item label="城市">
      <CommonSelect
        v-model="form.cityId"
        :options="{
          api: getCityList,
          key: 'cityName',
          value: 'cityId',
          path: 'list',
          params: { province: form.provinceId },
          change: (val, option) => {
            form.cityName = option.cityName
          },
        }"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import { CommonSelect } from '@conf-tool/vue2-element'

export default {
  components: { CommonSelect },
  data() {
    return {
      typeList: [
        { label: '类型A', value: 1 },
        { label: '类型B', value: 2 },
      ],
      form: {
        type: '',
        deptId: '',
        managerId: '',
        cityId: '',
        cityName: '',
        provinceId: '',
      },
    }
  },
}
</script>
```
