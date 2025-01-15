import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export const Navigation = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">STEAMS</span>
            </Link>
            
            {session && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/learning-paths" className="nav-link">
                  Learning Paths
                </Link>
                <Link href="/progress" className="nav-link">
                  Progress
                </Link>
                <Link href="/messages" className="nav-link">
                  Messages
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
