import { Schema, model, Document, Types } from 'mongoose';

export interface ICategoryBudget {
  category: string;
  amount: number;
}

export interface IBudget extends Document {
  userId: Types.ObjectId;
  month: number; // 1 - 12
  year: number; // e.g. 2025
  totalBudget: number;
  categoryBudgets: ICategoryBudget[];
  createdAt: Date;
  updatedAt: Date;
}

const categoryBudgetSchema = new Schema<ICategoryBudget>(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Category budget cannot be negative'],
    },
  },
  { _id: false }
);

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100,
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [0, 'Total budget cannot be negative'],
    },
    categoryBudgets: {
      type: [categoryBudgetSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// One budget document per user per month and year
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export const Budget = model<IBudget>('Budget', budgetSchema);

