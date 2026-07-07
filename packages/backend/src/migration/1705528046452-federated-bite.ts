import { MigrationInterface, QueryRunner } from "typeorm";

export class FederatedBite1705528046452 implements MigrationInterface {
	name = 'FederatedBite1705528046452'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TYPE "public"."bite_targettype_enum" AS ENUM('user', 'bite')`);
		await queryRunner.query(`CREATE TABLE "bite" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "uri" character varying(512), "userId" character varying(32) NOT NULL, "targetType" "public"."bite_targettype_enum" NOT NULL, "targetUserId" character varying(32), "targetBiteId" character varying(32), "replied" boolean NOT NULL DEFAULT true, CONSTRAINT "CHK_c3a20c5756ccff3133f8927500" CHECK ("targetUserId" IS NOT NULL OR "targetBiteId" IS NOT NULL), CONSTRAINT "PK_1887f3f621a4a7655a1b78bfd66" PRIMARY KEY ("id")); COMMENT ON COLUMN "bite"."uri" IS 'null if local'`);
		await queryRunner.query(`ALTER TABLE "notification" ADD "biteId" character varying(32)`);
		await queryRunner.query(`ALTER TYPE "public"."user_profile_mutingnotificationtypes_enum" RENAME TO "user_profile_mutingnotificationtypes_enum_old"`);
		await queryRunner.query(`CREATE TYPE "public"."user_profile_mutingnotificationtypes_enum" AS ENUM('follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollVote', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'groupInvited', 'app', 'bite')`);
		await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" TYPE "public"."user_profile_mutingnotificationtypes_enum"[] USING "mutingNotificationTypes"::"text"::"public"."user_profile_mutingnotificationtypes_enum"[]`);
		await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" SET DEFAULT '{}'`);
		await queryRunner.query(`DROP TYPE "public"."user_profile_mutingnotificationtypes_enum_old"`);
		await queryRunner.query(`ALTER TABLE "bite" ADD CONSTRAINT "FK_8d00aa79e157364ac1f60c15098" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "bite" ADD CONSTRAINT "FK_a646fbbeb6efa2531c75fec46b9" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "bite" ADD CONSTRAINT "FK_5d5f68610583f2e0b6785d3c0e9" FOREIGN KEY ("targetBiteId") REFERENCES "bite"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_c54844158c1eead7042e7ca4c83" FOREIGN KEY ("biteId") REFERENCES "bite"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`);
		await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollVote', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'groupInvited', 'app', 'bite')`);
		await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum" USING "type"::"text"::"public"."notification_type_enum"`);
		await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DELETE FROM "notification" WHERE "biteId" IS NOT NULL`);
		await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_c54844158c1eead7042e7ca4c83"`);
		await queryRunner.query(`ALTER TABLE "bite" DROP CONSTRAINT "FK_5d5f68610583f2e0b6785d3c0e9"`);
		await queryRunner.query(`ALTER TABLE "bite" DROP CONSTRAINT "FK_a646fbbeb6efa2531c75fec46b9"`);
		await queryRunner.query(`ALTER TABLE "bite" DROP CONSTRAINT "FK_8d00aa79e157364ac1f60c15098"`);
		await queryRunner.query(`CREATE TYPE "public"."user_profile_mutingnotificationtypes_enum_old" AS ENUM('follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollVote', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'groupInvited', 'app')`);
		await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" TYPE "public"."user_profile_mutingnotificationtypes_enum_old"[] USING "mutingNotificationTypes"::"text"::"public"."user_profile_mutingnotificationtypes_enum_old"[]`);
		await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" SET DEFAULT '{}'`);
		await queryRunner.query(`DROP TYPE "public"."user_profile_mutingnotificationtypes_enum"`);
		await queryRunner.query(`ALTER TYPE "public"."user_profile_mutingnotificationtypes_enum_old" RENAME TO "user_profile_mutingnotificationtypes_enum"`);
		await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "biteId"`);
		await queryRunner.query(`DROP TABLE "bite"`);
		await queryRunner.query(`DROP TYPE "public"."bite_targettype_enum"`);
		await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollVote', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'groupInvited', 'app')`);
		await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`);
		await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
		await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`);
	}
}
