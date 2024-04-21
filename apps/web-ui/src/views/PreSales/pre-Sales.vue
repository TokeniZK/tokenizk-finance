<script lang="ts" setup>
import { ref, onMounted, computed, onUpdated } from 'vue'
import { useStatusStore, type AppState } from "@/stores"
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import type { TabsPaneContext } from 'element-plus'

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

    if (to.path == '/sales') {
        isASelected.value = true;
        isBSelected.value = false;
    } else if (to.path == '/sales/my-contributions') {
        isASelected.value = false;
        isBSelected.value = true;
    }
});
const allSaleUrl = computed(() => '/sales?saleType=' + saleType.value);
const myContriUrl = computed(() => '/sales/my-contributions?saleType=' + saleType.value);

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

const activeTabName = ref('0')

const handleClick = (tab: TabsPaneContext, event: Event) => {
    if (tab.props.name == '1') {
        if (appState.connectedWallet58 == '' || appState.connectedWallet58 == null) {
            checkConnectedWallet()
        }
    }
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
                <el-col span="24">

                    <el-tabs v-model="activeTabName" class="custom-tabs" @tab-click="handleClick">

                        <el-tab-pane :label=SecondaryRoutingTitle name="0">
                            <template>
                                <router-link :to="allSaleUrl">{{ SecondaryRoutingTitle }} </router-link>Add Tabs tab
                            </template>
                        </el-tab-pane>

                        <el-tab-pane label="My Contributions" name="1">
                            <template>
                                <router-link :to="myContriUrl"
                                    v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">
                                </router-link>

                                <div v-else @click="checkConnectedWallet">
                                    My Contributions
                                </div>
                            </template>
                        </el-tab-pane>

                    </el-tabs>

                </el-col>
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

    .custom-tabs {
        width: 100%;

        .el-tabs__item {
            flex: none;
            min-width: auto;
            font-weight: bold;
            color: #333;
            border-radius: 10px 10px 0 0;
            background-color: #f5f7fa;
            transition: background-color 0.3s;
        }
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
