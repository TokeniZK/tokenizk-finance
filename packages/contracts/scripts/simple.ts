
import {
    State,
    state,
    UInt64,
    SmartContract,
    method,
    PublicKey,
    Permissions,
    Field,
    Struct,
    UInt32,
    Poseidon,
    TokenId,
    Provable,
    Experimental,
    AccountUpdate,
    Bool,
    VerificationKey,
    PrivateKey,
    fetchAccount,
    Mina,
    fetchLastBlock
} from 'o1js';
import { INDEX_TREE_INIT_ROOT_8, getTestContext } from '../src';

// ================
const ctx = getTestContext();
await ctx.initMinaNetwork();
// ================
const lastBlock = await fetchLastBlock();

console.log(`lastBlock: ${JSON.stringify(lastBlock)}`);


// let feePayerKey = Local.testAccounts[0].privateKey;
let feePayerKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKEDgneTyC6VimEUWF4jrreDaR4ntSvJdjw6ckfDQCtMG5aJtMGP') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), ''));
let feePayer = feePayerKey.toPublicKey();

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: feePayer });
}

let tokenZkAppKey = PrivateKey.random() //PrivateKey.fromBase58('EKFTrkQTUwfnzvC27Gp9zxJhHqSZ4h7oFJuj2ckB6GQnMxS9vZyF') // Local.testAccounts[1].privateKey;
let tokenZkAppAddress = tokenZkAppKey.toPublicKey();
let tokenId = TokenId.derive(tokenZkAppAddress);

let tokenHolderZkAppKey = PrivateKey.random();// (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //feePayerKey //Local.testAccounts[2].privateKey;
let tokenHolderZkAppAddress = tokenHolderZkAppKey.toPublicKey();

let opZkAppKey = PrivateKey.random(); //Local.testAccounts[3].privateKey;
let opZkAppAddress = opZkAppKey.toPublicKey();

class TokenHolder extends SmartContract {
    @state(Field)
    public holdParam = State<Field>();

    @method
    setParam(paramA: Field) {
        this.holdParam.getAndRequireEquals();

        this.holdParam.set(paramA);
    }
}

class TokenContract extends SmartContract {
    deployZkApp() {
        super.deploy();

        this.account.permissions.set({
            ...Permissions.default(),
            // editState: Permissions.signature(),// !!
            // access: Permissions.proofOrSignature(),
        });
    }

    @method
    deplayTokenHolder(addressA: PublicKey, verificationKey: VerificationKey) {
        let tokenId = this.token.id;
        const zkapp = Experimental.createChildAccountUpdate(
            this.self,
            addressA,
            tokenId
        );
        zkapp.account.isNew.assertEquals(Bool(true));

        AccountUpdate.setValue(zkapp.body.update.appState[0], INDEX_TREE_INIT_ROOT_8);//nullifierRoot
        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proofOrSignature()
        });
        zkapp.account.verificationKey.set(verificationKey);
        zkapp.requireSignature();
    }

    @method
    deplayTokenHolderWithoutTokenId(addressA: PublicKey, verificationKey: VerificationKey) {

        let zkapp = AccountUpdate.createSigned(addressA);
        zkapp.account.isNew.assertEquals(Bool(true));

        AccountUpdate.setValue(zkapp.body.update.appState[0], INDEX_TREE_INIT_ROOT_8);//nullifierRoot
        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proofOrSignature()
        });
        zkapp.account.verificationKey.set(verificationKey);
        zkapp.requireSignature();
    }
}

class Operator extends SmartContract {

    deployZkApp() {
        super.deploy();

        this.account.permissions.set({
            ...Permissions.default(),
            // editState: Permissions.signature(),// !!
            // access: Permissions.proofOrSignature(),
        });
    }

    
    @method
    operateTokenHolderWithoutTokenId(addressA: PublicKey, paramA: Field) {
        const tokenHolder = new TokenHolder(addressA);
        tokenHolder.setParam(paramA);
    }

    @method
    operateTokenHolder(addressA: PublicKey, paramA: Field) {
        const tokenHolder = new TokenHolder(addressA, tokenId);
        tokenHolder.setParam(paramA);
    }
}

await TokenContract.compile();
const TokenContractVk = (await TokenHolder.compile()).verificationKey;
await Operator.compile();

console.log('============= deploy TokeniZkFactory =============');
let tokenZkApp = new TokenContract(tokenZkAppAddress);
let tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy TokenContract',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenZkApp.deployZkApp();
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [tokenZkAppKey],
    logLabel: 'deploy TokenContract',
});

console.log('============= deploy Operator =============');
let opZKapp = new Operator(opZkAppAddress);
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy Operator',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        opZKapp.deployZkApp();
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [opZkAppKey],
    logLabel: 'deploy Operator',
});



console.log('============= deploy TokenHolder with TokenId =============');
if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: tokenZkAppAddress });
}
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy TokenHolder',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenZkApp.deplayTokenHolder(tokenHolderZkAppAddress, TokenContractVk);
    }
);

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [tokenHolderZkAppKey, tokenZkAppKey],
    logLabel: 'deploy TokenHolder',
});


console.log('============= set Param (with TokenId)=============');
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'set Param',
    },
    () => {
        opZKapp.operateTokenHolder(tokenHolderZkAppAddress, Field(3));
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    logLabel: 'set Param',
});


console.log('============= deploy TokenHolder withOUT TokenId =============');
if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: tokenZkAppAddress });
}
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy TokenHolder',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenZkApp.deplayTokenHolderWithoutTokenId(tokenHolderZkAppAddress, TokenContractVk);
    }
);

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [tokenHolderZkAppKey, tokenZkAppKey],
    logLabel: 'deploy TokenHolder',
});


console.log('============= set Param (withOUT TokenId)=============');
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'set Param',
    },
    () => {
        opZKapp.operateTokenHolderWithoutTokenId(tokenHolderZkAppAddress, Field(4));
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    logLabel: 'set Param',
});

