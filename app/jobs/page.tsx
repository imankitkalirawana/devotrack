import { auth } from '@/auth';
import Jobs from '@/components/jobs';
import { redirect } from 'next/navigation';

export default async function JobsPage() {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  return <Jobs session={session} />;
}
