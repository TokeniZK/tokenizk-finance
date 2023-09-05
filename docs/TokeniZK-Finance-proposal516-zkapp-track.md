# TokeniZK Finance -- The First Verifiable LaunchPad on Mina, with No-code.

**By Yoga#3374**



## Briefly

TokeniZK Finance is a decentralized launchpad where you could launch your own zk-Token and create your own initial token sale. It provides secure smart contract templates with flexible configuration and complete tool suits for token management, where you could finish all operations simply in several clicks, without knowledge requirement about code & zkp.

![WPS图片(1)-16938547198322](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/2468e3da-853e-4317-bcbd-0b1a8bb94d85)


​									Official: https://tokenizk.finance

​									Proposal: https://zkignite.minaprotocol.com/zkignite/zkapp-track-cohort-2/funding/suggestion/516

 

## **Problem**

ERC-style Tokens have greatly contributed to the prosperity of the Ethereum ecosystem by providing a flexible, and standardized way to create new custom digital assets, then facilitating application development, improving liquidity, and interoperability.

According to [statistics](https://www.pinksale.finance/leaderboard) , there are an significant number of users and teams who want to issue their own tokens.However, issuing a secure and fully-custom token is difficult for people without enough knowledge on programming and cryptography tech.This pain point motivates the birth of many popular online tools/platforms, such as [Pinksale](https://www.pinksale.finance/),[Dxsale](https://dx.app/),etc, providing convinient flow for people to create or sell, auto list on dex custom tokens, which booms the onchain ecosystem.

Samely, Custom Token on Mina matters much to the ecosystem.Specially,Custom Token is designed as an underlying native property on Mina chain, which hold similar capabilities as ERC-style fungible token and natively works with Zero Knowledge Proof, further meaning it could be more easily used within privacy-preserving scenarios.

However,the developing/interacting pattern of Mina’s natively supporting custom token performs distinguishingly differently with ERC-style Fungible Token. Like the fine distinction of token account and regular user account. Like,why transfer/burn operations on custom token require proof authorization or even  token owner’s signature authorization. 

Like,We need to develop &deploy a smart contract mannually and make the calculation offchain and verification onchain. Like,The limited onchain storage of token account makes many usages like Airdrop/Vote,etc much dependent on offchain storage,further meaning we also need to solve the issue of data race condition. Like we need to make code audit on smart contract(circuits)... You can see, issuing a custom token requires developers with much knowledge on not only the mechanism of underlying Mina chain but also complicated zero knowledge proof. Apparently this also must be an more enormous challenge for the common users.

Therefore, A suite of tools is necessary to help the common users create their own tokens in a fast, simple and cheap way, with no prior knowledge on code and zkp required and 100% decentralized.



## **Solution**

With good reference of existing professional tools and platfroms such Pinksale and DxSale，we team expects to carry out the first launchpad platform focusing on ZK-Token,which we think makes a lot of sense for the popularity of Mina custom tokens as well as future onchain ecosystem prosperity. Our product is named as **TokeniZK Finance**, on which you can easily tokenize your idea with zkp and distribute them to fans.

TokeniZK provides users with secure smart contract templates with flexible configuration on custom parameters as well as complete tool suits for token deployment&management, on which you could complete any zkToken operations easily in several steps.

### The below is the Major Functions TokeniZK provides.(More details within User Journey section blow.)

#### **1.** **ZK-Token Creation**

Users could easily create a originally natively basic custom token with given secure smart contract templates.

 

#### **2.** **Presale**

**(1)** **Normal Presale** 

Normal Presale pages work for project team to pre-configure a set of presale rules like sales amount, target currency, softcap/hardcap, minimumBuy/maximumBuy,startTime/endTime, **whitelist, vesting schedule for contributors,** etc. And it also provide entry for contribution.

​		① config the preSales rules & parameters and information on projects and team.

​		② Normal Presale Listing page

​		③ Normal Presale Detail Page

​		④ Normal Presale contribution

Including withdraw contribution if Softcap is not reached

 

**(2)** **Fair Presale**

Fair Presale is a special Normal Presale, where there is no hardcap, and everyone will have the same token price after it ends. It doesn't matter if you buy first or late. Token price = total raised Mina / total tokens for Fair Presale .

​		① configure the preSales rules and information on projects and team.

​		② Fair Presale Listing page

​		③ Fair Presale Detail Page

​		④ Fair Presale contribution

Including withdraw contribution if Softcap is not reached

 

#### **3.** **PrivateSale**

PrivateSale works for project team to make a private sale from specified investors or the public. You could pre-configure it on **sales amount, target currency, softcap/hardcap, minimumBuy/maximumBuy,startTime/endTime, whitelist**, vesting schedule for project team, etc. 

 ​	① investment operations and information on projects and team.

​	 ② PrivateSale Listing page

​ 	③ PrivateSale Detail Page

​	 ④ PrivateSale contribution

Including withdraw contribution if Softcap is not reached

 

#### **4.** Fair Airdrop

Fair Airdrop tool, as each custom token’s exclusive unique **Intermediary role**(will explained below), helps project team to record related contributors and token distribution. 

 ​	① configure the Airdrop

 ​	② claim Token

 

#### **5.** TokenLocker

TokenLocker works as each custom token’s exclusive unique **Intermediary role**(will explained below) for vesting project team and contributors or even the transfer scenario where one user vests another user. A TokenLocker also could be optionally created later after or during the creation of each Presale, Private Sale and Fair Airdrop.

 ​	① configure Vesting Rules

​	 ② claim Token

 

#### **6.** Transfer Token

A tiny web page wallet for users to transfer their tokens.

 

#### **7.** User Participation History Page

Pages for user to quickly review all his participated activities.



#### **8.** **Advanced Airdrop Creation**(At Advanced milestone)

Project teams could make some more fine configurations on airdrop .

 

#### **9.** **zkNFT Pages**(At Advanced milestone)

 Project team could launch a zkNFT sales.

​	(1) configure Rules and register&record project/team details.

​	(2) Projects Listing Page

​	(3) Project Detail Page

​		① NFT purchasing

​		② Claim NFT

 

To directly know more on above functions, You could go to our prototype UI design: [www.tokenizk.finance](http://www.tokenizk.finance) (Note: the UI design is not yet finalized.)





## **Architecture：**

To support the basic features（*listed at Standard Milestones*）above, there are 7 core contract within TokeniZK, as below. 

![WPS图片(1)](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/7eba3f78-d708-47a1-af77-157250d01e1f)


* **TokeniZkBasicToken :** an smart contract template for custom token with the most basic functionalities
* **TokeniZkPresale** : an contract template attached with specified Custom Token for **Normal Presales** and **Fair Presales** (with functions as talked above).
* **TokeniZkPrivateSale** : an smart contract template for PrivateSales (with functions as talked above).
* **TokeniZkAirdrop**:a contract deployed at specified Intermediary Token Account(described below) for Token Airdrop (as talked above).
* **TokeniZkLocker** : a contract deployed at specified Intermediary Token Account(described below) for Token Vesting schedule (as talked above).
* **TokeniZkUser** : a contract deployed at User Token Account for nullified asset mainly(described below).
* **TokeniZkFactory** : The entry of TokeniZK for user to deploy the contracts above, recording the meta data of the platform.




### User Jouney within TokeniZK at High Level

We have designed a UI prototype on the all flows(but not finalized yet), pls go to: [www.tokenizk.finance](http://www.tokenizk.finance) for more details.

#### **Token & Sales Creation Part:**

A user (denoted as Token Creator) entering TokeniZK platform would be guided to complete the flow below: 

1. Connect wallet;

2. create **BasicToken** first;

3. Choose **Normal Presale** or **Fair Presale based on specified BasicToken** , or **PrivateSale Directly.** 

4. Configure all related parameters and sale rules on pages,as well as choosing or not to configure other basic widgets like whitelist, **TokeniZkLocker**,  etc.;

Note: **TokeniZkAirdrop,TokeniZkLocker** could be activated separately later.

5. Invoke related methods on **TokeniZkFactory** to deploy specified smart contract template; 

6. Broadcast the tx with signature and proof.

Note: Token Creatorneed pay for the whole flow(involving platform procedure fee, all token account creation fee, transaction fee, etc.

 

#### **Contribution Part**:

A user enters the sales detail page, and input the contributing amount. Corresponding smartcontract would be invoked (during which all preset sale rules will be checked in circuit). Then tx.prove and trigger the wallet to make a signature and later broadcast it.


### Working Mechanism of TokeniZk SmartContracts

#### How TokeniZkBasicToken works

 Since there is not yet a standard custom token interface like ERC20-Token-Interface currently in Minaecosystem,a common custom token interface is designed within TokeniZK platform, along with animplementation named **TokeniZkBasicToken** , working as a template for user to issue his own customtokens.

 All custom tokens issued by this template can be integrated with other platform contracts likeTokeniZkPresale, TokeniZkPrivateSale, TokeniZkAirdrop, TokeniZKLocker, etc.

 _Tips: More details within 'User Journey Flowcharts' section at proposal link above._



#### How TokeniZkPresale works

 TokeniZkPresale works for two scenarioes: Normal Presale and Fair Presale, which are mainly differently on sales rules & parameters. Fair Presale is a special Normal Presale, where there is no hardcap, and everyone will have the same token price after it ends. It doesn't matter if you buy first or late. Token price = total raised Mina / total tokens for Fair Presale .

 A project team(custom token owner) might launch multi-round presale activities for its issuing custom token, each of which need re-deploy a new **TokeniZkPresale** contract on a newly generated exclusive address’s token account.

 At each preSale contract, before the preSale activity starts, token owner could only configure rules/parameters as listed at ‘solution’ section.During this, it’s worth noting on the parameters below:

* **whitelist：**

  Whitelist means the membership requirement to participate the preSale activity .Token owner would list on page all members’ addresses within whitelist,  based on which web client would **defaultly** construct locally a merkle tree in memory and compute the root as parameter to be configured later into the **TokeniZkPresale** contract. 

  Regarding whitelist,defaultly TokeniZK platform just stores all members into backend storage as normal sales info, without help on the merkle tree construction/maintainance on it as well as corresponding merkle proof query service during activity for members in whitelist. It means in case the whitelist’s size is large, such as larger than 500, it might cause really much memory/cpu/time resource to construct the whole merkle tree on each presale  investor’s local device, which impacts investor’s experience.To avoid this, token owner could choose and pay for **Outsourced Computing Service** provided by platform, then platform backend will help construct/maintain the merkle tree and provide proof query service for investors during contribution.

* **vesting schedule for contributors：**

  Vesting For Contributors is a feature on preSale that helps projects to lock away the tokens of presale investors for a period of time. Imaging in the future,it could work for preventing presale investors from selling all their tokens at once at listing time, which causes too much sell pressure and crashes the price.
  
  $\underline{\text{At Standard Milestone}}$, PreSale contract leverages Mina’s native time-locking account feature for vesting schedule, which means investors could only utilize token accounts without exsiting vesting schedule (will explain this below at ‘**TokeniZkLocker** ’section).
  
  $\underline{\text{At Advanced Milesone}}$, PrivateSale contract leverages **TokeniZkLocker** for vesting schedule for more flexiability for contributors.

 In additions, Currently TokeniZk just supports Mina as contribution currency.

 _Tips: More details within 'User Journey Flowcharts' section at proposal link above._



#### How TokeniZkPrivateSale works

 It’s a smart contract working for project team to make a private sale from specified investors or the public and deployed at project owner’s given **regular account** with basic configurations as talked at ‘solution’section. During this, it’s worth noting on the parameters below:

* **whitelist：**

  As the same as the one at ‘**TokeniZkPresale**’.

* **vesting schedule for project team：**

  Vesting For project team is a feature on Private Sale that helps to lock away the assets from investors to project team for a period of time to limit the asset usage. This feature helps projects establish an increased level of trust with their investors.

  $\underline{\text{At Standard Milestone}}$, PrivateSale contract leverages Mina’s native time-locking account feature for vesting schedule, which means one investor could only utilize token account without exsiting vesting schedule (will explain this below at ‘**TokeniZkLocker** ’section).

  $\underline{\text{At Advanced Milesone}}$, PrivateSale contract leverages **TokeniZkLocker** for vesting schedule for more flexiability for project team.

 In additions, Currently TokeniZk just supports Mina as contribution currency.

 _Tips: More details within 'User Journey Flowcharts' section at proposal link above._



#### How TokeniZkAirdrop works

​	Due to the limited number of AccountUpdates within a transaction, within the Airdrop activity project team usually could not distribute tokens（push）to a number of users within a transaction at one time (additionally,the  number of recipients is also limited (fixed) each time due to the static circuit), thus users need to claim tokens back（pull）.This means that we need record all related users’addresses on chain (by storing merkle-tree root of offchain storage) for each airdrop activity.  Within Mina, Token accounts are specific for each type of custom token, meaning that a single public key can have many different types of token accounts.Thus, within TokeniZK, we  provide a specific common Intermediary Address intended to be deployed with TokeniZkAirdrop contract at its each custom token account to activate each 8-fields onchain storage where we could store merkle-tree root of offchain storage.TokeniZkAirdrop contract could be optionally deployed later after or during the creation of each Presale, Private Sale.

​	During the Airdrop, every recipient and his rewarding tokens will be stored as an **<u>Airdrop Asset Note</u>** (with fields:{recipient, amount,conditions,etc.},seen as UTXO)and emited as an Action (as well as Event)on chain by project team(ie.token owner).

​	To record all recipients’addresses onchain for each airdrop activity, there is a exclusive unique merkle tree (denoted as **Airdrop-Tree**,an append-only merkle tree) as offchain storage for each custom token (**ie. each custom token has its own unique Airdrop-Tree**), being stored as the  tree root inside corresponding TokeniZkAirdrop contract account(ie. Intermediary token account). Meanwhile,TokeniZK platform will provide offchain storage maintainance service for all Airdrop trees from all custom tokens, including reducing actions of Airdrop activity and storing them into merkle tree as sequenced, and also publish the whole tree to the public to guarantee Data Availibility of TokeniZK platform. And TokeniZK platform helps notify wallet-connected users on page to claim the airdroped tokens.

​	The recipients claim their tokens by nullifying corresponding Airdrop Asset Note(UTXO),to avoid double spending (as described at TokeniZkUser section below).

 _Tips: More details within 'User Journey Flowcharts' section at proposal link above._



#### How TokeniZKLocker works

 As talked above, within TokeniZK, TokenLocker works as each custom token’s exclusive unique Intermediary role for vesting project team and contributors during sales/airdrops or even the regular Token-Transfer scenario where one user vests another user. Further, with TokenLocker <u>a user could recieve different batches of vesting assets regarding the same custom token!</u>


 According to mina doc(https://docs.minaprotocol.com/zkapps/snarkyjs/time-locked-accounts), Mina account’s regular feature -- Time-locking, allows us to pay someone in MINA or other custom tokens subject to a vesting schedule.Tokens are initially locked and become available for withdrawal only after a certain time or gradually according to a specific schedule. **However, Only one vesting schedule can be specified per account and The vesting schedule cannot be changed during the  vesting period.**

 Obviously, the native feature Time-locking could not be appropriate for the basic functionalities talked above of TokenLocker. Therefore, we need a seperate TokenLocker for each custom token. Similar as the Airdrop section, within TokeniZK we provide a specific common Intermediary  Address intended to be deployed with TokeniZkLocker contract at its each custom token account to activate each 8-fields onchain storage where we could store merkle-tree root of offchain storage.

 TokeniZkLocker contract could be optionally deployed later after or during the creation of each Presale,and Fair Airdrop. During the contribution, every contributor and his rewarding custom tokens will be stored as an Locked Asset Note (with fields:{recipient, amount, releaseTimestamp,etc.},seen as UTXO)and emited as an Action (as well as Event) by project team （ie.token owner ）on chain.

 There is also a unique exclusive merkle tree (denoted as **TokenLocker-Tree**,an append-only merkle tree) as offchain storage for each custom token (**ie.  each  custom  token  has its own unique TokenLocker-Tree**), being stored as the tree root inside corresponding TokeniZkLocker contract account(ie. Intermediary token account). Meanwhile,TokeniZK platform also provide ofchain storage maintainance service for all TokenLocker-Trees from all custom tokens, including reducing actions and storing them  into merkle tree as sequenced, and also publish the whole tree to the public to guarantee Data Availibility of TokeniZK platform. Besides,for better  user experience, TokeniZK platform watches all TokenLockers and helps notify wallet-connected users on page to claim the unlocked tokens.

 ​The recipients claim their tokens by nullifying corresponding <u>Locked Asset Note</u>(UTXO) to avoid double spending (as described at *TokeniZkUser* section below).

 _Tips: More details within 'User Journey Flowcharts' section at proposal link above._



#### How TokeniZkUser works

​As talked above, all assets recorded on both Airdrop-Tree and TokenLocker-Tree are regarded as UTXO, and recipients need nullify them when claiming tokens back.

​Within TokeniZK, a user nullifies his own `Locked Asset Note(UTXO)` and `Airdrop Asset Note(UTXO)` by recording them onto his own merkle tree, denoted as ‘**Asset_Nullifier_Tree**’.Actually, each custom token account of one user has one corresponding exclusive `Asset_Nullifier_Tree`.

![WPS图片(1)-16938569740914](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/dae6b150-f113-4194-85d7-7cb4b34355b3)

Each token account of a user will be deployed with a smart contract -- **TokeniZkUser**, then the correponding 8-fields states could be utilized, one of which would be stored with the corresponding `Asset_Nullifier_Tree` root,which is also maintained by TokeniZK platform.

Here is the high-level claiming progress: 

 1. The asset owners need provide target UTXO’s existence merkle proof on ‘Airdrop Tree’ or ‘TokenLocker Tree’ as well as its non-existence merkle proof on ‘Asset_Nullifier_Tree’,to prove the UTXO is valid.
 2. Check the ‘recipient’ of UTXO is equal to the owner.
 3. Tranfer the custom token from correponding Intermediary Token Account to the owner.
 4. Compute the new root of ‘Asset_Nullifier_Tree’ through this UTXO’s non-existence merkle path. Then update the root to the owner’s token account.



### Platform Components Architect Figure

![WPS图片(1)-16938571920466](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/2fe26fbf-4af2-45d7-a468-5b558d24df0d)

To support the features above, there are 5 major roles within Platform:
* **Smart Contracts** : as listed above
  
* **Web Client** : a website for all user journeys as talked above
  
* **Onchain Tracker** : listen for all onchain activities of all custom tokens’ smart contracts and notify **Offchain Storage Maintainer** and **Platform Backend.**
  
* **Offchain Storage Maintainer** : maintain all merkle trees by reducing all actions at intervals and onchain tree root for all custom tokens.
  
* **Platform Backend** : a daemon service for token creators and contributors. like maintain information on project/team and all sales, like notifying users about the their own airdrop notes and unlocked notes, and exposing open api for users to obtain merkle path for each asset note, etc.

​Besides, Mina chain (Archive Nodes) stores all historical Actions/Events and all token states.


### User Journey Flowcharts

#### ZkToken-PreSales-Creation-journey:

![TokeniZK-ZkToken-Presale-Creation-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/1b972afd-7b64-4612-882b-1d9f456c7a6b)


#### ZkToken-PreSales-Contribution-journey:

![TokeniZK-ZkToken-PreSales-Contribution-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/404118d8-77a2-4bc3-bf07-78b8ded0135e)



#### PrivateSales-Creation-journey:

![TokeniZK-PrivateSales-Creation-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/4aa6e373-dd85-419a-ae2c-09047141bca6)



#### PrivateSales-Contribution-journey:

![TokeniZK-PrivateSales-Contribution-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/5de770c8-8462-4baa-bb87-defdee51a893)



#### Airdrop-creation-journey: 

![TokeniZK-Airdrop-creation-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/e96cd61f-f4b3-4919-bfb8-67d7a52ed091)



#### Airdrop-Distribution-journey:

![TokeniZK-Airdrop-distribution-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/baf5f7cf-4668-4a37-a5fe-6b93a4c1853e)



#### Airdrop-claim-journey: 

![TokeniZK-Airdrop-claim-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/43b2714a-6755-4910-bd0f-e651dc59b9ad)



#### TokenLocker-creation-journey: 

![TokeniZK-TokenLocker-creation-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/266f3666-4393-4577-8d98-bec8726ba81b)



#### TokenLocker-distribution-journey: 

![TokeniZK-TokenLocker-distribution-journey](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/ae9ae1a1-69ae-48c6-a952-ab3175741f56)



#### TokenLocker-Creation-Distribution-UnlockedTokenClaim--journey:

![tokenizk-tokenlocker-creation-distribution-claim-journey (5)](https://github.com/TokeniZK/tokenizk-finance/assets/94358089/3b27f013-b95f-466f-bae6-8d844dd9e306)



### System Security Consideration
`As a LaunchPad platform, TokeniZK should rank SECURITY as the first into consideration.`

The below is a brief description on TokeniZK’s three major components where has the most possibility of attacks&victims and how we manage the risks. 

**Smart Contract Part**

Contract is the core for a dapp, and according to historical cases, most attacks/victimshappens here. As a launchpad platform, the code security of all smart contract templates should be considered FIRST. 

1) Authentization & Authorization & Asset-Validity-Proof Check

  Within TokeniZK, we would focus much on the _authentization & authorization_ of most core operations covering ‘zkToken issuing/transfer/mint/burn’, ‘sales launch/contribution’, ‘token claiming at Airdrop/Locker’, etc.

  * Take ‘zkToken issuing/transfer/mint/burn’ as an example, we configure the signature-auth or proof-auth for each fund operation(ie.`Check Authorization`). 

  * Take ‘zkToken claiming at Airdrop/Locker’ as an example. Seen in proposal, all assets recorded on Airdrop/Locker are UTXO, we avoid ‘double spending’ by verifying both existence-merkle-proof and non-existence-merkle-proof (ie.`Check Asset-Validity-Proof`) during claiming assets. Besides, we also require the signature to confirm the token claimer is indeed the owner(ie.`Check Authentization`). Wherein, each signature is bound to each operation to avoid the ‘Replay Attacks’. 

2) Code audit

* Code audit is required for each template before production release to avoid deeper vulnerabilities. There are many parties working on this, including [zkSecurity.xyz](https://www.zkSecurity.xyz) intended for zkApps:

  https://twitter.com/mitschabaude/status/1663596691381944331

  https://www.zksecurity.xyz/blog/posts/noname/

**Web UI Client and Backend System Part**

  There are many normal attacks on a website, such as Xss, InjectionAttack, DDos, Man-In-The-Middle Attack(MITM). Luckily there are already many best practices to prevent them. 

**Data Availability of TokeniZK Platform**

  1) At our ideal design we expect to publish/upgrade the entire web UI at IPFS or Arweave.

  2) Besides, regarding the merkle trees storing state(seen in proposal), at early stage, we would publish them to the public periodically.

  3) Furthermore, we leverage Mina chain’s Actions/Events (_in Archive Nodes_) to record most core operations. Thus, For example, any one could rebuild the whole states(like merkle trees, etc.) by them.

### **Long-term Vision And Dream Scenario**

We all trust ZKP matters much in the coming future, where we could easily further foresee  that Tokens with ZKP capabilities must plays an important role wherein. So we expect to  carry out a launchpad platform(TokeniZK) focusing on zkToken -- mainly Custom Token on  Mina chain.   

Furthermore, as a platform that support issuing and selling tokens, TokeniZK's vision for  future development revolves around creating a safe and efficient ecosystem for token  issuance and sale. The platform aims to provide a user-friendly experience for token issuers  and investors while prioritizing transparency and trust. Therefore, our expected future  development route is as follows:  

1) **A platform where anyone can issue&sell zkTokens**  
Our platform provides a user-friendly interface that enables individuals and businesses to  create and sell their own tokens. By democratizing the token issuance process, we make it  possible for anyone, regardless of technical expertise, to participate in the token economy.   This inclusive approach fosters innovation and opens new avenues for fundraising,  investment, and asset representation.   

2) **A platform to popularize zkToken**  
One of the main goals is to increase the visibility and adoption rate of zkToken. This can be  achieved through various strategies, such as targeted marketing campaigns, educational  initiatives, and partnerships with key industry players. By effectively communicating the  unique features and benefits of zkToken, we aim to appeal to a wider user base and build it  into the leading zkTokenizing platform.   

