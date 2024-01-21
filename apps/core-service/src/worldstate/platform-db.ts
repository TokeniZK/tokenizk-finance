import { initORM } from '@/lib/orm'
import { getConnection } from 'typeorm';

export class PlatformDB {
    async start() {
        await initORM();
    }

    async resetDB() {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            // truncate tables
            await queryRunner.clearTable('tb_airdrop');
            await queryRunner.clearTable('tb_basic_token');
            await queryRunner.clearTable('tb_client_prove_task');
            await queryRunner.clearTable('tb_factory_event_fetch_record');
            await queryRunner.clearTable('tb_sale');
            await queryRunner.clearTable('tb_sale_event_fetch_record');
            await queryRunner.clearTable('tb_sale_rollup_prover_param');
            await queryRunner.clearTable('tb_task');
            await queryRunner.clearTable('tb_token_factory');
            await queryRunner.clearTable('tb_user');
            await queryRunner.clearTable('tb_user_token_airdrop');
            await queryRunner.clearTable('tb_user_token_sale');
            await queryRunner.clearTable('tb_user_token_transfer');

            await queryRunner.commitTransaction();

        } catch (err) {
            await queryRunner.rollbackTransaction();

            console.error(err);
        } finally {
            await queryRunner.release();
        }
    }
}
