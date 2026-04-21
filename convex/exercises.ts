import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

function compactOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("exercises").collect();
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutationGeneric({
  args: {
    name: v.string(),
    muscleGroup: v.string(),
    equipment: v.optional(v.string()),
    defaultSets: v.optional(v.number()),
    defaultReps: v.optional(v.number()),
    defaultWeightKg: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Exercise name is required.");

    const equipment = compactOptionalString(args.equipment);
    const notes = compactOptionalString(args.notes);

    return await ctx.db.insert("exercises", {
      name,
      muscleGroup: args.muscleGroup,
      createdAt: Date.now(),
      ...(equipment ? { equipment } : {}),
      ...(args.defaultSets !== undefined ? { defaultSets: args.defaultSets } : {}),
      ...(args.defaultReps !== undefined ? { defaultReps: args.defaultReps } : {}),
      ...(args.defaultWeightKg !== undefined
        ? { defaultWeightKg: args.defaultWeightKg }
        : {}),
      ...(notes ? { notes } : {}),
    });
  },
});

export const remove = mutationGeneric({
  args: { id: v.id("exercises") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
