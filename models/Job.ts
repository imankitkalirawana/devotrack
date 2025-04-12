import mongoose, { Model } from 'mongoose';

interface JobType extends Base {
  name: string;
  jobId: number;
  enabled: boolean;
  userId: mongoose.Types.ObjectId;
}

const jobSchema = new mongoose.Schema<JobType>(
  {
    name: { type: String },
    jobId: { type: Number },
    enabled: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model<JobType>('Job', jobSchema);

export default Job;
