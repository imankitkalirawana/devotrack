import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import puppeteer, { Browser } from 'puppeteer';
import { sendHTMLEmail } from '@/lib/server-actions/email';
import { LPUAttendanceEmail } from '@/templates/email';
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function isWebsiteReachable(url: string) {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      validateStatus: () => true
    });
    console.log(`Status code: ${response.status}`);
    return true;
  } catch (error) {
    console.error(
      `Error reaching ${url}:`,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return false;
  }
}

export const POST = auth(async function POST(request: any) {
  const { regNo, password, email } = await request.json();

  const isReachable = await isWebsiteReachable('https://ums.lpu.in');
  if (!isReachable) {
    return NextResponse.json(
      { error: 'Unable to connect to UMS' },
      { status: 500 }
    );
  }

  if (!regNo || !password) {
    return NextResponse.json(
      { error: 'Registration number and password are required' },
      { status: 400 }
    );
  }

  let browser: Browser = await puppeteer.launch({
    headless: true, // Set to false for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://ums.lpu.in', ['geolocation']);

    const page = await browser.newPage();

    // Navigate to UMS login page
    await page.goto('https://ums.lpu.in/lpuums/default3.aspx', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Type registration number and handle potential refresh
    await page.type('#txtU', regNo, { delay: 100 }).then(async () => {
      await page.focus('#txtU');
      await page.click('#iBtnLogins150203125');
    });

    // Wait for page to stabilize after potential refresh
    await page
      .waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
      .catch(() => {
        console.log('Page refreshed after entering reg number');
      });

    // Wait for password field to be available after refresh
    await page.waitForSelector('#TxtpwdAutoId_8767', {
      visible: true,
      timeout: 10000
    });

    // Type password
    await page.type('#TxtpwdAutoId_8767', password, { delay: 100 });

    // Click login button with explicit wait
    await Promise.all([
      page.click('#iBtnLogins150203125'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    // Check if login was successful
    const loginError = await page.$('#swal2-html-container');

    if (loginError) {
      const errorText = await page.evaluate((el) => el.textContent, loginError);
      await browser.close();
      //   send email
      await sendHTMLEmail({
        to: email,
        subject: 'Failed to mark attendance',
        html: LPUAttendanceEmail({
          regNo,
          status: 'error',
          message: 'Invalid credentials'
        })
      });
      return NextResponse.json(
        { error: 'Invalid credentials', details: errorText },
        { status: 401 }
      );
    }

    // Open attendance page in new tab
    const attendancePage = await browser.newPage();

    attendancePage.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Set geolocation to avoid permission prompt
    await attendancePage.setGeolocation({
      latitude: 12.9033318,
      longitude: 77.5856633
    });

    // Navigate to attendance page
    await attendancePage.goto(
      'https://ums.lpu.in/lpuums/frmMarkOJTAttendance.aspx',
      {
        waitUntil: 'networkidle2',
        timeout: 30000
      }
    );

    // Wait for the dropdown to be fully loaded and visible
    const dropdownSelector =
      '#ctl00_cphHeading_Repeater1_ctl00_drpdwnAttendance';
    await attendancePage.waitForSelector(dropdownSelector, {
      visible: true,
      timeout: 10000
    });

    // Stabilize the page before interacting (replace waitForTimeout)
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s

    // Select the 'P' (Present) option carefully
    await attendancePage.evaluate(
      (selector, value) => {
        const dropdown = document.querySelector(selector);
        if (dropdown) {
          (dropdown as HTMLSelectElement).value = value;
          const event = new Event('change', { bubbles: true });
          dropdown.dispatchEvent(event);
        }
      },
      dropdownSelector,
      'P'
    );

    //  now click on submit button with id #ctl00_cphHeading_Repeater1_ctl00_btnMarkAtt

    await attendancePage.waitForSelector(
      '#ctl00_cphHeading_Repeater1_ctl00_btnMarkAtt',
      {
        visible: true,
        timeout: 10000
      }
    );

    await attendancePage.click('#ctl00_cphHeading_Repeater1_ctl00_btnMarkAtt');

    await browser.close();

    await sendHTMLEmail({
      to: email,
      subject: 'Check-out successfully',
      html: LPUAttendanceEmail({ regNo, status: 'success' })
    });
    return NextResponse.json(
      { message: 'success: Check-out successful' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    await sendHTMLEmail({
      to: email,
      subject: 'Failed to mark attendance',
      html: LPUAttendanceEmail({
        regNo,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    });
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});
