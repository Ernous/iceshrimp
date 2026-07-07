import { MigrationInterface, QueryRunner } from "typeorm";

export class BiteNotificationIndex1722204953558 implements MigrationInterface {
    name = 'BiteNotificationIndex1722204953558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_c54844158c1eead7042e7ca4c8" ON "notification" ("biteId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c54844158c1eead7042e7ca4c8"`);
    }
}
