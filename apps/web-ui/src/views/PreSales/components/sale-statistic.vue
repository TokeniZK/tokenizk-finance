<script lang="ts" setup>
import * as echarts from 'echarts/core';
import {
    BarChart,
    LineChart,
    PieChart
} from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent
} from 'echarts/components';

import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type {
    BarSeriesOption,
    LineSeriesOption,
    PieSeriesOption
} from 'echarts/charts';
import type {
    TitleComponentOption,
    TooltipComponentOption,
    GridComponentOption,
    DatasetComponentOption,
} from 'echarts/components';
import type {
    ComposeOption,
} from 'echarts/core';
import { onMounted } from 'vue';

type ECOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | PieSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
>;

echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    BarChart,
    LineChart,
    PieChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    LegendComponent
]);

const props = defineProps<{
    dataArr: { value: number, name: string }[]
}>();

const option: ECOption = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        top: '5%',
        left: 'center'
    },
    series: [
        {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 17,
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: props.dataArr
        }
    ]
};

onMounted(() => {
    let myChart = echarts.init(document.getElementById('sale-statistic'));
    myChart.setOption(option);
})

</script>

<template>
    <h2 style="padding-left: 5px;">Token Metrics</h2>
    <div class="e-chart-btn">
        <el-button size="small" round class="Echart-btn1">distributed tokens</el-button>
        <el-button size="small" round class="Echart-btn2">rest tokens</el-button>
    </div>
    <div id="sale-statistic">

    </div>
</template>

<style scoped lang="less">
.e-chart-btn {
    width: 600px;
    padding-left: 5px;

    .Echart-btn1 {
        color: #fff;
        background-color: #5470C6;
    }

    .Echart-btn2 {
        color: #fff;
        background-color: #91CC75;
    }
}

#sale-statistic {
    width: 600px;
    height: 400px;
    margin: 0 auto;
}
</style>
