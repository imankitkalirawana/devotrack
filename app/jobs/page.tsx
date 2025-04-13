import { auth } from '@/auth';
import Jobs from '@/components/jobs';

export default async function JobsPage() {
  const session = await auth();

  return <Jobs session={session} />;
}
