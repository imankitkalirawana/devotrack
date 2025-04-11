'use client';
import { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button, Link, Input, InputOtp, addToast } from '@heroui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signIn } from 'next-auth/react';
import React from 'react';

import Logo from '../ui/logo';
import { useQueryState } from 'nuqs';
import { register, sendOTP, verifyOTP } from '@/lib/server-actions/auth';

export default function Register() {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useQueryState('email');
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: email ?? '',
      otp: '',
      password: '',
      confirmPassword: '',
      isChecked: false
    },
    onSubmit: async (values) => {
      if (!values.otp) {
        await sendOTP({ email: values.email, type: 'registration' })
          .then(() => {
            setIsOtpSent(true);
          })
          .catch((error) => {
            console.error(error);
            formik.setFieldError('email', error.message);
          });
      } else {
        await verifyOTP({ email: values.email, otp: parseInt(values.otp) })
          .then(() => {
            setIsVerified(true);
          })
          .catch((error) => {
            console.error(error);
            formik.setFieldError('otp', error.message);
          });
      }
    }
  });

  const resendOtp = async () => {
    setIsResendingOtp(true);
    await sendOTP({ email: formik.values.email, type: 'registration' })
      .then(() => {
        addToast({
          title: 'Verification code sent to your email',
          color: 'success'
        });
        setIsOtpSent(true);
      })
      .catch((error) => {
        console.log(error);
        formik.setFieldError('otp', error.message);
      })
      .finally(() => {
        setIsResendingOtp(false);
      });
  };

  return (
    <>
      <div className="mt-12 flex h-full w-full flex-col items-center justify-center">
        <div className="mt-2 flex w-full max-w-sm flex-col justify-center gap-4 rounded-large bg-content1 px-8 py-6 shadow-small">
          <div className="flex flex-col items-center pb-4">
            <Logo />
            <p className="text-center text-small text-default-500">
              {isVerified
                ? 'Enter your details to continue'
                : isOtpSent
                  ? `We have send a verification code to ${formik.values.email}`
                  : 'Enter your email to register'}
            </p>
          </div>
          {isVerified ? (
            <DetailForm />
          ) : (
            <form onSubmit={formik.handleSubmit}>
              {!isOtpSent && (
                <Input
                  label="Email"
                  name="email"
                  variant="bordered"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    formik.setFieldValue('email', e.target.value);
                  }}
                  value={formik.values.email}
                  isInvalid={
                    formik.touched.email && formik.errors.email ? true : false
                  }
                  errorMessage={formik.errors.email}
                />
              )}
              {isOtpSent && (
                <>
                  <div className="mb-2 flex flex-col items-center justify-center">
                    <InputOtp
                      length={4}
                      name="otp"
                      value={formik.values.otp}
                      onValueChange={(value) =>
                        formik.setFieldValue('otp', value)
                      }
                      autoFocus
                      onComplete={() => formik.handleSubmit()}
                      isInvalid={
                        formik.touched.otp && formik.errors.otp ? true : false
                      }
                      errorMessage={formik.errors.otp}
                    />
                    <div className="mt-4 flex flex-col items-center justify-between px-1 py-2 text-small text-default-500">
                      <p>Didn&apos;t receive the code?</p>
                      <Button
                        variant="light"
                        size="sm"
                        color="primary"
                        onPress={resendOtp}
                        isLoading={isResendingOtp}
                      >
                        Resend Code
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {!isVerified && (
                <Button
                  color="primary"
                  type="submit"
                  isLoading={formik.isSubmitting}
                  fullWidth
                  className="mt-4"
                >
                  {isOtpSent ? 'Verify' : 'Send OTP'}
                </Button>
              )}
            </form>
          )}

          <p className="text-center text-small">
            Already have an account?&nbsp;
            <Link href={`/auth/login?email=${email}`} size="sm">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

const DetailForm = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);
  const [email, setEmail] = useQueryState('email');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: email ?? '',
      password: '',
      confirmPassword: '',
      isChecked: false
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Name is required')
        .min(3, "Name can't be less than 3 characters")
        .max(50, "Name can't be more than 50 characters"),
      email: Yup.string().required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters long')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .required('Please retype your password.')
        .oneOf([Yup.ref('password')], 'Your passwords do not match.')
    }),
    onSubmit: async (values) => {
      try {
        await register(values)
          .then(async () => {
            await signIn('credentials', {
              email: values.email,
              password: values.password,
              redirect: true,
              callbackUrl: '/dashboard'
            });
          })
          .catch((error) => {
            addToast({
              title: error.message,
              color: 'danger'
            });
            console.error(error);
          });
      } catch (error: any) {
        addToast({
          title: error.message,
          color: 'danger'
        });
        console.error(error);
      }
    }
  });

  console.log(formik.errors);

  return (
    <>
      <form className="flex flex-col gap-3" onSubmit={formik.handleSubmit}>
        <Input
          label="Email"
          name="email"
          variant="bordered"
          onChange={(e) => {
            formik.setFieldValue('email', e.target.value);
          }}
          value={formik.values.email}
          isInvalid={formik.touched.email && formik.errors.email ? true : false}
          errorMessage={formik.errors.email}
          className="sr-only"
        />
        <Input
          label="Name"
          name="name"
          placeholder="Enter your name"
          type="text"
          variant="bordered"
          onChange={formik.handleChange}
          value={formik.values.name}
          isInvalid={formik.touched.name && formik.errors.name ? true : false}
          errorMessage={formik.errors.name}
        />

        <Input
          endContent={
            <button type="button" onClick={toggleVisibility}>
              {isVisible ? (
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon="solar:eye-closed-linear"
                />
              ) : (
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon="solar:eye-bold"
                />
              )}
            </button>
          }
          label="Password"
          name="password"
          placeholder="Enter your password"
          type={isVisible ? 'text' : 'password'}
          variant="bordered"
          onChange={formik.handleChange}
          value={formik.values.password}
          isInvalid={
            formik.touched.password && formik.errors.password ? true : false
          }
          errorMessage={formik.errors.password}
        />
        <Input
          endContent={
            <button type="button" onClick={toggleConfirmVisibility}>
              {isConfirmVisible ? (
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon="solar:eye-closed-linear"
                />
              ) : (
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon="solar:eye-bold"
                />
              )}
            </button>
          }
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm your password"
          type={isConfirmVisible ? 'text' : 'password'}
          variant="bordered"
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
          isInvalid={
            formik.touched.confirmPassword && formik.errors.confirmPassword
              ? true
              : false
          }
          errorMessage={formik.errors.confirmPassword}
        />
        <Button color="primary" type="submit" isLoading={formik.isSubmitting}>
          Register
        </Button>
      </form>
    </>
  );
};