3) **Project incubation and brand building platform**  
In addition to token issuance, our platform also serves as a comprehensive ecosystem for  project incubation and brand building. We provide resources, mentoring, and networking  opportunities to help entrepreneurs and startups turn their ideas into successful businesses.   Through mentorship programs, funding access, and strategic partnerships, we aim to nurture  promising projects and foster their growth. In addition, our platform provides tools and  strategies for brand building, enabling projects to build a strong market presence and  interact effectively with their target audience.   

4) **Ordinary investors and VC**  
We bridge the gap between ordinary investors and venture capitalists (VC) by providing a  comprehensive matchmaking service. Our platform facilitates the connection between these  two groups, enabling ordinary investors to access investment opportunities traditionally  reserved for venture capitalists. By leveraging our network and due diligence process, we  could curate a selection of high-potential projects that match the preferences of ordinary  investors and VC. This creates a win-win situation where ordinary investors have access to  promising projects and venture capital firms can identify potential investment targets moreeffectively.   

5) **Continue to innovate and embrace compliance**  TokeniZK is committed to continuous innovation and improvement. The platform actively  seeks user feedback and adopts new technologies and features to enhance the user  experience. It also keeps up with the changing regulatory environment to ensure compliance  and adaptability.   Overall, TokeniZK's vision is to create a secure, transparent and user-friendly platform that  supports token issuers and investors while promoting trust and liquidity in the token sale  ecosystem.  



