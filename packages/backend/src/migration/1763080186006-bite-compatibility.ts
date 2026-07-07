import { MigrationInterface, QueryRunner } from "typeorm";

export class BiteCompatibility1763080186006 implements MigrationInterface {
    name = 'BiteCompatibility1763080186006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bite" DROP CONSTRAINT "CHK_c3a20c5756ccff3133f8927500"`);
        await queryRunner.query(`ALTER TABLE "bite" DROP COLUMN "targetType"`);
        await queryRunner.query(`DROP TYPE "public"."bite_targettype_enum"`);
        await queryRunner.query(`ALTER TABLE "bite" ADD "userHost" character varying(512)`);
        await queryRunner.query(`COMMENT ON COLUMN "bite"."userHost" IS '[Denormalized]'`);
        await queryRunner.query(`ALTER TABLE "bite" ADD "targetNoteId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "bite" ADD CONSTRAINT "CHK_f0e178a8942af8cf564ac5a60e" CHECK ("targetUserId" IS NOT NULL OR "targetBiteId" IS NOT NULL OR "targetNoteId" IS NOT NULL)`);
        await queryRunner.query(`ALTER TABLE "bite" ADD CONSTRAINT "FK_4710076fcd98193b0ec8d7f68de" FOREIGN KEY ("targetNoteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`UPDATE "bite" SET "userHost" = "user"."host" FROM "user" WHERE "user"."id" = "bite"."userId"`); // populate userHost
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bite" DROP CONSTRAINT "FK_4710076fcd98193b0ec8d7f68de"`);
        await queryRunner.query(`ALTER TABLE "bite" DROP CONSTRAINT "CHK_f0e178a8942af8cf564ac5a60e"`);
        await queryRunner.query(`ALTER TABLE "bite" DROP COLUMN "targetNoteId"`);
        await queryRunner.query(`COMMENT ON COLUMN "bite"."userHost" IS '[Denormalized]'`);
        await queryRunner.query(`ALTER TABLE "bite" DROP COLUMN "userHost"`);
        await queryRunner.query(`CREATE TYPE "public"."bite_targettype_enum" AS ENUM('user', 'bite')`);
        await queryRunner.query(`DELETE FROM "bite"`); // it's not easy to determine targetType in our migration, so we just clear all bites
        await queryRunner.query(`ALTER TABLE "bite" ADD "targetType" "public"."bite_targettype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bite" ADD CONSTRAINT "CHK_c3a20c5756ccff3133f8927500" CHECK ((("targetUserId" IS NOT NULL) OR ("targetBiteId" IS NOT NULL)))`);
    }
}
