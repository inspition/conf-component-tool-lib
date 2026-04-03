<template>
  <div class="common-descriptions" v-loading="isLoading">
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
              <component
                v-if="td.render"
                :is="td.render"
                :data="getPropVal(td)"
                :dataParent="tableConf.data"
                :conf="td"
              ></component>

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
import { apiTools, chainAccess, getValue } from '../../tools'

export default {
  name: 'CommonDescriptions',
  props: {
    headTitle: [String, Array],
    tableConf: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      isLoading: false,
    }
  },
  computed: {
    iconImg() {
      const icon = this.tableConf.icon
      return icon && { backgroundImage: `url(${icon})` }
    },
    calcTitle() {
      return this.headTitle || this.tableConf.headTitle
    },
  },
  mounted() {
    this.initData()
  },
  methods: {
    ...apiTools,

    $get: getValue,
    async initData() {
      const { tableConf, apiReq, decodeData } = this
      const { requester } = tableConf

      if (!requester) return

      const { api, params } = requester

      this.isLoading = true

      const { object } = await apiReq(api)(...(params ?? []))
      this.pageInfo = object
      tableConf.data = decodeData(object) || []

      this.isLoading = false
    },
    decodeData(res) {
      const { getter, path } = this.tableConf.requester ?? {}
      const decode = path ? chainAccess(res, path) : res
      const data = getter?.(decode) ?? decode

      return data
    },
    calcText(td = {}) {
      const { text, prop, formatter = () => {} } = td
      const FieldVal = this.$get(() => this.tableConf.data[prop], '')

      return formatter(FieldVal) || FieldVal || '--'
    },
    getPropVal({ prop = '' } = {}) {
      const val = this.$get(() => this.tableConf.data[prop])
      return val
    },
  },
}
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
      content: '*';
      color: #ff4d4f;
    }
  }
}
</style>
