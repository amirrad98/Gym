import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const categoryValidator = v.union(
  v.literal("strength"),
  v.literal("weight"),
  v.literal("habit"),
  v.literal("endurance"),
  v.literal("other"),
);

function compactOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("goals").collect();
    return rows.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  },
});

export const create = mutationGeneric({
  args: {
    title: v.string(),
    category: categoryValidator,
    targetValue: v.optional(v.number()),
    targetUnit: v.optional(v.string()),
    currentValue: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (!title) throw new Error("Goal title is required.");

    const now = Date.now();
    const unit = compactOptionalString(args.targetUnit);
    const dueDate = compactOptionalString(args.dueDate);
    const notes = compactOptionalString(args.notes);

    return await ctx.db.insert("goals", {
      title,
      category: args.category,
      completed: false,
      createdAt: now,
      updatedAt: now,
      ...(args.targetValue !== undefined ? { targetValue: args.targetValue } : {}),
      ...(unit ? { targetUnit: unit } : {}),
      ...(args.currentValue !== undefined ? { currentValue: args.currentValue } : {}),
      ...(dueDate ? { dueDate } : {}),
      ...(notes ? { notes } : {}),
    });
  },
});

export const toggle = mutationGeneric({
  args: { id: v.id("goals"), completed: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      completed: args.completed,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutationGeneric({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
