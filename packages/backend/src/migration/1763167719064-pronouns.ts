import { MigrationInterface, QueryRunner } from "typeorm";

export class Pronouns1763167719064 implements MigrationInterface {
    name = 'Pronouns1763167719064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "pronouns" jsonb NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "user_profile"."pronouns" IS 'Language map of user pronouns'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "user_profile"."pronouns" IS 'Language map of user pronouns'`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "pronouns"`);
    }

}
