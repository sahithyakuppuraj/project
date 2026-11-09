import { Schema, model, Document, Types } from 'mongoose';

export type GoalStatus = 'in_progress' | 'completed' | 'paused';

export interface IFinancialGoal extends Document {
  userId: Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  category?: string;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const financialGoalSchema = new Schema<IFinancialGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General Savings',
    },
    status: {
      type: String,
      enum: {
        values: ['in_progress', 'completed', 'paused'],
        message: 'Invalid goal status',
      },
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

financialGoalSchema.index({ userId: 1, status: 1 });

export const FinancialGoal = model<IFinancialGoal>('FinancialGoal', financialGoalSchema);

