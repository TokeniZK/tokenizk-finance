export interface SignMessageArgs {
  message: string;
}

export interface ProviderSignature {
  field: string;
  scalar: string;
}

export interface SignedData {
  publicKey: string;
  data: string;
  signature: ProviderSignature;
}

export interface MinaSignerProvider {
  signMessage(args: SignMessageArgs): Promise<SignedData>;
}

export interface SendTransactionArgs {
  readonly transaction: any;
  readonly feePayer?: {
    readonly fee?: bigInt;
    readonly memo?: string;
  };
}

export type SendTransactionResult = {
  hash: string;
};

export interface MinaProvider extends MinaSignerProvider {
  sendTransaction(args: SendTransactionArgs): Promise<SendTransactionResult>;
}
