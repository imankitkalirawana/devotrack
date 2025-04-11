import mongoose, { Model } from 'mongoose';

export interface UserType extends Base {
  email: string;
  phone: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

const userSchema = new mongoose.Schema<UserType>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email is invalid'
      ]
    },
    phone: String,
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

const User: Model<UserType> =
  mongoose.models.User || mongoose.model<UserType>('User', userSchema);
export default User;
