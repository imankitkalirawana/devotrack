'use server';

import { APP_INFO } from '@/lib/config';
import Otp from '@/models/Otp';
import User from '@/models/User';
import { connectDB } from '../db';
import { generateOtp } from '../functions';
import { sendHTMLEmail } from './email';
import { OtpEmail, WelcomeUser } from '@/templates/email';
import bcrypt from 'bcryptjs';

export const sendOTP = async ({
  email,
  type = 'registration'
}: {
  email: string;
  type?: 'registration' | 'forgot-password';
}) => {
  if (type === 'forgot-password') {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email not found!');
    }
  }

  if (type === 'registration') {
    const user = await User.findOne({ email });
    if (user) {
      throw new Error('Email already exists!');
    }
  }

  const otp = generateOtp();
  await connectDB();
  const res = await Otp.findOne({ id: email });

  if (res) {
    if (res.otpCount >= 3) {
      throw new Error('Too many OTP requests');
    }
    await Otp.updateOne({ id: email }, { otp, otpCount: res.otpCount + 1 });
  } else {
    await Otp.create({ id: email, otp });
  }

  const emailTasks = [
    sendHTMLEmail({
      to: email,
      subject: `${otp} - ${APP_INFO.name} ${type === 'forgot-password' ? 'Reset Password' : 'Verification'}`,
      html: OtpEmail(otp)
    })
  ];

  Promise.all(emailTasks);

  return true;
};

export const verifyOTP = async ({
  email,
  otp
}: {
  email: string;
  otp: number;
}) => {
  const res = await Otp.findOne({ id: email, otp });

  if (!res) {
    throw new Error('Invalid OTP');
  }
  await Otp.deleteOne({ id: email, otp });
  return true;
};

export const updatePassword = async ({
  email,
  password
}: {
  email: string;
  password: string;
}) => {
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not Found');
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  await user.save();
  return true;
};

export const register = async ({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}) => {
  await connectDB();
  const user = await User.findOne({ email });
  if (user) {
    throw new Error('Email already exists!');
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({ email, password: hashedPassword, name }).then(
    async (user) => {
      const emailTasks = [
        sendHTMLEmail({
          to: email,
          subject: `Welcome to ${APP_INFO.name}`,
          html: WelcomeUser(user)
        })
      ];
      Promise.all(emailTasks);
    }
  );
  return true;
};
