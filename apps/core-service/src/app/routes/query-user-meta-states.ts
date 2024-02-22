
import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, MerkleTreeId } from "@tokenizk/types";
import { getConnection, In, IsNull, MoreThanOrEqual } from "typeorm";
import { PublicKey, Field, UInt64 } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { User, UserTokenAirdrop, UserTokenSale } from "@tokenizk/entities";
import { } from "typeorm";
import { AirdropClaim, SaleContribution } from "@tokenizk/contracts";

const logger = getLogger('queryUserMetaStates');

/**
 * query User Meta States
 */
export const queryUserMetaStates: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/query-user-meta-states",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<null, { userAddress: string }> = async function (
    req,
    res
): Promise<BaseResponse<{ root: string, depth: number, leaves: number }>> {
    const userAddress = req.params.userAddress;
    try {
        const hasTree = await this.indexDB.get(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddress}`);
        if (hasTree) {// undefined
            await this.userNullifierDB.initTree(PublicKey.fromBase58(userAddress));
            await this.userNullifierDB.commit();
            logger.info(`created userNullifierTree for ${userAddress}]`);

            await this.indexDB.put(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddress}`, '1');
        } else {
            await this.userNullifierDB.loadTree(PublicKey.fromBase58(userAddress));
            logger.info(`loaded userNullifierTree for ${userAddress}]`);
        }

        return {
            code: 0, data: {
                root: await this.userNullifierDB.getRoot(false).toString(),
                depth: await this.userNullifierDB.getDepth(),
                leaves: Number(await this.userNullifierDB.getNumLeaves(false))
            }, msg: ''
        };

    } catch (err) {
        logger.error(`process record[${userAddress}, error!]`);
        logger.error(err);

    } finally {
        await this.userNullifierDB.reset();

        logger.info(`process record[${userAddress}, done.]`);
    }
    
    return {
        code: 1, 
        data: undefined, 
        msg: ''
    };
}

const schema = {
    description: 'queryUserMetaStates',
    tags: ['Maintain Tree'],
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'object',
                    properties: {
                        root: {
                            type: 'string'
                        },
                        depth: {
                            type: 'number'
                        },
                        leaves: {
                            type: 'number'
                        }
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
