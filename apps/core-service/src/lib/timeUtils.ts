
export function getDateString() {
    const date = new Date();
    const YY = date.getFullYear() + '';
    const MM =
        (date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1) + '';
    const DD = date.getDate() < 10 ? "0" + date.getDate() : date.getDate() + '-';
    const hh = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + '';
    const mm = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + '';
    const ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return YY + MM + DD + hh + mm + ss;
}
