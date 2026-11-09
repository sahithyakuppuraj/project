import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Goal name is required' }).min(1).max(100).trim(),
    targetAmount: z.number({ required_error: 'Target amount is required' }).min(1, 'Target amount must be at least 1'),
    currentAmount: z.number().min(0, 'Current amount cannot be negative').optional().default(0),
    targetDate: z.string({ required_error: 'Target date is required' }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid target date' }
    ),
    description: z.string().max(300).optional(),
    category: z.string().max(50).optional(),
    status: z.enum(['in_progress', 'completed', 'paused']).optional().default('in_progress'),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    targetAmount: z.number().min(1).optional(),
    currentAmount: z.number().min(0).optional(),
    targetDate: z.string().optional().refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid target date' }
    ),
    description: z.string().max(300).optional(),
    category: z.string().max(50).optional(),
    status: z.enum(['in_progress', 'completed', 'paused']).optional(),
  }),
});

export const addProgressSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }).positive('Contribution amount must be positive'),
  }),
});