### **Business model And Monetization plan**

Business model and monetization plan is crucial for TokeniZK to go further. We think there are two stages of TokeniZK’s business model and monetization plan.

#### Early Stages
As a decentralized platform for token issuance and sale, TokeniZK acts as an intermediary to connect projects with ordinary investors. It allows project parties to issue tokens on the platform easily and directly, enabling ordinary investors to participate in the early stages of these projects. During the progress, TokeniZK charges fees a revenue source. 

#### 1) zkToken Issuance Service
   TokeniZK provides a token launch board service where projects can conduct the initial tokens offerring. The service includes functions such as token creation and issuance, smart contract deployment, token allocation and Locking/Airdrop. TokeniZK charges a fee for these services. 

#### 2) zkToken Sale Service
TokeniZK charges a percentage based on the total amount of funds raised during the token sale. This fee typically represents a small percentage of the total amount raised, providing TokeniZK with a source of revenue. The cost structure may vary depending on the specific terms agreed for each project. In addition, during the process of token sale, the platform additionally provides targeted 'Outsourced Computing Services' (seen in proposal), and charges a certain fee as a revenue source. 

#### 3) zkToken Holding:
   TokeniZK may also hold a portion of the tokens issued on its platform. As the value of these tokens appreciates, TokeniZK can generate profits by selling them at a later stage. This strategy allows TokeniZK to benefit from the success of the projects it supports. 
   
