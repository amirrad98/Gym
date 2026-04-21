import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

function compactOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("bodyMeasurements").collect();
    return rows.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  },
});

export const create = mutationGeneric({
  args: {
    dateKey: v.string(),
    bodyWeightKg: v.optional(v.number()),
    bodyFatPercent: v.optional(v.number()),
    waistCm: v.optional(v.number()),
    chestCm: v.optional(v.number()),
    hipsCm: v.optional(v.number()),
    leftArmCm: v.optional(v.number()),
    rightArmCm: v.optional(v.number()),
    leftThighCm: v.optional(v.number()),
    rightThighCm: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notes = compactOptionalString(args.notes);
    const payload: Record<string, unknown> = {
      dateKey: args.dateKey,
      createdAt: Date.now(),
    };
    const optionalNumberKeys = [
      "bodyWeightKg",
      "bodyFatPercent",
      "waistCm",
      "chestCm",
      "hipsCm",
      "leftArmCm",
      "rightArmCm",
      "leftThighCm",
      "rightThighCm",
    ] as const;
    for (const key of optionalNumberKeys) {
      const value = args[key];
      if (value !== undefined) payload[key] = value;
    }
    if (notes) payload.notes = notes;

    return await ctx.db.insert("bodyMeasurements", payload as never);
  },
});

export const remove = mutationGeneric({
  args: { id: v.id("bodyMeasurements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
