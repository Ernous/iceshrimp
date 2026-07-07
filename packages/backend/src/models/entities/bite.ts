import { Check, Column, Entity, ManyToOne, PrimaryColumn, Index } from "typeorm";
import { id } from "../id.js";
import { User } from "./user.js";
import { Note } from "./note.js";

@Entity()
@Check(`"targetUserId" IS NOT NULL OR "targetBiteId" IS NOT NULL OR "targetNoteId" IS NOT NULL`)
export class Bite {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone")
	public createdAt: Date;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "null if local",
	})
	public uri: string | null;

	@Column(id())
	public userId: string;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	public user: User | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public userHost: string;

	@Column({ ...id(), nullable: true })
	public targetUserId: string | null;

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
		nullable: true,
	})
	public targetUser: User | null;

	@Column({ ...id(), nullable: true })
	public targetBiteId: string | null;

	@ManyToOne(() => Bite, {
		onDelete: "CASCADE",
		nullable: true,
	})
	public targetBite: Bite | null;

	@Column({ ...id(), nullable: true })
	public targetNoteId: string | null;

	@ManyToOne(() => Note, {
		onDelete: "CASCADE",
		nullable: true,
	})
	public targetNote: Note | null;

	@Column("boolean", {
		default: true,
	})
	public replied: boolean;
}
