'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserGreetingForm from '@/components/form/UserGreetingForm';

export default function GreetingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not an adopter
  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!session) {
      router.push('/login');
    } else if (session.user?.role?.name !== 'adopter') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Render loading state until authentication and authorization are confirmed.
  if (status !== 'authenticated' || session.user?.role?.name !== 'adopter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tell us about yourself{' '}
            <span className="font-black">{session?.user?.name}</span>!
          </h1>

          <p className="text-xl text-gray-600">
            This will help us find the perfect companion for you.
          </p>
        </div>

        <section className="flex flex-col gap-10 justify-center">
          <UserGreetingForm />
        </section>
      </div>
    </div>
  );
}