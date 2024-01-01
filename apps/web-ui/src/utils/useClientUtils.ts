// Client only, only used in the browser, only can be imported and called in onMounted method

export type SupportStatus =
    | "supported"
    | "ios-unsupported"
    | "android-unsupported"
    | "firefox-private-unsupported";

export default function () {
    const isIOS = () =>
        [
            "iPad Simulator",
            "iPhone Simulator",
            "iPod Simulator",
            "iPad",
            "iPhone",
            "iPod",
        ].includes(navigator.platform) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document);

    const isAndroid = () =>
        navigator.userAgent.toLowerCase().includes("android");

    const isFirefox = () => navigator.userAgent.includes("Firefox");

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const hasIndexedDbSupport = () =>
        new Promise((resolve) => {
            const db = indexedDB.open("test");
            db.onerror = () => resolve(false);
            db.onsuccess = () => resolve(true);
        });

    const mobileEnabled = true;

    const getSupportStatus = async (): Promise<SupportStatus> => {
        if (!mobileEnabled) {
            if (isIOS()) return "ios-unsupported";
            if (isAndroid()) return "android-unsupported";
        }
        if (isFirefox()) {
            if (!(await hasIndexedDbSupport()))
                return "firefox-private-unsupported";
        }
        return "supported";
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return {
        isIOS,
        isAndroid,
        isFirefox,
        isSafari,
        hasIndexedDbSupport,
        mobileEnabled,
        getSupportStatus,
        copyText,
    };
}
