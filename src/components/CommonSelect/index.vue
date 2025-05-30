<script lang="tsx">
import { ElOption, ElSelect } from 'element-plus';
import {
  ref,
  onMounted,
  computed,
  defineComponent,
  toRefs,
  type PropType,
} from 'vue';

type SelectProp = InstanceType<typeof ElSelect>['$props'];

interface CmOptions {
  key?: string;
  value?: string;
  path?: string;
  api?: (...args: any[]) => Promise<any>;
}

// 通用下拉列表封装
export default defineComponent({
  name: 'CommonSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: String,
    options: {
      type: Object as PropType<CmOptions>,
      default() {
        return {};
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    bind: {
      type: Object as PropType<SelectProp>,
    }
  },
  setup(props, { emit, attrs, slots }) {
    // const model = defineModel();
    const { modelValue, options, data, bind } = toRefs(props);

    const list = ref([]);
    const loading = ref(false);
    const defaultOptions: CmOptions = {
      key: 'label',
      value: 'value',
      path: '',
      api: (): Promise<any> => Promise.resolve({}),
    };
    const dynamicOptions = computed<CmOptions>(() => ({
      ...defaultOptions,
      ...options.value,
    }));

    function formateOption(item: any) {
      const { key: k, value: v } = dynamicOptions.value;
      const { [k as string]: key, [v as string]: value } = item ?? {};

      return { key, value };
    }

    async function init() {
      const { path, api } = dynamicOptions.value ?? {};

      loading.value = true;

      const { code, data } = await api?.();
      if (code === 0) {
        const _data = path ? data[path] : data;
        list.value = _data ?? [];
      }

      loading.value = false;
    }

    function handleUpdate(e: any) {
      emit('update:modelValue', e);
    }

    onMounted(() => {
      options.value?.api && init();
    });

    return () => (
      <ElSelect
        v-loading={loading.value}
        modelValue={modelValue.value}
        onUpdate:modelValue={handleUpdate}
        filterable
        clearable
        {...(attrs ?? bind.value)}
      >
        {(data.value ?? list.value).map((v) => (
          <ElOption
            v-slots={slots}
            key={formateOption(v).value}
            label={formateOption(v).key}
            value={formateOption(v).value}
          />
        ))}
      </ElSelect>
    );
  },
});
</script>