import { redirect } from 'next/navigation';

export default function AdminIndex() {
  // Redirect to dashboard by default
  redirect('/admin/dashboard');
}
