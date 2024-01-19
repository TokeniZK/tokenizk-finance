export { $httpInstance } from "./http";

export const omitAddress = (
    address: string | null | undefined,
    cutLength: number = 5,
) => {
    if (address === null || address === undefined) {
        return null;
    }
    const length = address.length;
    return (
        address.substring(0, cutLength) +
        "..." +
        address.substring(length - cutLength, length)
    );
};

function formatDateTime(date: Date) {
    var year = date.getFullYear(); // 获取年份
    var month = (date.getMonth() + 1).toString().padStart(2, '0'); // 获取月份，需要考虑到月份从0开始计算
    var day = date.getDate().toString().padStart(2, '0'); // 获取日期
    var hours = date.getHours().toString().padStart(2, '0'); // 获取小时
    var minutes = date.getMinutes().toString().padStart(2, '0'); // 获取分钟
    var seconds = date.getSeconds().toString().padStart(2, '0'); // 获取秒钟

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 返回自定义格式的日期和时间字符串
}