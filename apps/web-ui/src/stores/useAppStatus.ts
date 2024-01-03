
import { toRefs, reactive } from 'vue'
import { defineStore } from 'pinia'

export type AppState = {
    minaNetwork: string;
    explorerUrl: string;

    tokeniZkFactoryAddress: string;
    tokeniZkPresaleAddress: string;
    tokeniZkFairsaleAddress: string;
    tokeniZkPrivatesaleAddress: string; 

    connectedWallet58: string | null;
    saleAddress: string | null;

    sdkExist: boolean;
    syncerStarted: boolean;
    apiExist: boolean;

    tokenizkFactoryCompiled: boolean,
    tokenizkBasicTokenCompiled: boolean,
    saleRollupProverCompiled: boolean,
    tokenizkPresaleCompiled: boolean,
    tokenizkFairsaleCompiled: boolean,
    tokenizkPrivatesaleCompiled: boolean,
    mask: {
        id: string | undefined;
        show: boolean;
        closable: boolean;
        showLoading: boolean;
        loadingText: string | undefined;
    };
};

export const useStatusStore = defineStore('appStatus', () => {

    const appState = reactive<AppState>(
        {
            minaNetwork: "Berkeley",
            explorerUrl: "https://minascan.io/berkeley/zk-tx/",
            tokeniZkFactoryAddress: import.meta.env.VITE_TOKENIZK_FACTORY_ADDR,
            tokeniZkPresaleAddress: import.meta.env.VITE_TOKENIZK_PRESALE_ADDR,
            tokeniZkFairsaleAddress: import.meta.env.VITE_TOKENIZK_FAIRSALE_ADDR,
            tokeniZkPrivatesaleAddress: import.meta.env.VITE_TOKENIZK_PRIVATESALE_ADDR,
            sdkExist: false,
            syncerStarted: false,
            apiExist: false,
            connectedWallet58: null,
            saleAddress: null,
            tokenizkFactoryCompiled: false,
            tokenizkBasicTokenCompiled: false,
            saleRollupProverCompiled: false,
            tokenizkPresaleCompiled: false,
            tokenizkFairsaleCompiled: false,
            tokenizkPrivatesaleCompiled: false,
            mask: {
                id: "appInit",
                show: false,
                closable: false, // Users can close by clicking
                showLoading: false,
                loadingText: "App Initializing...",
            },
        }
    )

    const setMinaNetwork = (network: string) => {
        appState.minaNetwork = network;
    };
    const setConnectedWallet = (address58: string | null) => {
        appState.connectedWallet58 = address58;
    };
    const setStartCompileTokenizkFactory = (start: boolean) => {
        appState.tokenizkFactoryCompiled = start;
    };
    const setStartCompileTokenizkBasicToken = (start: boolean) => {
        appState.tokenizkBasicTokenCompiled = start;
    };
    const setStartCompileSaleRollupProver = (start: boolean) => {
        appState.saleRollupProverCompiled = start;
    };
    const setStartCompileTokenizkPresale = (start: boolean) => {
        appState.tokenizkPresaleCompiled = start;
    };
    const setStartCompileTokenizkFairsale = (start: boolean) => {
        appState.tokenizkFairsaleCompiled = start;
    };
    const setStartCompileTokenizkPrivatesale = (start: boolean) => {
        appState.tokenizkPrivatesaleCompiled = start;
    };
    const showLoadingMask = ({
        text,
        id,
        closable,
    }: {
        text?: string;
        id?: string;
        closable?: boolean;
    }) => {
        if (!id) {
            id = "mask";
        }
        if (closable === undefined) {
            closable = true;
        }
        appState.mask = {
            id,
            show: true,
            closable,
            showLoading: true,
            loadingText: text,
        };
    };

    const closeLoadingMask = (id = "mask") => {
        if (appState.mask.id === id) {
            appState.mask = {
                id: undefined,
                show: false,
                closable: true,
                showLoading: false,
                loadingText: undefined,
            };
        }
    };

    return {
        appState,
        setMinaNetwork,
        setConnectedWallet,
        setStartCompileTokenizkFactory,
        setStartCompileTokenizkBasicToken,
        setStartCompileSaleRollupProver,
        setStartCompileTokenizkPresale,
        setStartCompileTokenizkFairsale,
        setStartCompileTokenizkPrivatesale,
        showLoadingMask,
        closeLoadingMask
    }
})

