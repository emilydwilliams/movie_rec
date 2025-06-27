import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="w-full bg-white shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  Family Movie Night
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <Outlet />
        </div>
      </main>

      <footer className="w-full bg-white border-t mt-auto">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Family Movie Night. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 