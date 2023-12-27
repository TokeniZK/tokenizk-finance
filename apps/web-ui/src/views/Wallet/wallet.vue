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

// let flag = ref(true);

// let getFlag = () => {
//   flag.value = !(flag.value);
// }


interface RuleForm {
  token: string
  balance: string
  reciver: string
  amount: string
}

const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive<RuleForm>({
  token: '',
  balance: '',
  reciver: '',
  amount: '',
});

// 正则
const rules = reactive<FormRules<RuleForm>>({

  token: [
    {
      required: true,
      message: 'Please select a Token Type',
      trigger: 'change',
    },
  ],

  balance: [
    {
      type: 'number',
      required: true,
      message: 'balance must be number type',
      trigger: 'blur'
    },
  ],

  reciver: [
    {
      required: true,
      message: 'Please input reciver',
      trigger: 'blur'
    },
  ],

  amount: [
    {
      type: 'number',
      required: true,
      message: 'amount must be number type',
      trigger: 'blur'
    },
  ],

})

// 提交
const submitForm = async (formEl: FormInstance | undefined) => {

  if (!formEl) return

  await formEl.validate((valid, fields) => {

    // Auro Wallet 连接状态 为 已连接 才能 create       valid && cnState
    if (valid && cnState) {

      console.log('submit!')

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
  <el-row class="row-bg Wallet" justify="center">
    <el-col :span="24">

      <el-row>
        <el-col :span="24">

          <el-row>
            <div class="create-ZkToken-title">
              <h1>Wallet Transfer</h1>
            </div>
          </el-row>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="100px" class="demo-ruleForm tokenTable"
            size="large" status-icon label-position="left">

            <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

            <el-form-item label="Token" prop="token">
              <el-select v-model.trim="ruleForm.token" placeholder="Token list">
                <el-option label="ZkToken" value="ZkToken" />
                <el-option label="MkToken" value="MkToken" />
                <el-option label="AkToken" value="AkToken" />
              </el-select>
            </el-form-item>

            <el-form-item label="Balance" prop="balance">
              <el-input v-model.number.trim="ruleForm.balance" placeholder="0" />
            </el-form-item>

            <el-form-item label="Reciver" prop="reciver">
              <el-input v-model.trim="ruleForm.reciver" placeholder="Ex: B62xxx" />
            </el-form-item>

            <el-form-item label="Amount" prop="amount">
              <el-input v-model.number.trim="ruleForm.amount" placeholder="0" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)"> Create </el-button>
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            </el-form-item>

          </el-form>

        </el-col>
      </el-row>

      <!-- 创建后 -->
      <!-- <el-row class="row-bg tokenTable" justify="center" v-show="!flag">
        <el-col :span="24">

          <el-row> Your token was created ! </el-row>

          <el-row>
            <el-col :span="4">Name</el-col>
            <el-col :span="12">{{ ruleForm.name }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Symbol</el-col>
            <el-col :span="12">{{ ruleForm.reciver }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Total supply</el-col>
            <el-col :span="12">{{ ruleForm.totalSupply }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Address</el-col>
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
      </el-row>  -->

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.Wallet {
  width: 100%;
  padding: 10% 20%;

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
