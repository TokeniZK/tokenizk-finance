# TokeniZK Finance              
           
TokeniZK Finance is a decentralized launchpad where you could launch your own zk-Token and create your own initial token sale. It provides secure smart contract templates with flexible configuration and complete tool suits for token management, where you could finish all operations simply in several clicks, without knowledge requirement about code & zkp.

<div align="center">
<img align='center' src="./docs/img/tokenizk-brand2.png" height="60%" width="60%">
</div>
​									Official: https://tokenizk.finance

​									Proposal: https://zkignite.minaprotocol.com/zkignite/zkapp-track-cohort-2/funding/suggestion/516
 
NOTE: yet under development currently, cannot be used on production.

## Description

ERC-style Tokens have greatly contributed to the prosperity of the Ethereum ecosystem by providing a flexible, and standardized way to create new custom digital assets, then facilitating application development, improving liquidity, and interoperability.

According to statistics, there are an significant number of users and teams who want to issue their own tokens.However, issuing a secure and fully-custom token is difficult for people without enough knowledge on programming and cryptography tech.This pain point motivates the birth of many popular online tools/platforms, such as Pinksale,Dxsale,etc, providing convinient flow for people to create or sell, auto list on dex custom tokens, which booms the onchain ecosystem.

Samely, Custom Token on Mina matters much to the ecosystem.Specially,Custom Token is designed as an underlying native property on Mina chain, which hold similar capabilities as ERC-style fungible token and natively works with Zero Knowledge Proof, further meaning it could be more easily used within privacy-preserving scenarios.

However,the developing/interacting pattern of Mina’s natively supporting custom token performs distinguishingly differently with ERC-style Fungible Token. Like the fine distinction of token account and regular user account. Like,why transfer/burn operations on custom token require proof authorization or even  token owner’s signature authorization. 

Like,We need to develop &deploy a smart contract mannually and make the calculation offchain and verification onchain. Like,The limited onchain storage of token account makes many usages like Airdrop/Vote,etc much dependent on offchain storage,further meaning we also need to solve the issue of data race condition. Like we need to make code audit on smart contract(circuits)... You can see, issuing a custom token requires developers with much knowledge on not only the mechanism of underlying Mina chain but also complicated zero knowledge proof. Apparently this also must be an more enormous challenge for the common users.

Therefore, A suite of tools is necessary to help the common users create their own tokens in a fast, simple and cheap way, with no prior knowledge on code and zkp required and 100% decentralized.

With good reference of existing professional tools and platfroms such Pinksale and DxSale，we team expects to carry out the first launchpad platform focusing on ZK-Token, which we think makes a lot of sense for the popularity of Mina custom tokens as well as future onchain ecosystem prosperity. Our product is named as **TokeniZK Finance**, on which you can easily tokenize your idea with zkp and distribute them to fans.

TokeniZK provides users with secure smart contract templates with flexible configuration on custom parameters as well as complete tool suits for token deployment&management, on which you could complete any zkToken operations easily in several steps.

Please go to [doc](./docs/TokeniZK-Finance-proposal516-zkapp-track.md) for more details.

## Quick start

```bash

git clone https://github.com/TokeniZK/tokenizk-finance.git

cd tokenizk-network

npm install

npm run`coreService:dev`

npm run`apiGateway:dev`

npm run`proofGen:dev`

npm run`chainTracker:dev`

npm run`webUI:dev`

```

## Top-Level Scripts

- `webUI:dev`: run front-end api-gateway with hot reload
- `coreService:dev`: run back-end-coreService api-gateway with hot reload
- `apiGateway:dev`: run back-end-apiGateway api-gateway with hot reload
- `proofGen:dev`: run back-end-proofGen api-gateway with hot reload
- `chainTracker:dev`: run back-end-chainTracker api-gateway with hot reload
- `libs:build` - build packages in `libs` folder
- `build` - build all packages
- `clean` - clean all packages
- `lint` - lint all packages

## License

MIT
