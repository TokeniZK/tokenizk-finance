<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface RuleForm {
  tokenType: string
  name: string
  symbols: string
  decimals: string
  totalSupply: string
}

const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  tokenType: '',
  name: '',
  symbols: '',
  decimals: '',
  totalSupply: '',
})

const rules = reactive<FormRules<RuleForm>>({

  tokenType: [
    {
      required: true,
      message: 'Please select a Token Type',
      trigger: 'change',
    },
  ],

  name: [
    { required: true, message: 'Please input Token name', trigger: 'blur' },
    { min: 3, max: 10, message: 'Length should be 3 to 10', trigger: 'blur' },
  ],

  symbols: [
    {
      required: true,
      message: 'Please input symbols',
      trigger: 'change',
    },
  ],
  decimals: [
    {
      required: true,
      message: 'Please input decimals (Number type)',
      trigger: 'change',
    },
  ],
  totalSupply: [
    {
      required: true,
      message: 'Please input totalSupply  (Number type)',
      trigger: 'change',
    },
  ],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

</script>

<template>
  <el-row class="row-bg create-ZkToken" justify="center">
    <el-col :span="24">

      <el-row>
        <div class="create-ZkToken-title">
          <h1>Create ZkToken</h1>
        </div>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="120px" class="demo-ruleForm"
            :size="formSize" status-icon label-position="top">

            <el-form-item label="Token Type" prop="tokenType">
              <el-select v-model="ruleForm.tokenType" placeholder="Basic ZkToken">
                <el-option label="Basic ZkToken" />
              </el-select>
            </el-form-item>

            <el-form-item label="Name" prop="name">
              <el-input v-model="ruleForm.name" placeholder="Ex: Mina" />
            </el-form-item>

            <el-form-item label="symbols" prop="symbols">
              <el-input v-model="ruleForm.symbols" placeholder="Ex: Mina" />
            </el-form-item>

            <el-form-item label="Decimals" prop="decimals">
              <el-input v-model="ruleForm.decimals" placeholder="0" />
            </el-form-item>

            <el-form-item label="Total supply" prop="totalSupply">
              <el-input v-model="ruleForm.totalSupply" placeholder="Ex: 100000000000" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)"> Create </el-button>
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            </el-form-item>

          </el-form>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">

          <el-row> Your token was created ! </el-row>

          <el-row>
            <el-col :span="4">Name</el-col>
            <el-col :span="12">tokenizk</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Symbol</el-col>
            <el-col :span="12">tz</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Total supply</el-col>
            <el-col :span="12">100,000</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Address</el-col>
            <el-col :span="12">0xd550e943D6E7Cd1a425088a7C90b08738901CBfD</el-col>
          </el-row>

          <el-button type="primary">View transaction</el-button>
          <el-button type="primary">Create launchpad</el-button>
          <el-button type="primary">Create Fairlaunch</el-button>

        </el-col>
      </el-row>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.create-ZkToken {
  width: 100%;
  padding: 150px;

  .el-row {
    margin-bottom: 40px;
  }
}
</style>