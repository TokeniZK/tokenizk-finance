import {
    AccountUpdate,
    Bool,
    Empty,
    Field,
    Provable,
    SelfProof,
    Struct,
    UInt64,
    ZkProgram,
} from 'o1js';
import {
     SaleActionBatch,
     SaleContribution,
     SaleRollupState,
     SaleRollupStateTransition,
} from './sale-models';

export const INITIAL_LEAF = Field(0);

class TmpParams extends Struct({
    isActionNonExist: Bool,
    membershipTreeRoot: Field,
    currentIndex: Field,
    currentMinaAmount: UInt64
}) { }

let  SaleRollupProver = ZkProgram({
    name: ' SaleRollupProver',
    publicOutput:  SaleRollupStateTransition,

    methods: {
        processActionsInBatch: {
            privateInputs: [ SaleRollupState,  SaleActionBatch],

            async method(state:  SaleRollupState, actionBatch:  SaleActionBatch) {
                let currMembershipTreeRoot = state.membershipTreeRoot;
                let currIndex = state.currentIndex;
                let currActionsHash = state.currentActionsHash;
                let currMinaAmount = state.currentMinaAmount;

                // Process each action in the batch
                for (let i = 0, len =  SaleActionBatch.batchSize; i < len; i++) {
                    const currAction = actionBatch.actions[i];
                    const currWitness = actionBatch.merkleWitnesses[i];
                    const isDummyData = Provable.equal(currAction,  SaleContribution.dummy());

                    // calculate new actions hash
                    let eventHash = AccountUpdate.Actions.hash([currAction.toFields()]);
                    currActionsHash = Provable.if(
                        isDummyData,
                        currActionsHash,
                        AccountUpdate.Actions.updateSequenceState(
                            currActionsHash,
                            eventHash
                        )
                    );

                    // check membership
                    const calculatedRoot = currWitness.calculateRoot(INITIAL_LEAF, currIndex);
                    const isNonExist = currMembershipTreeRoot.equals(calculatedRoot);

                    let temp = Provable.if(
                        isDummyData,
                        TmpParams,
                        new TmpParams({
                            isActionNonExist: Bool(true),
                            membershipTreeRoot: currMembershipTreeRoot,
                            currentIndex: currIndex,
                            currentMinaAmount: currMinaAmount
                        }),
                        new TmpParams({
                            isActionNonExist: isNonExist,
                            membershipTreeRoot: currWitness.calculateRoot(currAction.hash(), currIndex),
                            currentIndex: currIndex.add(1),
                            currentMinaAmount: currMinaAmount.add(currAction.minaAmount)
                        })
                    );

                    temp.isActionNonExist.assertTrue(
                        'action is already exist in current index'
                    );
                    currMembershipTreeRoot = temp.membershipTreeRoot;
                    currIndex = temp.currentIndex;
                    currMinaAmount = temp.currentMinaAmount;

                    Provable.log('currIndex: ', currIndex);
                }

                return new  SaleRollupStateTransition({
                    source: state,
                    target: new  SaleRollupState({
                        membershipTreeRoot: currMembershipTreeRoot,
                        currentIndex: currIndex,
                        currentActionsHash: currActionsHash,
                        currentMinaAmount: currMinaAmount,
                    }),
                });
            },
        },

        mergeStates: {
            privateInputs: [SelfProof, SelfProof],

            async method(
                p1: SelfProof<Empty,  SaleRollupStateTransition>,
                p2: SelfProof<Empty,  SaleRollupStateTransition>
            ) {
                p1.verify();
                p2.verify();

                p1.publicOutput.target.assertEquals(p2.publicOutput.source);

                return new  SaleRollupStateTransition({
                    source: p1.publicOutput.source,
                    target: p2.publicOutput.target,
                });
            },
        },
    },
});

class  SaleRollupProof extends ZkProgram.Proof( SaleRollupProver) { }

export {  SaleRollupProver,  SaleRollupProof };
