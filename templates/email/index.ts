import { APP_INFO } from '@/lib/config';
import { UserType } from '@/models/User';
import { format } from 'date-fns';

export function WelcomeUser(user: UserType) {
  return `
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to ${APP_INFO.name}</title>
            <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .flex {
                display: flex;
            }
            .justify-center {
                justify-content: center;
            }
            .icon {
                width: 180px;
                height: 180px;
                margin: 20px auto;
            }
            .heading {
                font-size: 32px;
                line-height: 1.1;
                margin: 40px 0;
                color: #1d1d1f;
                text-align: center;
            }
            .highlight {
                background-color: #fef6d6;
                padding: 0 4px;
            }
            .description {
                font-size: 16px;
                line-height: 1.4;
                color: #1d1d1f;
                margin: 20px auto;
                max-width: 750px;
                margin-bottom: 40px;
                text-align: center;
            }
            .link {
                text-decoration: none;
                color: #1255CC;
            }
            .link:hover {
                text-decoration: underline;
            }
            .learn-more:hover {
                text-decoration: underline;
            }
            .overview {
                font-size: 12px;
                color: #1d1d1f;
                margin-top: 40px;
                text-align: center;
            }
            </style>
        </head>
        <body>
            <div class="flex justify-center">
                <img
                class="icon"
                src="${APP_INFO.url}logo.png"
                alt="App Logo"
                />
            </div>

            <h1 class="heading">Welcome to ${APP_INFO.name}, ${user.name}!</h1>

            <p class="description">
            Your account has been created for ${APP_INFO.name}, you can now explore the platform.
            </p>
            <p class="description">
            We are excited to have you onboard. If you have any questions or need
            assistance, please feel free to reach out to us.
            </p>
            <p class="description">
            Please use your email <strong>${user.email}</strong> to <a class="link href="${APP_INFO.url}auth/login">login</a>.
            </p>
            <p class="overview">
            You are getting this email because you have registered with ${APP_INFO.name}
            </p>
        </body>
    </html>
`;
}

export function OtpEmail(otp: number) {
  return `<html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to ${APP_INFO.name}</title>
            <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .flex {
                display: flex;
            }
            .justify-center {
                justify-content: center;
            }
            .icon {
                width: 180px;
                height: 180px;
                margin: 20px auto;
                object-fit: contain;
            }
            .heading {
                font-size: 32px;
                line-height: 1.1;
                margin: 40px 0;
                color: #1d1d1f;
                text-align: center;
            }
            .highlight {
                background-color: #fef6d6;
                padding: 0 4px;
            }
            .description {
                font-size: 16px;
                line-height: 1.4;
                color: #1d1d1f;
                margin: 20px auto;
                max-width: 750px;
                margin-bottom: 40px;
                text-align: center;
            }
            .code {
              padding: 8px 12px;
              background: #F6F6F6;
              width: 100%;
              border-radius: 5px;
              font-weight: 700;
              text-align: center;
            }
            .btn {
                text-decoration: none;
                font-size: 16px;
                margin-top: 20px;
                display: inline-block;
                border-radius: 50px;
                padding: 8px 16px;
            }
            .btn-primary {
                background-color: #1f6439;
                color: #fff;
            }
            .learn-more:hover {
                text-decoration: underline;
            }
            .overview {
                font-size: 12px;
                color: #1d1d1f;
                margin-top: 40px;
                text-align: center;
            }
            </style>
        </head>
        <body>
            <div class="flex justify-center">
                <img
                class="icon"
                src="${APP_INFO.url}logo.png"
                alt="App Logo"
                />
            </div>

            <h1 class="heading">Verify your email to sign up for ${APP_INFO.name}!</h1>

            <p class="description">
            We have received a sign-up attempt from <strong>${APP_INFO.name}</strong>
            </p>
            <p class="description">
            To complete the sign-up process; enter the 4-digit code in the original window:
            </p>
            <p class="code">
            ${otp}
            </p>
            <p class="overview">
            Please ignore if you haven't requested this code.
            </p>
        </body>
    </html>`;
}
export function LPUAttendanceEmail({
  regNo,
  status,
  message
}: {
  regNo: number;
  status: 'success' | 'error';
  message?: string;
}) {
  const Map = {
    success: {
      heading: 'Attendance marked!',
      description: `Your OJT attendance has been marked successfully. (${regNo})`,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#57B94A" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-5.97-3.03a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47l2.235-2.235L14.97 8.97a.75.75 0 0 1 1.06 0" clip-rule="evenodd"/></svg>'
    },
    error: {
      heading: 'Attendance could not be marked!',
      description: `Your OJT attendance could not be marked. (${regNo})`,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#E14141" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 0 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 0 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06" clip-rule="evenodd"/></svg>'
    }
  };

  return `<html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to ${APP_INFO.name}</title>
            <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .flex {
                display: flex;
            }
            .justify-center {
                justify-content: center;
            }
            .icon {
                width: 180px;
                height: 180px;
                margin: 20px auto;
                object-fit: contain;
            }
            .heading {
                font-size: 32px;
                line-height: 1.1;
                margin: 40px 0;
                color: #1d1d1f;
                text-align: center;
            }
              .heading-icon{
              	margin-left: 10px;
              padding-top: 10px;
              width: 24px;
              color: green;
              }
            .highlight {
                background-color: #fef6d6;
                padding: 0 4px;
            }
            .description {
                font-size: 16px;
                line-height: 1.4;
                color: #1d1d1f;
                margin: 20px auto;
                max-width: 750px;
                margin-bottom: 40px;
                text-align: center;
            }
            .code {
              padding: 8px 12px;
              background: #F6F6F6;
              width: 100%;
              border-radius: 5px;
              font-weight: 700;
              text-align: center;
            }
            .btn {
                text-decoration: none;
                font-size: 16px;
                margin-top: 20px;
                display: inline-block;
                border-radius: 50px;
                padding: 8px 16px;
            }
            .btn-primary {
                background-color: #1f6439;
                color: #fff;
            }
            .learn-more:hover {
                text-decoration: underline;
            }
            .overview {
                font-size: 12px;
                color: #1d1d1f;
                margin-top: 40px;
                text-align: center;
            }
            </style>
        </head>
        <body>
            <div class="flex justify-center">
                <img
                class="icon"
                src="${APP_INFO.url}logo.png"
                alt="App Logo"
                />
            </div>

            <h1 class="heading">
              ${Map[status].icon}
              ${Map[status].heading}
            </h1>

            <p class="description">
              ${Map[status].description}
            </p>
            <p class="description">
            ${format(new Date(), 'PPPp')}
            </p>
            <p class="description">
            ${message}
            </p>
        </body>
    </html>`;
}
