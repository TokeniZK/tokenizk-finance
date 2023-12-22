<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useConnectStatus } from '@/stores/connectStatus'

const goToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });
};

// 判断钱包连接状态
let connectStatus = useConnectStatus();
let { cnState } = connectStatus;

const flagX = ref(0);

const nextX = () => {

  if (flagX.value >= 3) {
    flagX.value = 3
  } else {
    flagX.value++
    goToTop()
  }

}

const prevX = () => {

  if (flagX.value <= 0) {
    flagX.value = 0
  } else {
    flagX.value--
    goToTop()
  }

}

// 步骤条 ：上一步、下一步
const active = ref(0)

const next = () => {

  if (active.value >= 3) {
    active.value = 3
  } else {
    active.value++
    nextX()
  }

}

const prev = () => {

  if (active.value <= 0) {
    active.value = 0
  } else {
    active.value--
    prevX()
  }

}


interface RuleForm {
  tokenddress: string
  name: string
  currency: string
  feeOptions: string
  totalSellingAmount: string
  whiteList: string
  softCap: string
  liquidity: string
  startTime: string
  endTime: string
  liquidityLockup: string
  logoUrl: string
  webSite: string
  facebook: string
  twitter: string
  github: string
  telegram: string
  instagram: string
  discord: string
  reddit: string
  description: string
}

const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive<RuleForm>({
  tokenddress: '',
  name: '',
  feeOptions: '',
  currency: '',
  totalSellingAmount: '',
  whiteList: '',
  softCap: '',
  liquidity: '',
  startTime: '',
  endTime: '',
  liquidityLockup: '',
  logoUrl: '',
  webSite: '',
  facebook: '',
  twitter: '',
  github: '',
  telegram: '',
  instagram: '',
  discord: '',
  reddit: '',
  description: '',
})

// 正则
const rules = reactive<FormRules<RuleForm>>({

  // 步骤1
  tokenddress: [
    { required: true, message: 'Please input Token address', trigger: 'blur' },
    { min: 3, max: 10, message: 'Length should be 3 to 10', trigger: 'blur' },
  ],

  currency: [
    {
      required: true,
      message: 'Please select currency',
      trigger: 'change',
    },
  ],


  feeOptions: [
    {
      required: true,
      message: 'Please select any feeOptions',
      trigger: 'change',
    },
  ],


  // 步骤2
  totalSellingAmount: [
    {
      type: 'number',
      required: true,
      message: 'totalSellingAmount must be number type',
      trigger: 'blur'
    },
  ],

  whiteList: [
    {
      required: true,
      message: 'Please select at least one',
      trigger: 'change',
    },
  ],

  softCap: [
    {
      type: 'number',
      required: true,
      message: 'softCap must be number type',
      trigger: 'blur'
    },
  ],

  liquidity: [
    {
      type: 'number',
      required: true,
      message: 'liquidity must be number type',
      trigger: 'blur'
    },
  ],

  startTime: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change',
    },
  ],

  endTime: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change',
    },
  ],

  liquidityLockup: [
    {
      type: 'number',
      required: true,
      message: 'liquidityLockup must be number type',
      trigger: 'blur'
    },
  ],

  logoUrl: [
    { required: true, message: 'Please input logoUrl', trigger: 'blur' },
  ],

  webSite: [
    { required: true, message: 'Please input webSite address', trigger: 'blur' },
  ],

  facebook: [
    { required: true, message: 'Please input facebook address', trigger: 'blur' },
  ],

  twitter: [
    { required: true, message: 'Please input twitter address', trigger: 'blur' },
  ],

  github: [
    { required: true, message: 'Please input github address', trigger: 'blur' },
  ],

  telegram: [
    { required: true, message: 'Please input telegram address', trigger: 'blur' },
  ],

  instagram: [
    { required: true, message: 'Please input instagram address', trigger: 'blur' },
  ],

  discord: [
    { required: true, message: 'Please input discord address', trigger: 'blur' },
  ],

  reddit: [
    { required: true, message: 'Please input reddit address', trigger: 'blur' },
  ],

  description: [
    { required: true, message: 'Please input Description', trigger: 'blur' },
  ],

})

// 提交
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    // Auro Wallet 连接状态 为 已连接 才能 create     valid && cnState
    if (valid && cnState) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

// submitForm(ruleFormRef)

</script>


