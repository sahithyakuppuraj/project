import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be greater than zero'),
    type: z.enum(['income', 'expense'], {
      required_error: 'Type must be either income or expense',
    }),
    category: z
      .string({ required_error: 'Category is required' })
      .min(1, 'Category cannot be empty')
      .trim(),
    description: z
      .string({ required_error: 'Description is required' })
      .min(1, 'Description is required')
      .max(200, 'Description cannot exceed 200 characters')
      .trim(),
    date: z.string().optional().refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be greater than zero').optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().min(1).trim().optional(),
    description: z.string().min(1).max(200).trim().optional(),
    date: z.string().optional().refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ),
    notes: z.string().max(500).optional(),
  }),
});

