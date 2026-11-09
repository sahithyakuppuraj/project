import { z } from 'zod';

export const setBudgetSchema = z.object({
  body: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    totalBudget: z.number().min(0, 'Total budget must be a positive number'),
    categoryBudgets: z
      .array(
        z.object({
          category: z.string().min(1, 'Category name required'),
          amount: z.number().min(0, 'Category budget cannot be negative'),
        })
      )
      .optional()
      .default([]),
  }),
});

