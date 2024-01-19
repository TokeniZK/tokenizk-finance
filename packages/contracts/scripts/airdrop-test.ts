import {
  Mina,
  AccountUpdate,
  PublicKey,
  UInt64,
  TokenId,
  Field,
  Signature,
  fetchAccount,
  PrivateKey,
  UInt32,
  Int64,
  Provable,
  fetchLastBlock,
} from 'o1js';
import {
  UserLowLeafWitnessData, SaleContributorMembershipWitnessData, UserNullifierMerkleWitness,
  TokeniZkFactory, TokeniZkBasicToken, TokeniZkAirdrop,
  SaleRollupProver, TokeniZkPresale, TokeniZkFairSale, TokeniZkPrivateSale,
  LauchpadPlatformParams, SaleParams, PresaleMinaFundHolder,
  SaleContribution, WhitelistMembershipMerkleWitness, RedeemAccount, AirdropParams
} from "../src";
import { getTestContext } from '../src/test_utils';

import tokenizkFactoryKeypairParams from "../deploy/tokenizk-factory-keypair-params.json" assert { type: 'json'};
import TokeniZkBasicTokenVK from "../deploy/verification-keys/TokeniZkBasicToken-VK.json" assert { type: 'json'};
import TokeniZkPresaleVK from "../deploy/verification-keys/TokeniZkPresale-VK.json" assert { type: 'json'};
import PresaleMinaFundHolderVK from "../deploy/verification-keys/PresaleMinaFundHolder-VK.json" assert { type: 'json'};
import TokeniZkFairSaleVK from "../deploy/verification-keys/TokeniZkFairSale-VK.json" assert { type: 'json'};
import TokeniZkPrivateSaleVK from "../deploy/verification-keys/TokeniZkPrivateSale-VK.json" assert { type: 'json'};
import TokeniZkAirdropVK from "../deploy/verification-keys/TokeniZkAirdrop-VK.json" assert { type: 'json'};
import RedeemAccountVK from "../deploy/verification-keys/RedeemAccount-VK.json" assert { type: 'json'};
// import SaleRollupProverVK from "../deploy/verification-keys/SaleRollupProver-VK.json";

console.log(`xx: ${PrivateKey.fromBase58('EKFVMHCAp8NEJacwvjLFbWfzQyPnXTidR93wnRXjPVunsfw9jX5v').toPublicKey().toBase58()}`);


function globalSlotToTimestamp(slot: UInt32) {
  let { genesisTimestamp, slotTime } =
    Mina.activeInstance.getNetworkConstants();
  return UInt64.from(slot).mul(slotTime).add(genesisTimestamp);
}
function timestampToGlobalSlot(timestamp: UInt64, message: string) {
  let { genesisTimestamp, slotTime } =
    Mina.activeInstance.getNetworkConstants();
  let { quotient: slot, rest } = timestamp
    .sub(genesisTimestamp)
    .divMod(slotTime);
  rest.value.assertEquals(Field(0), message);
  return slot.toUInt32();
}
function timestampToGlobalSlotRange(
  tsLower: UInt64,
  tsUpper: UInt64
): [lower: UInt32, upper: UInt32] {
  // we need `slotLower <= current slot <= slotUpper` to imply `tsLower <= current timestamp <= tsUpper`
  // so we have to make the range smaller -- round up `tsLower` and round down `tsUpper`
  // also, we should clamp to the UInt32 max range [0, 2**32-1]
  let { genesisTimestamp, slotTime } = Mina.activeInstance.getNetworkConstants();
  let tsLowerInt = Int64.from(tsLower)
    .sub(genesisTimestamp)
    .add(slotTime)
    .sub(1);
  let lowerCapped = Provable.if<UInt64>(
    tsLowerInt.isPositive(),
    UInt64,
    tsLowerInt.magnitude,
    UInt64.from(0)
  );
  let slotLower = lowerCapped.div(slotTime).toUInt32Clamped();
  // unsafe `sub` means the error in case tsUpper underflows slot 0 is ugly, but should not be relevant in practice
  let slotUpper = tsUpper.sub(genesisTimestamp).div(slotTime).toUInt32Clamped();
  return [slotLower, slotUpper];
}