#### Future Stages 
#### 4) Listing Service:
In the future, when Dex on Mina is mature, TokeniZK will provide a one-stop service for listing its tokens on DEX, in which TokeniZK will charge a certain amount of listing fee to the project party. 

#### 5) Project Operation Service:
TokeniZK provides additional quality services for the project, such as project Logo management, home-page recommendation service and other marketing support, community management and consulting services. These services are designed to increase the success rate of token sales and increase the visibility of the project. TokeniZK charges for these premium services separately, thus contributing to its overall revenue. 

#### 6) Partnerships and Integrations:
TokeniZK can explore partnerships and integrations with other platforms, wallets, or blockchain projects. By partnering with established players in the cryptocurrency space, TokeniZK can generate additional revenue through referral fees, revenue-sharing agreements, or technology licenses. 

7) In the future, TokeniZK can extend its business model by introducing new features and services. For example, it could offer pledging services, liquidity mining opportunities, or Launch TokeniZK's Platform Token. These developments can create additional revenue streams and attract a larger user base. Overall, TokeniZK's business model revolves around providing a comprehensive platform for token issuance, token sale/listing, and contribution, establishing itself as a leader in the digital asset space through a variety of convenient services.



### **Budget and Milestones**



#### **Standard Budget**

25000



#### **Standard Scope**

