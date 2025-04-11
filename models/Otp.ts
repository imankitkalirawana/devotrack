import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  otp: {
    type: Number,
    required: true
  },
  otpCount: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600
  }
});

const Otp = mongoose.models.otps || mongoose.model('otps', otpSchema);
export default Otp;