Mina.setActiveInstance(
  Mina.Network({
    mina: 'https://berkeley.minascan.io/graphql',//'https://proxy.testworld.minaexplorer.com', //,
    archive: 'https://archive-node-api.p42.xyz/'
  }));

await fetchLastBlock();
console.log('===================================');

console.log('current network state: ', JSON.stringify(Mina.activeInstance.getNetworkState()));
console.log();
const globalSlotSinceGenesis = Mina.activeInstance.getNetworkState().globalSlotSinceGenesis;
console.log(`globalSlotSinceGenesis: ${globalSlotSinceGenesis}`);

let { genesisTimestamp, slotTime } = Mina.activeInstance.getNetworkConstants();
console.log('genesisTimestamp: ' + genesisTimestamp + ' ,  slotTime: ' + slotTime);
const current = UInt64.from(new Date().getTime());
console.log(`current: ${current}`);

const calcTs = genesisTimestamp.add(slotTime.mul(Number(globalSlotSinceGenesis.toString())));
console.log(`calculated TimeStamp: ${calcTs}`);
console.log('===================================');








let [slotLower, slotUpper] = timestampToGlobalSlotRange(UInt64.from(1704915808806), UInt64.MAXINT());
console.log('slotLower: ' + slotLower + ' ,  slotUpper: ' + slotUpper);


// set factory address
TokeniZkFactory.tokeniZkFactoryAddress = PublicKey.fromBase58(tokenizkFactoryKeypairParams.value);
// init vk
TokeniZkFactory.basicTokenVk = { data: TokeniZkBasicTokenVK.data, hash: Field(TokeniZkBasicTokenVK.hash) };
TokeniZkFactory.presaleContractVk = { data: TokeniZkPresaleVK.data, hash: Field(TokeniZkPresaleVK.hash) };
TokeniZkFactory.presaleMinaFundHolderVk = { data: PresaleMinaFundHolderVK.data, hash: Field(PresaleMinaFundHolderVK.hash) };
TokeniZkFactory.fairSaleContractVk = { data: TokeniZkFairSaleVK.data, hash: Field(TokeniZkFairSaleVK.hash) };
TokeniZkFactory.privateSaleContractVk = { data: TokeniZkPrivateSaleVK.data, hash: Field(TokeniZkPrivateSaleVK.hash) };
TokeniZkFactory.redeemAccountVk = { data: RedeemAccountVK.data, hash: Field(RedeemAccountVK.hash) };
TokeniZkFactory.airdropVk = { data: TokeniZkAirdropVK.data, hash: Field(TokeniZkAirdropVK.hash) };


console.time('compile (TokeniZkFactory)');
await TokeniZkFactory.compile();
console.timeEnd('compile (TokeniZkFactory)');


console.time('compile (TokeniZkBasicToken)');
let tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;

console.timeEnd('compile (TokeniZkBasicToken)');
console.log('TokeniZkFactory.basicTokenVk: ' + TokeniZkFactory.basicTokenVk.hash);

console.time('compile (TokeniZkAirdrop)');
let tokeniZkAirdropVK = (await TokeniZkAirdrop.compile()).verificationKey;
TokeniZkFactory.airdropVk = tokeniZkAirdropVK;
console.timeEnd('compile (TokeniZkAirdrop)');

console.time('compile (RedeemAccount)');
let redeemAccountVk = (await RedeemAccount.compile()).verificationKey;
TokeniZkFactory.redeemAccountVk = redeemAccountVk;
console.timeEnd('compile (RedeemAccount)');