<template>
  <el-row class="row-bg create-fair-launch" justify="center">
    <el-col :span="24">

      <el-row>
        <div class="create-ZkToken-title">
          <h1>Create Fair Launch</h1>
        </div>
      </el-row>

      <!-- 步骤条 -->
      <el-row class="row-bg Step-Bar" justify="center">
        <el-col :span="24">

          <el-steps :active="active" finish-status="success" align-center>


            <el-step title="Verify Token" description="Enter the token address and verify" />

            <el-step title="Fairlaunch Info"
              description="Enter the launchpad information that you want to raise , that should be enter all details about your presale" />

            <el-step title="Add Additional Info " description="Let people know who you are" />

            <el-step title="Finish" description="Review your information" />

          </el-steps>

        </el-col>
      </el-row>


      <!-- 步骤流程 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="24">

          <el-row>
            <el-col :span="24">

              <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="120px" class="demo-ruleForm"
                size="large" status-icon label-position="top">

                <!-- 步骤1 -->
                <el-row class="row-bg formTable1" v-show="flagX === 0">
                  <div class="form-notes" style="margin-bottom: 10px;">(*) is required field.</div>
                  <el-col :span="24">

                    <el-row class="row-bg">
                      <el-col :span="11">
                        <el-form-item label="Token address" prop="tokenddress">
                          <el-input v-model.trim="ruleForm.tokenddress" placeholder="Ex: Mina" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="1"></el-col>

                      <el-col :span="12">
                        <el-form-item label="Name" prop="name">
                          <el-input v-model.trim="ruleForm.name" placeholder="name" />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-form-item label="Currency" prop="currency">
                      <el-radio-group v-model="ruleForm.currency">
                        <el-radio label="Mina" />
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item label="Fee Options" prop="feeOptions">
                      <el-radio-group v-model="ruleForm.feeOptions">
                        <el-radio label="5% raised only (Recommended)" />
                        <el-radio label="Other" />
                      </el-radio-group>
                    </el-form-item>

                  </el-col>
                </el-row>

                <!-- 步骤2 -->
                <el-row class="row-bg formTable1" v-show="flagX === 1">
                  <div class="form-notes" style="margin-bottom: 10px;">(*) is required field.</div>

                  <el-col :span="24">
                    <el-form-item label="Total selling amount" prop="totalSellingAmount">
                      <el-input v-model.number.trim="ruleForm.totalSellingAmount" placeholder="0" />
                      <div class="form-notes">If I spend 1 Mina how many tokens will I receive?</div>
                    </el-form-item>

                    <el-form-item label="Whitelist" prop="whiteList">
                      <el-radio-group v-model="ruleForm.whiteList">
                        <el-radio label="Disable" />
                        <el-radio label="Enable" />
                        <div class="form-notes">You can enable/disable whitelist anytime.</div>
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item label="SoftCap (Mina)" prop="softCap">
                      <el-input v-model.number.trim="ruleForm.softCap" placeholder="0" />
                      <div class="form-notes"> Setting max contribution?</div>
                    </el-form-item>

                    <el-form-item label="Liquidity (%)" prop="liquidity">
                      <el-input v-model.number.trim="ruleForm.liquidity" placeholder="0" />
                    </el-form-item>

                    <el-row class="row-bg">
                      <el-col :span="12">
                        <el-form-item label="Start Time (UTC)" required style="width: 100%">
                          <el-date-picker v-model="ruleForm.startTime" type="datetime" placeholder="Pick a Date"
                            format="YYYY/MM/DD hh:mm:ss" value-format="x" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="End Time (UTC)" required style="width: 100%">
                          <el-date-picker v-model="ruleForm.endTime" type="datetime" placeholder="Pick a Date"
                            format="YYYY/MM/DD hh:mm:ss" value-format="x" />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-form-item label="Liquidity lockup (minutes)" prop="liquidityLockup">
                      <el-input v-model.number.trim="ruleForm.liquidityLockup" placeholder="0" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <!-- 步骤3 -->
                <el-row class="row-bg formTable1" v-show="flagX === 2">
                  <div class="form-notes" style="margin-bottom: 10px;">(*) is required field.</div>
                  <el-col :span="24">

                    <el-row class="row-bg">
                      <el-col :span="11">
                        <el-form-item label="Logo URL" prop="logoUrl">
                          <el-input v-model.trim="ruleForm.logoUrl" placeholder="Ex: https://..." />
                          <div class="form-notes">URL must end with a supported image extension png, jpg, jpeg or
                            gif.Youbcan upload your image at .</div>
                        </el-form-item>
                      </el-col>

                      <el-col :span="1"></el-col>

                      <el-col :span="12">
                        <el-form-item label="Website" prop="webSite">
                          <el-input v-model.trim="ruleForm.webSite" placeholder="Ex: https://..." />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row class="row-bg">
                      <el-col :span="11">
                        <el-form-item label="Facebook" prop="facebook">
                          <el-input v-model.trim="ruleForm.facebook" placeholder="Ex: https://facebook.com/..." />
                        </el-form-item>
                      </el-col>

                      <el-col :span="1"></el-col>

                      <el-col :span="12">
                        <el-form-item label="Twitter" prop="twitter">
                          <el-input v-model.trim="ruleForm.twitter" placeholder="Ex: https://twitter.com/..." />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row class="row-bg">
                      <el-col :span="11">
                        <el-form-item label="Github" prop="github">
                          <el-input v-model.trim="ruleForm.github" placeholder="Ex: https://github.com/..." />
                        </el-form-item>
                      </el-col>
                      <el-col :span="1"></el-col>

                      <el-col :span="12">
                        <el-form-item label="Telegram" prop="telegram">
                          <el-input v-model.trim="ruleForm.telegram" placeholder="Ex: https://t.me/..." />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row class="row-bg">
                      <el-col :span="11">
                        <el-form-item label="Instagram" prop="instagram">
                          <el-input v-model.trim="ruleForm.instagram" placeholder="Ex: https://instagram.com/..." />
                        </el-form-item>
                      </el-col>
                      <el-col :span="1"></el-col>

                      <el-col :span="12">
                        <el-form-item label="Discord" prop="discord">
                          <el-input v-model.trim="ruleForm.discord" placeholder="Ex: https://discord.com/" />
                        </el-form-item>
                      </el-col>
                    </el-row>


                    <el-form-item label="Reddit" prop="reddit">
                      <el-input v-model.trim="ruleForm.reddit" placeholder="Ex: https://reddit.com/..." />
                    </el-form-item>

                    <el-form-item label="Description" prop="description">
                      <el-input v-model.trim="ruleForm.description" type="textarea"
                        placeholder="Ex: This is the best project..." />
                    </el-form-item>
                  </el-col>
                </el-row>

                <!-- 步骤4 -->
                <el-row class="row-bg formTable2" v-show="flagX === 3">
                  <el-col :span="24">

                    <el-row class="row-bg">
                      <el-col :span="12">Total token</el-col>
                      <el-col :span="12">{{ ruleForm.totalSellingAmount }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Token name</el-col>
                      <el-col :span="12">{{ ruleForm.name }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Token symbol</el-col>
                      <el-col :span="12"><!-- {{ ruleForm.symbol }} --></el-col>

                    </el-row>
                    <el-row>
                      <el-col :span="12">Token decimals</el-col>
                      <el-col :span="12"><!-- {{ ruleForm.decimals }} --></el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Softcap</el-col>
                      <el-col :span="12">{{ ruleForm.softCap }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Liquidity</el-col>
                      <el-col :span="12">{{ ruleForm.liquidity }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Start Time</el-col>
                      <el-col :span="12">{{ ruleForm.startTime }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">End Time</el-col>
                      <el-col :span="12">{{ ruleForm.endTime }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Liquidity lockup time</el-col>
                      <el-col :span="12">{{ ruleForm.liquidityLockup }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Website</el-col>
                      <el-col :span="12">{{ ruleForm.webSite }}</el-col>
                    </el-row>
                  </el-col>
                </el-row>


                <!-- 上一步、下一步 -->
                <el-row class="row-bg" justify="center">
                  <el-col :span="8"></el-col>

                  <el-col :span="6">
                    <el-form-item>
                      <el-button class="steps-Bar" @click="prev" type="primary" size="large">back</el-button>
                      <el-button class="steps-Bar" @click="next" type="primary" size="large">Next </el-button>
                      <!-- <el-button type="primary" @click="submitForm(ruleFormRef)"> Create </el-button> -->
                    </el-form-item>
                  </el-col>

                  <el-col :span="6"></el-col>
                </el-row>

              </el-form>
            </el-col>
          </el-row>

        </el-col>
      </el-row>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.create-fair-launch {
  width: 100%;
  padding: 120px;

  .form-notes {
    font-size: 12px;
    color: #00c798;
  }

  .Step-Bar {
    margin: 80px auto;
  }

  .steps-Bar {
    margin-right: 30px;
  }

  // 日期选择器
  .demo-datetime-picker {
    display: flex;
    width: 100%;
    padding: 0;
    flex-wrap: wrap;
  }

  .demo-datetime-picker .block {
    padding: 30px 0;
    text-align: center;
    border-right: solid 1px var(--el-border-color);
    flex: 1;
  }

  .demo-datetime-picker .block:last-child {
    border-right: none;
  }

  .demo-datetime-picker .demonstration {
    display: block;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 20px;
  }

  .formTable1 {
    background-color: #fff;
    padding: 20px;
  }

  .formTable2 {
    background-color: #fff;
    padding: 20px;

    .el-row {
      border-bottom: 1px solid #e6e6e6;
    }
  }

  .el-form-item__label {
    width: 100px;
    text-align: right;
    line-height: 32px;
  }

  .el-form-item {
    margin-bottom: 30px;
  }

  .el-row {
    margin-bottom: 20px;
  }

}
</style>