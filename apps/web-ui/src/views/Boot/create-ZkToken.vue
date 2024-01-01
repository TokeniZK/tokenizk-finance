<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useConnectStatusStore } from '@/stores/connectStatus'


// 组件挂载完成后执行的函数
onMounted(() => {

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

})

const goToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });
};

let connectStatus = useConnectStatusStore();
let { cnState } = connectStatus;

let flag = ref(true);

let getFlag = () => {
  flag.value = !(flag.value);
}


interface RuleForm {

  tokenType: string

  tokenName: string

  symbol: string

  // decimals: string

  totalSaleSupply: string
}

const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive<RuleForm>({
  tokenType: '',
  tokenName: '',
  symbol: '',
  // decimals: '',
  totalSaleSupply: '',
});

// 正则
const rules = reactive<FormRules<RuleForm>>({

  tokenType: [
    {
      required: true,
      message: 'Please select a Token Type',
      trigger: 'change',
    },
  ],

  tokenName: [
    { required: true, message: 'Please input Token name', trigger: 'blur' },
    { min: 3, max: 10, message: 'Length should be 3 to 10', trigger: 'blur' },
  ],

  symbol: [
    {
      required: true,
      message: 'Please input symbol',
      trigger: 'blur'
    },
  ],

  // decimals: [
  //   {
  //     type: 'number',
  //     required: true,
  //     message: 'decimals must be number type',
  //     trigger: 'blur'
  //   },
  // ],

  totalSaleSupply: [
    {
      type: 'number',
      required: true,
      message: 'Total Sale Supply must be number type',
      trigger: 'blur'
    },
  ],
})

// 提交
const submitForm = async (formEl: FormInstance | undefined) => {

  if (!formEl) return

  await formEl.validate((valid, fields) => {

    // Auro Wallet 连接状态 为 已连接 才能 create       valid && cnState
    if (valid) {

      console.log('submit!')

      getFlag()

      goToTop()

    } else {
      console.log('error submit!', fields)

    }

  })

}

// 重置
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}


</script>

<template>
  <el-row class="row-bg create-ZkToken" justify="center">
    <el-col :span="24">

      <el-row v-show="flag">
        <el-col :span="24">

          <el-row>
            <div class="create-ZkToken-title">
              <h1>Create ZkToken</h1>
            </div>
          </el-row>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="120px" class="demo-ruleForm tokenTable"
            size="large" status-icon label-position="top">

            <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

            <el-form-item label="Token Type" prop="tokenType">
              <el-select v-model.trim="ruleForm.tokenType" placeholder="Basic ZkToken">
                <el-option label="Basic ZkToken" value="Basic-ZkToken" />
              </el-select>
            </el-form-item>

            <el-form-item label="Token Name" prop="tokenName">
              <el-input v-model.trim="ruleForm.tokenName" placeholder="Ex: Mina" />
            </el-form-item>

            <el-form-item label="Symbol" prop="symbol">
              <el-input v-model.trim="ruleForm.symbol" placeholder="Ex: Mina" />
            </el-form-item>

            <!-- <el-form-item label="Decimals" prop="decimals">
              <el-input v-model.number.trim="ruleForm.decimals" placeholder="0" />
            </el-form-item> -->

            <el-form-item label="Total Sale Supply" prop="totalSaleSupply">
              <el-input v-model.number.trim="ruleForm.totalSaleSupply" placeholder="Ex: 100000000000" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)"> Create </el-button>
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            </el-form-item>

          </el-form>
        </el-col>
      </el-row>

      <!-- 创建后 -->
      <el-row class="row-bg tokenTable" justify="center" v-show="!flag">
        <el-col :span="24">

          <el-row> Your token was created ! </el-row>

          <el-row>
            <el-col :span="4">Token Name</el-col>
            <el-col :span="12">{{ ruleForm.tokenName }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Symbol</el-col>
            <el-col :span="12">{{ ruleForm.symbol }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Total Sale Supply</el-col>
            <el-col :span="12">{{ ruleForm.totalSaleSupply }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Token Address</el-col>
            <el-col :span="12">0xd550e943D6E7Cd1a425088a7C90b08738901CBfD</el-col>
          </el-row>

          <el-button size="large" disabled>View transaction</el-button>

          <el-button type="primary" size="large">
            <router-link to="/create-normal-launch" style="color: #fff;"> Create launchpad</router-link>
          </el-button>

          <el-button type="primary" size="large">
            <router-link to="/create-normal-launch" style="color: #fff;"> Create Fairlaunch</router-link>
          </el-button>

        </el-col>
      </el-row>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.create-ZkToken {
  width: 100%;
  // padding: 200px 200px 100px 200px;
  padding: 12% 20%;

  .form-notes {
    font-size: 12px;
    color: #00c798;
  }

  .tokenTable {
    background-color: #fff;
    padding: 20px;
  }

  .el-form-item {
    margin-bottom: 35px;
  }

  .el-row {
    margin-bottom: 40px;
  }
}
</style>