Since We has almost completed the whole design on the whole platform before. Within 3 months, TokeniZK team spends the budget mainly on __cloud infra && design improvement && software development__ .

* Cloud Infra expense: 2400 U (about 800 U/month)
* Design improvement && Software development: 22600 U



#### Standard Scope Milestones

Milestones in three months:

Within three months, we will carry out a fully functional launchpad platform, implementing a refined UI and UX design, the required MINA Smart Contracts and all interactions with the supporting service.

 * **Milestone1**:  Cloud Infra preparation
   
 * **Milestone2**:  Smart Contracts development
   
    Support functionalities listed at milestone3
   
 * **Milestone3**:  Web client UI development

   Seen as functionalities Listed at ‘**Solution’** section, **Excluding** the items with suffix ‘at Advanced milestone’.

 * **Milestone4**:  Onchain Tracker development

   Support functionalities listed at milestone3

 * **Milestone5**:  Offchain Storage Maintainer development

   Support functionalities listed at milestone3

 * **Milestone6**: Platform Backend Service development

   Support functionalities listed at milestone3




#### Advanced Budget

45000


#### **Advanced Scope**

We has almost completed the whole design on the whole platform before. Within 3 months, TokeniZK team spends the budget mainly on cloud infra && design improvement && software development .

* Cloud Infra expense: 9000 U (about 1000 U/month, 6 extra months after cohort2)

