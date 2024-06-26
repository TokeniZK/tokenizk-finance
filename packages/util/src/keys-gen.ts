const keys_helper = import("./keys_helper.js");
const o1js = import('o1js');

export const generateTokenKey = async (accountIndex?: number) => {
    const signMessage = (import.meta as any).env.VITE_TOKEN_KEY_SIGNING_DATA;
    const signResult = await (window as any).mina.signMessage({
        message: signMessage,
    })
    console.log('sign result: ', signResult);
    return (await keys_helper).genNewKeyPairBySignature((await o1js).Signature.fromObject({
        r: (await o1js).Field(signResult.signature.field),
        s: (await o1js).Scalar.fromJSON(signResult.signature.scalar),
    }), accountIndex);
}

export const generateLaunchContractKey = async (tokenKey: any, signData: string, accountIndex?: number) => {
    const sign = (await o1js).Signature.create(
        tokenKey,
        (await o1js).Encoding.Bijective.Fp.fromString(signData)
    );
    console.log("sign: ", sign.toJSON());

    return (await keys_helper).genNewKeyPairBySignature(sign, accountIndex);

}
