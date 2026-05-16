import mongoose, { Schema, Model } from 'mongoose';
import { IActivityDocument, ActivityType } from '../types';

const activitySchema = new Schema<IActivityDocument>(
  {
    lead: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'task'] satisfies ActivityType[],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    scheduledAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ lead: 1, createdAt: -1 });
activitySchema.index({ user: 1 });

export const Activity: Model<IActivityDocument> = mongoose.model<IActivityDocument>(
  'Activity',
  activitySchema
);
