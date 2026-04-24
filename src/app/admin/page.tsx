'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    const authCookie = Cookies.get('admin-auth');

    // Si no hay cookie de autenticación, redirigir a login
    if (!authCookie) {
      router.push('/admin/login');
    } else {
      // Si está autenticado, redirigir al dashboard
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='text-center'
      >
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4'></div>
        <p className='text-gray-600'>Redirigiendo...</p>
      </motion.div>
    </div>
  );
}
