import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { MongoClient } from 'mongodb';
import axios from 'axios';
import { encrypt } from '@/lib/crypto';

const apiKey = process.env.CRON_JOB_API_KEY;

export const GET = auth(async function GET(request: any) {
  if (!request?.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const client = new MongoClient(process.env.MONGO_URL || '');
    await client.connect();
    const db = client.db(process.env.DB_NAME || '');
    const jobsCollection = db.collection('jobs');
    const jobs = await jobsCollection
      .find({ userId: request?.auth?.user?.email })
      .toArray();
    await client.close();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
});

export const POST = auth(async function POST(request: any) {
  if (!request?.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  const url = 'https://api.cron-job.org/jobs';

  if (!data.body.regNo || !data.body.password) {
    return NextResponse.json(
      { error: 'Reg No and password are required' },
      { status: 400 }
    );
  }

  try {
    const body = {
      regNo: data.body.regNo,
      password: encrypt(data.body.password),
      email: request?.auth?.user?.email
    };

    // return NextResponse.json({ message: 'Job created successfully' });

    const title = data.title
      ? `${data.title} - ${request?.auth?.user?.email}`
      : `${data.automation} - ${data.body.regNo} - ${request?.auth?.user?.email}`;

    const job = {
      title,
      enabled: true,
      saveResponses: true,
      url: data.url,
      folderId: parseInt(process.env.FOLDER_ID || '0'),
      schedule: data.schedule,
      extendedData: {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      },
      requestTimeout: 120000
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
      const client = new MongoClient(process.env.MONGO_URL || '');
      await client.connect();
      const db = client.db(process.env.DB_NAME || '');
      const jobCollection = db.collection('jobs');
      await jobCollection.insertOne({
        ...job,
        jobId: response.data.jobId,
        userId: request?.auth?.user?.email
      });
      await client.close();
    } else {
      return NextResponse.json(
        {
          error: 'Failed to create automation'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Automation created successfully' });
  } catch (error) {
    // console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
});

export const PUT = auth(async function PUT(request: any) {
  if (!request?.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  if (!data.jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const url = `https://api.cron-job.org/jobs/${data.jobId}`;

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
      const client = new MongoClient(process.env.MONGO_URL || '');
      await client.connect();
      const db = client.db(process.env.DB_NAME || '');
      const jobCollection = db.collection('jobs');
      await jobCollection.updateOne({ jobId: data.jobId }, { $set: data });
      await client.close();
      return NextResponse.json({ message: 'Job updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(request: any) {
  if (!request?.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      const client = new MongoClient(process.env.MONGO_URL || '');
      await client.connect();
      const db = client.db(process.env.DB_NAME || '');
      const jobCollection = db.collection('jobs');
      await jobCollection.deleteOne({ jobId });
      await client.close();
      return NextResponse.json({ message: 'Job deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
});
