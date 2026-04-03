<template>
  <el-select
    @change="handleChange"
    v-bind="bind"
    :value="value"
    :remote-method="remoteMethod"
    :loading="isLoading"
  >
    <el-option
      v-for="v in list"
      v-bind="formateOption(v)"
      :key="formateOption(v).key"
    >
      <slot v-bind="v"></slot>
    </el-option>
  </el-select>
</template>

<script>
import { apiTools, chainAccess } from '../../tools'

const defaultOptions = {
  key: 'label',
  value: 'value',
  path: '',
  api: () => Promise.resolve([]),
}
export default {
  name: 'CommonSelect',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Array,
      default() {
        return []
      },
    },
    options: {
      type: Object,
      default() {
        return {
          key: 'label',
          value: 'value',
          path: '',
          api: () => Promise.resolve([]),
          searchParams: (query) => query,
          customChange: (e, list) => e,
        }
      },
    },
    data: {
      type: Array,
      default() {
        return []
      },
    },
    bind: {
      type: Object,
      default() {
        return {
          style: { width: '100%' },
          filterable: true,
          clearable: true,
          remote: true,
          multiple: true,
          'multiple-limit': 3,
        }
      },
    },
  },
  computed: {
    dynamicOptions() {
      return { ...defaultOptions, ...this.options }
    },
  },
  data() {
    return {
      isLoading: false,
      list: [],
    }
  },
  mounted() {
    const { init, options } = this
    options.api && init()
  },
  methods: {
    ...apiTools,

    handleChange(e) {
      const { options, list } = this
      const { customChange } = options ?? {}
      const value = customChange ? customChange(e, list) : e

      this.$emit('change', value)
    },
    formateOption(option) {
      const { key: k, value: v } = this.options
      const { [k]: key, [v]: value } = option ?? {}

      return { key, value, label: key }
    },
    async init(...params) {
      const { dynamicOptions } = this
      const { api, path } = dynamicOptions

      this.isLoading = true

      const res = await api?.(...params)
      this.list = path ? chainAccess(res, path) : res

      this.isLoading = false
    },
    remoteMethod(query) {
      const { options, init } = this
      const { searchParams } = options ?? {}
      const param = searchParams?.(query)

      this.list = []
      init(param)
    },
  },
}
</script>

<style lang="scss" scoped></style>
