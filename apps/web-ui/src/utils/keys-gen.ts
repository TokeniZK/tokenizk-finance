import { Signature, Field, Scalar, PrivateKey, Encoding } from "o1js";
import { genNewKeyPairBySignature } from "./keys_helper";

export const generateTokenKey = async (accountIndex?: number) => {
    const signMessage = import.meta.env.VITE_TOKEN_KEY_SIGNING_DATA;
    const signResult = await window.mina.signMessage({
        message: signMessage,
    })
    console.log('sign result: ', signResult);
    return genNewKeyPairBySignature(Signature.fromObject({
        r: Field(signResult.signature.field),
        s: Scalar.fromJSON(signResult.signature.scalar),
    }), accountIndex);
}

export const generateLaunchContractKey = async (tokenKey: PrivateKey, signData: string, accountIndex?: number) => {
    const sign = Signature.create(
        tokenKey,
        Encoding.Bijective.Fp.fromString(signData)
    );
    console.log("sign: ", sign.toJSON());

    return genNewKeyPairBySignature(sign, accountIndex);

}
