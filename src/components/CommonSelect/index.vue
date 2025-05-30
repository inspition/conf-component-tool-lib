<script lang="tsx">
import { ElOption, ElSelect } from 'element-plus'
import {
  ref,
  onMounted,
  computed,
  defineComponent,
  toRefs,
  type PropType,
} from 'vue'

/*
 * 类型定义部分
 */

/**
 * 通过 ElSelect 的实例类型获取其 props 类型
 */
type SelectProp = InstanceType<typeof ElSelect>['$props']

/**
 * 定义通用下拉组件的选项接口
 */
interface CmOptions {
  /**
   * 选项展示文本对应的属性名
   */
  key?: string
  /**
   * 选项值对应的属性名
   */
  value?: string
  /**
   * 数据路径，用于从接口返回的数据中提取数据
   */
  path?: string
  /**
   * 异步获取数据的方法
   */
  api?: (...args: any[]) => Promise<any>
}

// 通用下拉列表封装
export default defineComponent({
  name: 'CommonSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: String,
    /**
     * 配置选项，通过传入一个 CmOptions 对象进行定制
     */
    options: {
      type: Object as PropType<CmOptions>,
      default() {
        return {}
      },
    },
    /**
     * 直接传入的数据数组，用于显示下拉选项
     */
    data: {
      type: Array,
      default() {
        return []
      },
    },
    /**
     * 额外绑定的属性，类型定义参考 Element Plus 的 ElSelect 组件 props
     */
    bind: {
      type: Object as PropType<SelectProp>,
    },
  },
  setup(props, { emit, attrs, slots }) {
    // 使用 toRefs 解构 props，保持响应式
    const { modelValue, options, data, bind } = toRefs(props)

    // 定义用于存储异步接口返回数据的响应式变量
    const list = ref([])
    // 定义异步加载状态的响应式变量
    const loading = ref(false)

    // 定义默认的选项配置
    const defaultOptions: CmOptions = {
      key: 'label',
      value: 'value',
      path: '',
      api: (): Promise<any> => Promise.resolve({}),
    }

    /**
     * 合并传入的 options 与默认配置，生成最终的配置
     */
    const dynamicOptions = computed<CmOptions>(() => ({
      ...defaultOptions,
      ...options.value,
    }))

    /*
     * 格式化单个选项数据
     * 参数 item: 任意数据对象，根据 dynamicOptions 中指定的 key 与 value 提取对应值
     */
    function formatOption(item: any) {
      const { key: k, value: v } = dynamicOptions.value
      const { [k as string]: key, [v as string]: value } = item ?? {}

      return { key, value }
    }

    /*
     * 异步初始化数据
     * 调用配置项中传入的 api 方法获取数据，并根据 path 解析数据
     */
    async function init() {
      const { path, api } = dynamicOptions.value ?? {}

      loading.value = true

      const { code, data } = await api?.()
      if (code === 0) {
        const _data = path ? data[path] : data
        list.value = _data ?? []
      }

      loading.value = false
    }

    function handleUpdate(e: any) {
      emit('update:modelValue', e)
    }

    onMounted(() => {
      options.value?.api && init()
    })

    return () => (
      <ElSelect
        v-loading={loading.value}
        modelValue={modelValue.value}
        onUpdate:modelValue={handleUpdate}
        filterable
        clearable
        {...(attrs ?? bind.value)}
      >
        {(data.value ?? list.value).map(v => {
          const { key, value } = formatOption(v)

          return (
            <ElOption
              v-slots={slots}
              key={value}
              label={key}
              value={value}
            />
          )
        })}
      </ElSelect>
    )
  },
})
</script>
