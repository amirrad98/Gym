import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

function compactOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const programs = await ctx.db.query("programs").collect();
    const entries = await Promise.all(
      programs.map(async (program) => {
        const exercises = await ctx.db
          .query("programExercises")
          .withIndex("by_program", (q) => q.eq("programId", program._id))
          .collect();
        return {
          program,
          exercises: exercises.sort((a, b) => a.order - b.order),
        };
      }),
    );
    return entries.sort((a, b) => a.program.name.localeCompare(b.program.name));
  },
});

export const create = mutationGeneric({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    dayOfWeek: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Program name is required.");

    const description = compactOptionalString(args.description);
    const dayOfWeek = compactOptionalString(args.dayOfWeek);

    return await ctx.db.insert("programs", {
      name,
      createdAt: Date.now(),
      ...(description ? { description } : {}),
      ...(dayOfWeek ? { dayOfWeek } : {}),
    });
  },
});

export const remove = mutationGeneric({
  args: { id: v.id("programs") },
  handler: async (ctx, args) => {
    const exercises = await ctx.db
      .query("programExercises")
      .withIndex("by_program", (q) => q.eq("programId", args.id))
      .collect();
    await Promise.all(exercises.map((ex) => ctx.db.delete(ex._id)));
    await ctx.db.delete(args.id);
    return null;
  },
});

export const addExercise = mutationGeneric({
  args: {
    programId: v.id("programs"),
    exercise: v.string(),
    muscleGroup: v.string(),
    sets: v.number(),
    reps: v.number(),
    weightKg: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const exercise = args.exercise.trim();
    if (!exercise) throw new Error("Exercise is required.");

    const existing = await ctx.db
      .query("programExercises")
      .withIndex("by_program", (q) => q.eq("programId", args.programId))
      .collect();

    const notes = compactOptionalString(args.notes);

    return await ctx.db.insert("programExercises", {
      programId: args.programId,
      exercise,
      muscleGroup: args.muscleGroup,
      sets: args.sets,
      reps: args.reps,
      order: existing.length,
      ...(args.weightKg !== undefined ? { weightKg: args.weightKg } : {}),
      ...(notes ? { notes } : {}),
    });
  },
});

export const removeExercise = mutationGeneric({
  args: { id: v.id("programExercises") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