const allParams = JSON.parse('{"airdropAddress0":"B62qnAkApCzX739uofjLY29QTQ6L1FVz1qt7t9UYEvGBAjGaNvMhAMJ","airdropParams0":{"tokenAddress":"B62qofVRDYoQdXwRxYvTafMqtsFMntr2raT45cWqZmQ1z4Vh3etmqKh","totalAirdropSupply":120,"totalMembersNumber":7,"whitelistTreeRoot":"26814643383362656451488725013213965119744384458310246694498527341584325975085","startTime":32805,"endTime":1704978551749,"cliffTime":1,"cliffAmountRate":10,"vestingPeriod":1,"vestingIncrement":10},"membershipMerkleWitness0":["0","11533066476745785384239626592529858549435633605277111037160697650326290029959","18071124383198404849427376507224950070433564157317643685781580361538541758683","544619463418997333856881110951498501703454628897449993518845662251180546746","20468198949394563802460512965219839480612000520504690501918527632215047268421","16556836945641263257329399459944072214107361158323688202689648863681494824075","15433636137932294330522564897643259724602670702144398296133714241278885195605","14472842460125086645444909368571209079194991627904749620726822601198914470820"],"leafIndex0":"6","lowLeafWitness0":{"index":"0","leafData":{"nextIndex":"0","nextValue":"0","value":"0"},"siblingPath":["0","21565680844461314807147611702860246336805372493508489110556896454939225549736","2447983280988565496525732146838829227220882878955914181821218085513143393976","544619463418997333856881110951498501703454628897449993518845662251180546746","20468198949394563802460512965219839480612000520504690501918527632215047268421","16556836945641263257329399459944072214107361158323688202689648863681494824075","15433636137932294330522564897643259724602670702144398296133714241278885195605","14472842460125086645444909368571209079194991627904749620726822601198914470820"]},"oldNullWitness0":["114352132400936979548660539987778294297031033839821692348854339100018767632","21565680844461314807147611702860246336805372493508489110556896454939225549736","2447983280988565496525732146838829227220882878955914181821218085513143393976","544619463418997333856881110951498501703454628897449993518845662251180546746","20468198949394563802460512965219839480612000520504690501918527632215047268421","16556836945641263257329399459944072214107361158323688202689648863681494824075","15433636137932294330522564897643259724602670702144398296133714241278885195605","14472842460125086645444909368571209079194991627904749620726822601198914470820"],"feePayerAddress":"B62qmxbQ49sbCGirqVYzhtwnJA7D3nbZ8nnWZrCNEDymS6axCzUwsXr","txFee":210000000}');

const airdropAddress0 = allParams.airdropAddress0;

const airdropParams0 = allParams.airdropParams0;
const membershipMerkleWitness0: string[] = allParams.membershipMerkleWitness0;
const leafIndex0 = allParams.leafIndex0;
const lowLeafWitness0 = allParams.lowLeafWitness0;
const oldNullWitness0: string[] = allParams.oldNullWitness0;

const feePayerAddress = allParams.feePayerAddress;
const txFee = allParams.txFee;


const basicTokenZkAppAddress = PublicKey.fromBase58(airdropParams0.tokenAddress);
const airdropAddress = PublicKey.fromBase58(airdropAddress0);
const feePayer = PublicKey.fromBase58(feePayerAddress);
const tokenId = TokenId.derive(basicTokenZkAppAddress);

await fetchAccount({ publicKey: feePayer });
await fetchAccount({ publicKey: basicTokenZkAppAddress });
await fetchAccount({ publicKey: airdropAddress, tokenId });

const airdropParams = AirdropParams.fromDto(airdropParams0);
const membershipMerkleWitness = WhitelistMembershipMerkleWitness.fromJSON({ path: membershipMerkleWitness0.map(m => Field(m)) });
const leafIndex = Field(leafIndex0);
const lowLeafWitness = UserLowLeafWitnessData.fromDTO(lowLeafWitness0);
const oldNullWitness = new UserNullifierMerkleWitness(oldNullWitness0.map(o => Field(o)));

const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
const tokeniZkAirdropZkApp = new TokeniZkAirdrop(airdropAddress, tokenId);

const tokenAmount = Math.floor(airdropParams0.totalAirdropSupply / airdropParams0.totalMembersNumber);

const tx = await Mina.transaction(
  {
    sender: feePayer,
    fee: txFee,
    memo: `claimTokens`,
  },
  () => {
    AccountUpdate.fundNewAccount(feePayer);

    tokeniZkAirdropZkApp.claimTokens(airdropParams, membershipMerkleWitness, leafIndex, lowLeafWitness, oldNullWitness);

    tokeniZkBasicTokenZkApp.approveTransferCallbackWithVesting(tokeniZkAirdropZkApp.self, feePayer, UInt64.from(tokenAmount), airdropParams.vestingParams());
  }
);
await tx.prove();
const txJson = tx.toJSON();
console.log('generated tx: ' + txJson);


await tx.sign([PrivateKey.fromBase58('EKEPBWNL4UztaodST5PooNJeopnLS9QPBZmnzKHUNWQLugWqz28d')]).send();