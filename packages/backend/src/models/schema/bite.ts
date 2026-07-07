export const packedBiteSchema = {
	type: "object",
	properties: {
		id: {
			type: "string",
			format: "id",
			optional: false,
			nullable: false,
		},
		user: {
			type: "object",
			ref: "UserLite",
		},
		targetType: {
			type: "string",
			enum: ["user", "bite", "note"],
		},
		target: {
			oneOf: [
				{
					type: "object",
					ref: "UserLite",
				},
				{
					type: "object",
					ref: "Bite",
				},
			],
		},
	},
} as const;
