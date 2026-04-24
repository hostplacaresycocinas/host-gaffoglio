'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, History } from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Agregar el CSS de Cropper.js dinámicamente
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css';
    document.head.appendChild(link);

    // Verificar la cookie de autenticación
    const authCookie = Cookies.get('admin-auth');

    // Si estamos en la página de login, no redirigir
    if (pathname === '/admin/login') {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    // Si no hay cookie y no estamos en login, redirigir a login
    if (!authCookie && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (authCookie) {
      // Si hay cookie, estamos autenticados
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [router, pathname]);

  const handleLogout = () => {
    Cookies.remove('admin-auth');
    router.push('/admin/login');
  };

  // Si está cargando, mostrar un spinner
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  // Si no está autenticado y estamos en login, mostrar el contenido sin el layout
  if (!isAuthenticated && pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Si no está autenticado y no estamos en login, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Layout normal para usuarios autenticados
  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow-sm flex justify-center'>
        <div className='max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <span className='text-xl font-bold text-color-primary-admin'>
                  Admin Panel
                </span>
              </div>
              <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                <Link
                  href='/admin/dashboard'
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium ${
                    pathname === '/admin/dashboard'
                      ? 'border-color-primary-admin text-color-text'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <LayoutDashboard className='w-5 h-5 mr-1' />
                  Dashboard
                </Link>
                <Link
                  href='/admin/historial'
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium ${
                    pathname === '/admin/historial'
                      ? 'border-color-primary-admin text-color-text'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <History className='w-5 h-5 mr-1' />
                  Historial
                </Link>
              </div>
            </div>
            <div className='flex items-center'>
              <button
                onClick={handleLogout}
                className='inline-flex items-center px-3 py-2 border border-transparent text-base font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none'
              >
                <LogOut className='w-5 h-5 mr-1' />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className='pb-16 flex justify-center'>
        <div className='max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
          {children}
        </div>
      </main>
    </div>
  );
}
