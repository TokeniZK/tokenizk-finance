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
