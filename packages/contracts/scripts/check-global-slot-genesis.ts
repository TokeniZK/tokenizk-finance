
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
let feePayerKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKEm81DLyU44Gpu4egbX9g1zgrVS7NnGCcbNZYGrKiG4XRQacKRK') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), ''));
let feePayer = feePayerKey.toPublicKey();

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: feePayer });
}

let tokenZkAppKey = PrivateKey.random() //PrivateKey.fromBase58('EKFTrkQTUwfnzvC27Gp9zxJhHqSZ4h7oFJuj2ckB6GQnMxS9vZyF') // Local.testAccounts[1].privateKey;
let tokenZkAppAddress = tokenZkAppKey.toPublicKey();

class TokenContract extends SmartContract {
    /**
     * the hash of configured fairsale parameters
     */
    @state(Field)
    public saleParamsHash = State<Field>();

    deployZkApp() {
        super.deploy();

        this.saleParamsHash.set(Field(0));

        this.account.permissions.set({
            ...Permissions.default(),
        });
    }

    @method
    async setParam(saleParamsHash1: Field, startTimeStamp: UInt64) {
        this.saleParamsHash.getAndRequireEquals().assertNotEquals(saleParamsHash1);

        this.network.timestamp.requireBetween(startTimeStamp, UInt64.MAXINT());

        this.saleParamsHash.set(saleParamsHash1);
    }
}

await TokenContract.compile();

console.log('============= deploy TokeniZkFactory =============');
let tokenZkApp = new TokenContract(tokenZkAppAddress);
let tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy TokenContract',
    },
    async () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenZkApp.deployZkApp();
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [tokenZkAppKey],
    logLabel: 'deploy TokenContract',
});

console.log('============= set Param (withOUT TokenId)=============');
const startTimestamp = UInt64.from(Date.parse('2023-09-13T13:01Z')).add(lastBlock.globalSlotSinceGenesis.add(50).toUInt64().mul(3 * 60 * 1000));
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'set Param',
    },
    async () => {
        tokenZkApp.setParam(Field(1), startTimestamp);
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    logLabel: 'set Param',
});

