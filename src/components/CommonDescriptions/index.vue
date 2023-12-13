<template>
  <div class="common-descriptions" v-loading="isLoading">
    <!-- <cm-header
      v-if="calcTitle"
      @title-click="$emit('title-click', $event)"
      :icon="tableConf.icon"
      :title="calcTitle"
    /> -->

    <table class="desc_tb">
      <tbody>
        <tr
          v-for="(tr, i) in tableConf.trList"
          :key="'tr-' + i"
          v-bind="tr.attrs"
        >
          <template v-for="(td, i2) in tr.tdList">
            <th :key="i + '-th-' + i2" class="tb-label" v-bind="td.attrs_label">
              {{ td.label }}
            </th>
            <td :key="i + '-td-' + i2" class="tb-info" v-bind="td.attrs_info">
              <!-- render || JSX -->
              <component
                v-if="td.render"
                :is="td.render"
                :data="getPropVal(td)"
                :dataParent="tableConf.data"
                :conf="td"
              ></component>

              <!-- richText -->
              <div
                v-else-if="td.v_html"
                v-html="getPropVal(td)"
                class="td-richText"
              ></div>

              <span v-else-if="!td.render && calcText(td)">{{
                (!td.render && calcText(td)) || ""
              }}</span>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { apiTools, chainAccess, getValue } from "@/utils/common-tools";

export default {
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
      },
    },
  },
  data() {
    return {
      isLoading: false,
    };
  },
  computed: {
    iconImg() {
      const icon = this.tableConf.icon;
      return icon && { backgroundImage: `url(${icon})` };
    },
    calcTitle() {
      return this.headTitle || this.tableConf.headTitle;
    },
  },
  mounted() {
    this.initData();
  },
  methods: {
    ...apiTools,

    $get: getValue,
    async initData() {
      const { tableConf, apiReq, decodeData } = this;
      const { requester } = tableConf;

      if (!requester) return;

      const { api, params } = requester;

      this.isLoading = true;

      const { object } = await apiReq(api)(...(params ?? []));
      this.pageInfo = object;
      tableConf.data = decodeData(object) || [];

      this.isLoading = false;
    },
    /**
     * 解析数据
     *
     * @param   {[type]}  res  [res description]
     *
     * @return  {[type]}       [return description]
     */
    decodeData(res) {
      const { getter, path } = this.tableConf.requester ?? {};
      const decode = path ? chainAccess(res, path) : res;
      const data = getter?.(decode) ?? decode;

      return data;
    },
    /**
     * 计算单元格内容
     */
    calcText(td = {}) {
      const { text, prop, formatter = () => {} } = td;
      const FieldVal = this.$get(() => this.tableConf.data[prop], "");

      return (
        // 定制格式
        formatter(FieldVal) ||
        // 字段值
        FieldVal ||
        // 默认文本
        "--"
      );
    },
    /**
     * 获取字段值
     */
    getPropVal({ prop = "" } = {}) {
      const val = this.$get(() => this.tableConf.data[prop]);
      return val;
    },
  },
};
</script>

<style lang="scss" scoped>
.common-descriptions ::v-deep {
  $label-bg: #f5f8fa;
  .desc_tb {
    width: 100%;
    border: 1px solid #f0f0f0;
    border-left: 0;
    border-collapse: collapse;

    tr {
      height: 50px;
      border-bottom: 1px solid #f0f0f0;
    }
    th,
    td {
      padding: 10px 30px;
      font-size: 13px;
    }
    td i {
      margin-right: 25px;
      &:before {
        margin-right: 5px;
        font-weight: bold;
        color: #13c79e;
      }
    }
    .tb-label {
      font-weight: normal;
      text-align: center;
      width: 14%;
      background: $label-bg;
    }
    .tb-info {
      width: 35%;
    }
    .require:before {
      content: "*";
      color: #ff4d4f;
    }
  }
}
</style>
