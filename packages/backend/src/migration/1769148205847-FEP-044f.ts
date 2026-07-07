import { MigrationInterface, QueryRunner } from "typeorm";

export class FEP044f1769148205847 implements MigrationInterface {
    name = 'FEP044f1769148205847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."interaction_stamp_type_enum" AS ENUM('quote')`);
        await queryRunner.query(`CREATE TABLE "interaction_stamp" ("id" character varying(32) NOT NULL, "type" "public"."interaction_stamp_type_enum" NOT NULL, "targetNoteId" character varying(32) NOT NULL, "noteId" character varying(32) NOT NULL, CONSTRAINT "PK_655e4f52463bd63c126bf8a21bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_966faaedd04f5bc0e4e7f23b51" ON "interaction_stamp" ("noteId", "targetNoteId") `);
        await queryRunner.query(`ALTER TABLE "note" ADD "quoteAuthorization" character varying(512)`);
        await queryRunner.query(`ALTER TABLE "note" ADD "canQuote" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "interaction_stamp" ADD CONSTRAINT "FK_5b41539ebe68913e845d32b1a14" FOREIGN KEY ("targetNoteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interaction_stamp" ADD CONSTRAINT "FK_f22ecf4fa523296288dfff84c40" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "interaction_stamp" DROP CONSTRAINT "FK_f22ecf4fa523296288dfff84c40"`);
        await queryRunner.query(`ALTER TABLE "interaction_stamp" DROP CONSTRAINT "FK_5b41539ebe68913e845d32b1a14"`);
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "canQuote"`);
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "quoteAuthorization"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_966faaedd04f5bc0e4e7f23b51"`);
        await queryRunner.query(`DROP TABLE "interaction_stamp"`);
        await queryRunner.query(`DROP TYPE "public"."interaction_stamp_type_enum"`);
    }
}
