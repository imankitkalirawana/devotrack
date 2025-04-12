import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/auth';
import Job from '@/models/Job';
import axios from 'axios';

const apiKey = process.env.CRON_JOB_API_KEY;

export const POST = auth(async function POST(request: any) {
  const { regNo, password, type = 'check-in' } = await request.json();
  const url = 'https://api.cron-job.org/jobs';

  if (!regNo || !password) {
    return NextResponse.json(
      { error: 'Reg No and password are required' },
      { status: 400 }
    );
  }

  try {
    // if (!request?.auth?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = {
      regNo,
      password
    };

    const job = {
      title: `LPU ${type} - ${regNo} - ${request?.auth?.user?.email}`,
      url: `${process.env.NEXTAUTH_URL}/api/v1/lpu/${type}`,
      enabled: true,
      saveResponses: true,
      folderId: 46043,
      requestMethod: 1,
      body: JSON.stringify(body),
      schedule: {
        timezone: 'Asia/Kolkata',
        expiresAt: 0,
        hours: [10],
        mdays: [-1],
        minutes: [0],
        months: [-1],
        wdays: [1, 2, 3, 4, 5]
      }
    };

    const response = await axios.put(
      url,
      {
        job
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status === 200) {
      await connectDB();
      await Job.create({
        title: `LPU ${type} - ${regNo} - ${request?.auth?.user?.email}`,
        enabled: true,
        jobId: response.data.jobId,
        userId: request?.auth?.user?.email
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to create job'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Job created successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
});

export const PUT = auth(async function PUT(request: any) {
  const data = await request.json();

  if (!data.jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const url = `https://api.cron-job.org/jobs/${data.jobId}`;

  //   return NextResponse.json({ message: 'Job updated successfully' });

  try {
    const response = await axios.patch(
      url,
      {
        job: data
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      await connectDB();
      await Job.updateOne({ jobId: data.jobId }, { $set: data });
      return NextResponse.json({ message: 'Job updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(request: any) {
  const { jobId } = await request.json();

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }
  const url = `https://api.cron-job.org/jobs/${jobId}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      await Job.deleteOne({ jobId });
      return NextResponse.json({ message: 'Job deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
});
