import { Level } from "level";

const o1js = import('o1js');
const ContractConstants = import('@tokenizk/contracts');
const MerkleTreeLib = import('@tokenizk/merkle-tree');

async function constructWhitelistTree(members: string[]) {
    if (members?.length == 0) {
        throw new Error('members invalid');
    }

    const leaves: any[] = [];
    for (let i = 0; i < members.length; i++) {
        leaves.push((await o1js).Poseidon.hash((await o1js).PublicKey.fromBase58(members[i]).toFields()));
    }

    const poseidonHasher = new (await MerkleTreeLib).PoseidonHasher();
    const whitelistDB = new Level<string, Buffer>('', { valueEncoding: 'buffer' });
    const whitelistTree = await (await MerkleTreeLib).newTree((await MerkleTreeLib).StandardTree,
        whitelistDB,
        poseidonHasher,
        `WHITELIST_TREE`,
        (await ContractConstants).WHITELIST_TREE_HEIGHT);

    await whitelistTree.appendLeaves(leaves);

    return whitelistTree;
}

export async function calcWhitelistTreeRoot(members: string[]) {
    const whitelistTree = await constructWhitelistTree(members);
    const root = whitelistTree.getRoot(true).toString();
    return root;
}
export async function calcWhitelistMerkleWitness(members: string[], target: string) {
    const leafIndex = members.indexOf(target);

    const whitelistTree = await constructWhitelistTree(members);

    const witness = (await whitelistTree.getSiblingPath(BigInt(leafIndex), true)).path.map(f => f.toString());

    return witness;
}

export async function getEmptyLeafWitness() {
    const poseidonHasher = new (await MerkleTreeLib).PoseidonHasher();
    const whitelistDB = new Level<string, Buffer>('', { valueEncoding: 'buffer' });
    const whitelistTree = await (await MerkleTreeLib).newTree((await MerkleTreeLib).StandardTree,
        whitelistDB,
        poseidonHasher,
        `WHITELIST_TREE`,
        (await ContractConstants).WHITELIST_TREE_HEIGHT);

    const witness = (await whitelistTree.getSiblingPath(BigInt('0'), true)).path.map(f => f.toString());

    return witness
}
