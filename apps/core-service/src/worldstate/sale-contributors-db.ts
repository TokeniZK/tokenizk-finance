
import { PoseidonHasher, LeafData, newTree, loadTree, StandardTree } from '@tokenizk/merkle-tree';
import { Field, PublicKey } from "o1js";
import { Level } from "level";
import { MerkleTreeId } from '@tokenizk/types';
import { CONTRIBUTORS_TREE_HEIGHT } from '@tokenizk/contracts';

interface TreeWrapper { tokenAddr: string, saleAddr: string, tree: StandardTree }

export class SaleContributorsDB {
    private readonly contributorsDB: Level<string, Buffer>
    private treeList: TreeWrapper[] = []
    private currentTree: TreeWrapper
    constructor(dbPath: string) {
        this.contributorsDB = new Level<string, Buffer>(dbPath, { valueEncoding: 'buffer' });
    }

    /**
     * a totally new trees if the user address never withdraw
     */
    async initTree(tokenAddr: PublicKey, saleAddr: PublicKey) {

        console.log(`initTree: ${MerkleTreeId[MerkleTreeId.CONTRIBUTORS_TREE]}:${tokenAddr.toBase58()}:${saleAddr.toBase58()}...`);
        const poseidonHasher = new PoseidonHasher();
        const contributorTree = await newTree(StandardTree,
            this.contributorsDB,
            poseidonHasher,
            `${MerkleTreeId[MerkleTreeId.CONTRIBUTORS_TREE]}:${tokenAddr.toBase58()}:${saleAddr.toBase58()}`,
            CONTRIBUTORS_TREE_HEIGHT);

        this.currentTree = { tokenAddr: tokenAddr.toBase58(), saleAddr: saleAddr.toBase58(), tree: contributorTree };
        this.treeList.push(this.currentTree);
    }

    /**
     * should loadtrees if the user address already exists
     */
    async loadTree(tokenAddr: PublicKey, saleAddr: PublicKey) {
        // check if in cache
        const x = this.treeList.find((item) => {
            return item.tokenAddr == tokenAddr.toBase58() && item.saleAddr == saleAddr.toBase58();
        });
        if (x) {
            this.currentTree = x;
            return;
        }

        console.log(`loadTree: ${MerkleTreeId[MerkleTreeId.CONTRIBUTORS_TREE]}:${tokenAddr.toBase58()}:${saleAddr.toBase58()}...`);

        const poseidonHasher = new PoseidonHasher();
        const contributorTree = await loadTree(StandardTree,
            this.contributorsDB,
            poseidonHasher,
            `${MerkleTreeId[MerkleTreeId.CONTRIBUTORS_TREE]}:${tokenAddr.toBase58()}:${saleAddr.toBase58()}`);

        this.currentTree = { tokenAddr: tokenAddr.toBase58(), saleAddr: saleAddr.toBase58(), tree: contributorTree };
        this.treeList.push(this.currentTree);
    }

    /**
     * when the scene with 'initTree() or loadTree()' is done, then rm it.
     */
    reset() {
        this.currentTree = (undefined as any) as TreeWrapper
    }

    /**
     * Appends a set of leaf values to the tree and return leafIdxList
     * @param leaves - The set of leaves to be appended.
     */
    async appendLeaves(leaves: Field[]) {
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }
        await this.currentTree.tree.appendLeaves(leaves);
    }

    /**
     * Appends a leaf value to the tree and return leafIdx
     * @param leaf - The leaves to be appended.
     */
    async appendLeaf(leaf: Field) {//
        return await this.appendLeaves([leaf]);
    }

    /**
     * Returns the sibling path for a requested leaf index.
     * @param index - The index of the leaf for which a sibling path is required.
     * @param includeUncommitted - Set to true to include uncommitted updates in the sibling path.
     */
    async getSiblingPath(index: bigint,
        includeUncommitted: boolean
    ) {//
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }
        return await this.currentTree.tree.getSiblingPath(index, includeUncommitted);
    }

    /**
     * Returns the current root of the tree.
     * @param includeUncommitted - Set to true to include uncommitted updates in the calculated root.
     */
    getRoot(includeUncommitted: boolean): Field {//
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }

        return this.currentTree.tree.getRoot(includeUncommitted);
    }

    /**
     * Returns the number of leaves in the tree.
     * @param includeUncommitted - Set to true to include uncommitted updates in the returned value.
     */
    getNumLeaves(includeUncommitted: boolean): bigint {//
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }
        return this.currentTree.tree.getNumLeaves(includeUncommitted);
    }

    /**
     * Commit pending updates to the tree.
     */
    async commit() {//
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }
        await this.currentTree.tree.commit();
    }

    /**
     * Returns the depth of the tree.
     */
    getDepth(): number {//
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }
        return this.currentTree.tree.getDepth();
    }

    /**
     * Rollback pending update to the tree.
     */
    async rollback() {//
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }
        this.currentTree.tree.rollback()
    }

    /**
     * Gets the latest LeafData copy.
     * @param index - Index of the leaf of which to obtain the LeafData copy.
     * @param includeUncommitted - If true, the uncommitted changes are included in the search.
     * @returns A copy of the leaf data at the given index or undefined if the leaf was not found.
     */
    /*
    public getLatestLeafDataCopy(
        index: number,
        includeUncommitted: boolean
    ): LeafData | undefined {
        if (!this.currentTree) {
            throw new Error("tree is not init...");
        }
        return this.currentTree.tree.getLatestLeafDataCopy(index, includeUncommitted);
    }
    */
}