* Design improvement && Software development: 36000 U



#### Advanced Scope Milestones

Within three months, we will carry out a fully functional launchpad platform, implementing a refined UI and UX design, the required MINA Smart Contracts and all interactions with the supporting service.

 * **Milestone1**: Cloud Infra preparation

 * **Milestone2**: Smart Contracts development

   Support **extra **functionalities listed at milestone3

   *PreSales/PrivateSale contract templates* integrated with **TokeniZkLocker** 

 * **Milestone3**: Web client UI development

   Seen as Listed at ‘Solution’ section, **Including** the items with suffix ‘**at Advanced milestone**’ as below :

     1. Advanced Airdrop Creation(At Advanced milestone)

        Project teams could make some more fine configurations on airdrop.

     2. zkNFT Pages(At Advanced milestone)
       
        Project team could launch a zkNFT sales.

        * configure Rules and register&record project/team details.
  
        * Projects Listing Page
  
        * Project Detail Page
  
          * NFT purchasing
    
          * Claim NFT

     5. TokeniZK online Mannual Doc(At Advanced milestone)

 * **Milestone4**: Onchain Tracker development

   * Support extra functionalities listed at milestone3

 * **Milestone5**:  Offchain Storage Maintainer development

   * Support extra functionalities listed at milestone3

 * **Milestone6**: Platform Backend Service development

   * Support extra functionalities listed at milestone3


