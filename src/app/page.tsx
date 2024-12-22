import { redirect } from 'next/navigation';

export default async function HomePage() {
  redirect('/login');
  
  // This line will never be reached, but TypeScript needs a return statement
  return null;
} 