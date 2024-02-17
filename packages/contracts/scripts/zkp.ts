import {
    Bool,
    Field,
    Poseidon,
    Provable,
    PublicKey,
    UInt64,
    verify,
    ZkProgram,
} from 'o1js';
import fs from "fs";

let ProverX = ZkProgram({
    name: 'ProverX',
    publicOutput: UInt64,

    methods: {
        dummy: {
            privateInputs: [],
            method() {
                return UInt64.from(0);
            },
        }
    },
});

class ProverProofX extends ZkProgram.Proof(ProverX) { }

export async function genProofAndSerAndVerify() {

    const { verificationKey: ProverX_VK } = await ProverX.compile();

    const proof = await ProverX.dummy();

    try {
        const ok = await verify(proof, ProverX_VK);
        console.log('ok: ' + ok);

        const proofStr = JSON.stringify(proof.toJSON());
        // write to file
        fs.writeFileSync('./proof.json', proofStr);

        // read from file
        const str2 = fs.readFileSync('./proof.json', 'utf8');
        const proof2 = ProverProofX.fromJSON(JSON.parse(str2));
        const ok2 = await verify(proof2, ProverX_VK);
        console.log('ok2: ' + ok2);
    } catch (error) {
        console.error(error);
    }
}


export async function readProofFromFileAndVerify() {
    try {
        const { verificationKey: ProverX_VK } = await ProverX.compile();
        // read from file
        const str2 = fs.readFileSync('./proof.json', 'utf8');
        const proof2 = ProverProofX.fromJSON(JSON.parse(str2));
        const ok2 = await verify(proof2, ProverX_VK);
        console.log('ok2: ' + ok2);
    } catch (error) {
        console.error(error);
    }
}

// step1:
// await genProofAndSerAndVerify();

// step2: comment step1 and uncomment step2 before run
readProofFromFileAndVerify();