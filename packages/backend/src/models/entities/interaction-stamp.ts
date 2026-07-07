import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { id } from "../id.js";
import { Note } from "./note.js";

@Entity()
@Index(["noteId", "targetNoteId"], { unique: true })
export class InteractionStamp {
	@PrimaryColumn(id())
	public id: string;

	@Column("enum", {
		enum: ["quote"],
	})
	public type: "quote";

	@Column(id())
	public targetNoteId: Note["id"];

	@ManyToOne((type) => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	// local note being quoted (quotee)
	public targetNote?: Note | null;

	@Column(id())
	public noteId: Note["id"];

	@ManyToOne((type) => Note, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	// remote note quoting (quoter)
	public note?: Note | null;
}