### **Risks**

We conclude risks sources as below for our project:

* **From potential bug of SnarkyJs**

SnarkyJs library is a young library for zkApp development with actively new upgrade. This might causes potential bugs during the development of TokeniZK, which however is inevitable and reasonable for a new thing. But we are confident on overcoming this with active & powerful Mina technology community as the backing. 

* **From performance of circuit**

It is a well-known problem that the compilation, witness-calc and proof-gen of circuit usually cost much cpu/memory/time resources, which impact much on experience of various user devices. 

Regarding this opening issue#87(https://github.com/o1-labs/snarkyjs/issues/87), currently the **proverKey** of circuit cannot be serialized and cached for later, which means users need compile the circuits for later interactions each time accessing or refreshing the page. 

Regarding this opening issue#673(https://github.com/o1-labs/snarkyjs/issues/673), currently the **all dependent circuits require to be compiled in sequences together at one process** before working, for example, _circuitA <- circuitB <- circuitC_, even if we just need circuitC, we now have to compile circuitA and circuitB first in sequences together at one process. This means extra great cpu/memory/time expenses for circuitA and circuitB, which impact performance really much. But in the future when issue#673 is solved, then we just need compile circuitC, and could easily verify the proof from circuitA and circuitB by their side-loaded verification key, which lead to great advances on performance!

