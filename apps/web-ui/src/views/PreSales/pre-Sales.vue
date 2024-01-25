<script lang="ts" setup>
import { ref, onMounted, computed, onUpdated } from 'vue'
import { useStatusStore, type AppState } from "@/stores";
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

let route = useRoute();
let saleType = ref(route.query.saleType as any as number);

const router = useRouter();
router.afterEach(async (to, from, next) => {
    if (from.path == '/sales' && to.path == '/sales') {
        const query = to.query;
        saleType.value = query.saleType as any as number;
        console.log(`changed saleType...`)
    }

    if (from.path == '/sales' && to.path == '/sales/my-contributions') {
        const query = to.query;
        saleType.value = query.saleType as any as number;
        console.log(`changed saleType...`)
    }

    
    if (from.path == '/sales/my-contributions' && to.path == '/sales') {
        const query = to.query;
        saleType.value = query.saleType as any as number;
        console.log(`changed saleType...`)
    }

    if(to.path == '/sales'){
        isASelected.value = true;
        isBSelected.value = false;
    } else if(to.path == '/sales/my-contributions') {
        isASelected.value = false;
        isBSelected.value = true;
    }
});
const allSaleUrl = computed(()=>'/sales?saleType=' + saleType.value);
const myContriUrl = computed(()=>'/sales/my-contributions?saleType=' + saleType.value);

let salePageTitle = computed(() => {
    return `Current ${saleType.value == 0 ? 'PreSale' : (saleType.value == 1 ? 'FairSale' : 'PrivateSale')}`
})

let SecondaryRoutingTitle = computed(() => {
    return `All ${saleType.value == 0 ? 'launchpads' : (saleType.value == 1 ? ' FairSales' : 'PrivateSales')}`
})


let isASelected = ref(true)
let isBSelected = ref(false)

const handleAClick = () => {
    isASelected.value = true;
    isBSelected.value = false;
}

const handleBClick = () => {
    isASelected.value = false;
    isBSelected.value = true;
}


const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const checkConnectedWallet = () => {

    ElMessage({
        showClose: true,
        type: 'warning',
        message: `Please connect wallet first.`,
    });

}


onMounted(() => {

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

})


onUpdated(() => {
    if (appState.connectedWallet58 == '' || appState.connectedWallet58 == null) {
        handleAClick()
    }
})

</script>

<template>
    <el-row class="pre-Sales">
        <el-col :span="24">

            <el-row class="row-bg" justify="center">
                <el-col :span="18">
                    <h1>
                        <!-- Current Presales -->
                        {{ salePageTitle }}

                    </h1>
                </el-col>
            </el-row>

            <el-row style="margin:50px auto;" justify="center">

                <el-col :span="8"></el-col>

                <el-col :span="6">
                    <router-link :to="allSaleUrl" :class="{ 'activeMenu': isASelected }" @click="handleAClick">
                        <!-- All launchpads -->
                        {{ SecondaryRoutingTitle }}
                    </router-link>
                </el-col>

                <el-col :span="6">
                    <router-link :to="myContriUrl" :class="{ 'activeMenu': isBSelected }" @click="handleBClick"
                        v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">My
                        Contributions</router-link>

                    <div v-else @click="checkConnectedWallet">
                        <span>My Contributions</span>
                    </div>
                </el-col>

                <el-col :span="4"></el-col>

            </el-row>

            <!-- 三级路由出口组件 -->
            <el-row class="row-bg" justify="center">
                <el-col :span="24">

                    <router-view />

                </el-col>
            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.pre-Sales {
    width: 100%;
    padding-top: 120px;

    .activeMenu {
        border-bottom: 2px solid #00FFC2;
    }

}

.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
</style>
