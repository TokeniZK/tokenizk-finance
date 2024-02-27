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
    TransformComponent
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
    CanvasRenderer
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
                    fontSize: 20,
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
    let myChart = echarts.init(document.getElementById('airdrop-statistic'));
    myChart.setOption(option);
})

</script>

<template>
    <h2 style="padding-left: 5px;">Token Metrics</h2>
    <div id="airdrop-statistic"></div>
</template>


<style scoped>
#airdrop-statistic {
    width: 600px;
    height: 400px;
    margin: 0 auto;
    /* background: #f7f7f7; */
}
</style>
