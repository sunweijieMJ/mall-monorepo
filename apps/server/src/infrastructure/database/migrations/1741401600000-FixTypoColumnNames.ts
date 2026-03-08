import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 修复历史拼写错误的列名：
 * - pms_product: recommand_status → recommend_status
 * - ums_member_level: priviledge_* → privilege_*
 */
export class FixTypoColumnNames1741401600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // pms_product
    await queryRunner.query(
      `ALTER TABLE pms_product RENAME COLUMN recommand_status TO recommend_status`,
    );

    // ums_member_level
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN priviledge_free_freight TO privilege_free_freight`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN priviledge_sign_in TO privilege_sign_in`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN priviledge_comment TO privilege_comment`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN priviledge_promotion TO privilege_promotion`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN priviledge_member_price TO privilege_member_price`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN priviledge_birthday TO privilege_birthday`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // pms_product
    await queryRunner.query(
      `ALTER TABLE pms_product RENAME COLUMN recommend_status TO recommand_status`,
    );

    // ums_member_level
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN privilege_free_freight TO priviledge_free_freight`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN privilege_sign_in TO priviledge_sign_in`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN privilege_comment TO priviledge_comment`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN privilege_promotion TO priviledge_promotion`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN privilege_member_price TO priviledge_member_price`,
    );
    await queryRunner.query(
      `ALTER TABLE ums_member_level RENAME COLUMN privilege_birthday TO priviledge_birthday`,
    );
  }
}
