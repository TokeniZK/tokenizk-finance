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
    series: [
        {
            type: 'pie',
            data: props.dataArr
        }
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    let myChart = echarts.init(document.getElementById('sale-statistic'));
    myChart.setOption(option);
});

</script>
<template>
    <div id="sale-statistic">

    </div>
</template>
