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
            await queryRunner.clearTable('tb_account');
            await queryRunner.clearTable('tb_block');
            await queryRunner.clearTable('tb_block_cache');
            await queryRunner.clearTable('tb_block_prover_output');
            await queryRunner.clearTable('tb_deposit_action_event_fetch_record');
            await queryRunner.clearTable('tb_deposit_commitment');
            await queryRunner.clearTable('tb_deposit_processor_signal');
            await queryRunner.clearTable('tb_deposit_prover_output');
            await queryRunner.clearTable('tb_deposit_rollup_batch');
            await queryRunner.clearTable('tb_deposit_tree_trans');
            await queryRunner.clearTable('tb_deposit_tree_trans_cache');
            await queryRunner.clearTable('tb_inner_rollup_batch');
            await queryRunner.clearTable('tb_l2_tx');
            await queryRunner.clearTable('tb_mempl_l2_tx');
            await queryRunner.clearTable('tb_task');
            await queryRunner.clearTable('tb_withdraw_info');
            await queryRunner.clearTable('tb_withdraw_event_fetch_record');
            await queryRunner.clearTable('tb_l2_tx_dto_origin');

            await queryRunner.commitTransaction();

        } catch (err) {
            await queryRunner.rollbackTransaction();

            console.error(err);
        } finally {
            await queryRunner.release();
        }
    }
}
