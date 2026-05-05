import { redirect } from 'next/navigation';

export default function Home() {
  // In a real app, check if user is logged in first
  redirect('/dashboard');
}
