import mongoose, { Schema, Model } from 'mongoose';
import {
  ILeadDocument,
  LeadStatus,
  LeadSource,
  LeadPriority,
} from '../types';

const leadSchema = new Schema<ILeadDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] satisfies LeadStatus[],
      default: 'new',
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'social_media', 'instagram', 'cold_call', 'email_campaign', 'event', 'other'] satisfies LeadSource[],
      required: [true, 'Lead source is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'] satisfies LeadPriority[],
      default: 'medium',
    },
    value: {
      type: Number,
      min: [0, 'Value cannot be negative'],
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastContactedAt: Date,
    expectedCloseDate: Date,
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1, priority: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdBy: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index(
  { firstName: 'text', lastName: 'text', email: 'text', company: 'text' },
  { name: 'lead_search_index' }
);

export const Lead: Model<ILeadDocument> = mongoose.model<ILeadDocument>('Lead', leadSchema);
