import { MigrationInterface, QueryRunner } from "typeorm";

export class BiteControls1770193373959 implements MigrationInterface {
    name = 'BiteControls1770193373959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_canbite_enum" AS ENUM('anyone', 'followers', 'nobody')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "canBite" "public"."user_canbite_enum" NOT NULL DEFAULT 'nobody'`);
		await queryRunner.query(`UPDATE "user" SET "canBite" = 'followers' WHERE HOST IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "canBite"`);
        await queryRunner.query(`DROP TYPE "public"."user_canbite_enum"`);
    }
}
