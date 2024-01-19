import { WHITELIST_TREE_HEIGHT } from "@tokenizk/contracts";
import { PoseidonHasher, StandardTree, newTree } from "@tokenizk/merkle-tree";
import { Level } from "level";
import { Field, Poseidon, PublicKey } from "o1js";

async function constructWhitelistTree(members: string[]) {
    const leaves = members.map(m => Poseidon.hash(PublicKey.fromBase58(m).toFields()));
    const poseidonHasher = new PoseidonHasher();
    const whitelistDB = new Level<string, Buffer>('', { valueEncoding: 'buffer' });
    const whitelistTree = await newTree(StandardTree,
        whitelistDB,
        poseidonHasher,
        `WHITELIST_TREE`,
        WHITELIST_TREE_HEIGHT);

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
    const poseidonHasher = new PoseidonHasher();
    const whitelistDB = new Level<string, Buffer>('', { valueEncoding: 'buffer' });
    const whitelistTree = await newTree(StandardTree,
        whitelistDB,
        poseidonHasher,
        `WHITELIST_TREE`,
        WHITELIST_TREE_HEIGHT);

    const witness = (await whitelistTree.getSiblingPath(BigInt('0'), true)).path.map(f => f.toString());

    return witness
}
