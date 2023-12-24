
import {
    isReady,
    method,
    Mina,
    AccountUpdate,
    PrivateKey,
    SmartContract,
    PublicKey,
    UInt64,
    Int64,
    Experimental,
    Permissions,
    DeployArgs,
    VerificationKey,
    TokenId,
    state,
    State,
    Field,
    Bool,
    Provable,
    UInt32,
} from 'o1js';

export class SimpleA extends SmartContract {
    @state(UInt64) totalSupply = State<UInt64>();
    @method setTotalSupply(totalSupply: UInt64) {
        totalSupply.assertGreaterThan(UInt64.from(0));

        this.totalSupply.getAndRequireEquals();
        this.totalSupply.set(totalSupply);
    }
}

export class Escrow extends SmartContract {
    @method
    createSimpleA(simpleAaddr: PublicKey, simpleAVk: VerificationKey, totalSupply: Field) {
        totalSupply.assertGreaterThan(Field(0));

        let zkapp = AccountUpdate.createSigned(simpleAaddr);
        zkapp.account.isNew.requireEquals(Bool(true));
        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });
        zkapp.account.verificationKey.set(simpleAVk);
        AccountUpdate.setValue(zkapp.body.update.appState[0], totalSupply);//totalSupply
    
        const feePayer = AccountUpdate.createSigned(this.sender);
        const feeReceiverAU = AccountUpdate.create(this.address);// CAN WORK
        //const feeReceiverAU = AccountUpdate.create(thirdpartyFeeReciverAddress);// !!! can NOT work!!!
        feePayer.send({ to: feeReceiverAU, amount: UInt64.from(totalSupply) });

    }
}

let Local = Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

let feePayerKey = Local.testAccounts[0].privateKey;
let feePayer = feePayerKey.toPublicKey();

const escrowZkAppKey = PrivateKey.random();
const escrowZkAppAddress = escrowZkAppKey.toPublicKey();
console.log('escrowZkAppKey: ', escrowZkAppKey.toBase58());
console.log('escrowZkAppAddress: ', escrowZkAppAddress.toBase58());


const simpleAZkAppKey = PrivateKey.random();
const simpleAZkAppAddress = simpleAZkAppKey.toPublicKey();
console.log('simpleAZkAppKey: ', simpleAZkAppKey.toBase58());
console.log('simpleAZkAppAddress: ', simpleAZkAppAddress.toBase58());

const thirdpartyFeeReciverKey = PrivateKey.random();
const thirdpartyFeeReciverAddress = thirdpartyFeeReciverKey.toPublicKey();
console.log('thirdpartyFeeReciverKey: ', thirdpartyFeeReciverKey.toBase58());
console.log('thirdpartyFeeReciverAddress: ', thirdpartyFeeReciverAddress.toBase58());


console.log('-------------------------------------------');

const simpleAVk = (await SimpleA.compile()).verificationKey;
const simpleASample = new SimpleA(simpleAZkAppAddress);

console.time('compile (Escrow)');
await Escrow.compile();
console.timeEnd('compile (Escrow)');

const escrow = new Escrow(escrowZkAppAddress);
let tx = await Local.transaction(feePayer, () => {
    AccountUpdate.fundNewAccount(feePayer);
    escrow.deploy();
});
tx.sign([feePayerKey, escrowZkAppKey]);
await tx.send();

console.log('escrow.createSimpleA(feePayer)...');
tx = await Local.transaction(feePayer, () => {
    AccountUpdate.fundNewAccount(feePayer);
    escrow.createSimpleA(simpleAZkAppAddress, simpleAVk, Field(10));
});
await tx.prove();
tx.sign([feePayerKey, simpleAZkAppKey]);

console.log(tx.toPretty());

await tx.send();
console.log('escrow.createSimpleA(feePayer) ended.');


console.log('SimpleA.setTotalSupply...');
tx = await Local.transaction(feePayer, () => {
    simpleASample.setTotalSupply(UInt64.from(11));
});
await tx.prove();
tx.sign([feePayerKey]);

console.log(tx.toPretty());

await tx.send();
console.log('SimpleA.setTotalSupply ended.');