But We think it could be completed sooner or later by official team, because it is urgent for the zkApps’ performance improvement .

* **From Mina network**

Project development and testing schedule could be impacted by potential network issues. We no need worry too much on this risk because testnet or mainnet maintainers always ASAP take actions to fix/recover it since network issues impact so much around.

* **From Product Design**

We completed the initial design of TokeniZK, but details need improving or refactoring, which might cause efforts.

* **From Competitors**

There are several existing popular launchpad platforms, such as PinkSale, DxSale, etc. Although they currently mainly focus on non-zk tokens, they could be strong competitors in the future.

* **From Regulation**

Custom Token Issuing to the public might challenge regulation of some countries.



### **Team Members**

#### Proposer Experience

I am Yoga#3374, I has been an senior frontend engineer in KONKA GROUP for 5years, currently work as an freelancer & online-educator focusing on frontend and blockchain technology. The below are some of my teaching materials or cases: 

https://github.com/Yoga2015/CSS3-Tutorial

https://github.com/Yoga2015/JavaScriptGuide

https://github.com/Yoga2015/ES6-syntax-tutorial

https://github.com/Yoga2015/jQueryBasicSyntax

https://github.com/Yoga2015/Vue-syntax-tutorial

https://github.com/Yoga2015/vue3-tutorial

I have been joining blockchain industry for 4years, familiar with Solidity/Circom/Cairo as well as ‘ZK+Dapp’ development pattern, wherein I tried the promotion on Starknet-Cairo language in China in early 2022.

http://suo.nz/36ciLt

I have been joining Mina community for 2 years, with continuous attention and study on the upgrade of SnarkyJS library.


#### Teammates Info
Tank Tang, Application Architect for 7years, ever been working for China large state-owned bank and conducting development of a large-scale e-commerce shopping platforms, and with rich experience on Dapp development. He is responsiable for the whole architecture design of TokeniZK Platform as well as  system security.

http://www.studycairo.cn/

Cherry Chen, Senior Frontend Engineer for 4years, responsable for the UI design and frontend development of TokeniZK Platform.

https://gitee.com/Trance_CrystalWorld



