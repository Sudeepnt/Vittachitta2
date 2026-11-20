import { redirect } from 'next/navigation';
import { isAdmin, authConfigured } from '../../../lib/cms/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLogin() {
  if (await isAdmin()) redirect('/adminvct/dashboard');
  return <LoginForm configured={authConfigured()} />;
}
