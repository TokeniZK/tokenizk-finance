
import { toRefs, reactive } from 'vue'
import { defineStore } from 'pinia'

export type AppState = {
    minaNetwork: string;
    explorerUrl: string;

    connectedWallet58: string | null;

    tokeniZkFactoryAddress: string;
    tokeniZkBasicTokenKeyPair: { key: string, value: string } | null;
    tokeniZkPreSaleKeyPairs: { key: string, value: string }[] | null;
    tokeniZkFairSaleKeyPairs: { key: string, value: string }[] | null;
    tokeniZkPrivateSaleKeyPairs: { key: string, value: string }[] | null;
    tokeniZkAirdropKeyPairs: { key: string, value: string }[] | null;

    fetchLatestBlockInfoTimestamp: number;
    latestBlockInfo: { blockchainLength: number };

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
        loadingLink: string | undefined;
    };
};

export const useStatusStore = defineStore('appStatus', () => {

    const appState = reactive<AppState>(
        {
            minaNetwork: '',
            explorerUrl: '',
            tokeniZkFactoryAddress: '',
            tokeniZkBasicTokenKeyPair: {} as { key: string, value: string },
            tokeniZkPreSaleKeyPairs: [],
            tokeniZkFairSaleKeyPairs: [],
            tokeniZkPrivateSaleKeyPairs: [],
            tokeniZkAirdropKeyPairs: [],

            fetchLatestBlockInfoTimestamp: 0,
            latestBlockInfo: { blockchainLength: 0 },

            connectedWallet58: null,
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
                loadingLink: undefined
            },
        }
    )

    const setMinaNetwork = (network: string) => {
        appState.minaNetwork = network;
    };
    const setConnectedWallet = (address58: string | null) => {
        appState.connectedWallet58 = address58;
        if (!address58) {
            appState.tokeniZkBasicTokenKeyPair = {} as { key: string, value: string };
            appState.tokeniZkPreSaleKeyPairs = [];
            appState.tokeniZkFairSaleKeyPairs = [];
            appState.tokeniZkPrivateSaleKeyPairs = [];
            appState.tokeniZkAirdropKeyPairs = [];

        }
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
        link,
        id,
        closable,
    }: {
        text?: string;
        link?: string;
        id?: string;
        closable?: boolean;
    }) => {
        if (!id) {
            id = "mask";
        }
        if (closable === undefined) {
            closable = false;
        }
        appState.mask = {
            id,
            show: true,
            closable,
            showLoading: true,
            loadingText: text,
            loadingLink: link,
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
                loadingLink: undefined
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

