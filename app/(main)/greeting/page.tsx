'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserGreetingForm from '@/components/form/UserGreetingForm';

const ALLOWED_ROLES = ['adopter', 'provider'];

export default function GreetingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const roleName = session?.user?.role?.name;

  // Redirect if not authenticated or not an allowed role
  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!session) {
      router.push('/login');
    } else if (!roleName || !ALLOWED_ROLES.includes(roleName)) {
      router.push('/dashboard');
    }
  }, [session, status, router, roleName]);

  // Render loading state until authentication and authorization are confirmed.
  if (status !== 'authenticated' || !roleName || !ALLOWED_ROLES.includes(roleName)) {
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
            {roleName === 'provider'
              ? 'Let us know where your shelter is located.'
              : 'This will help us find the perfect companion for you.'}
          </p>
        </div>

        <section className="flex flex-col gap-10 justify-center">
          <UserGreetingForm role={roleName as 'adopter' | 'provider'} />
        </section>
      </div>
    </div>
  );
}