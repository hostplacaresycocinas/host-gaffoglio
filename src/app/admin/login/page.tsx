'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { API_BASE_URL, TENANT } from '@/app/constants/constants';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/login?tenant=${TENANT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ username, password }),
        },
      );

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parseando la respuesta:', parseError);
        setError('La respuesta del servidor no es válida');
        return;
      }

      if (!response.ok) {
        setError(data?.error || 'Error al iniciar sesión');
        return;
      }

      Cookies.set('admin-auth', data.token, { expires: 7 });

      if (data.user) {
        Cookies.set('admin-user', JSON.stringify(data.user), { expires: 7 });
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    'mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-color-primary-admin focus:ring-1 focus:ring-color-primary-admin transition-colors';

  return (
    <div className='min-h-screen bg-neutral-300 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.08)] py-8 px-6 sm:py-12 sm:px-8 md:py-16 md:px-10'>
          <h1 className='text-xl sm:text-2xl font-bold text-color-primary-admin mb-1'>
            Admin Panel
          </h1>
          <p className='text-gray-500 text-sm sm:text-base mb-6 sm:mb-8'>
            Iniciá sesión para gestionar los vehículos
          </p>

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700'
              >
                Usuario
              </label>
              <input
                id='username'
                name='username'
                type='text'
                autoComplete='username'
                required
                className={inputStyles}
                placeholder='Ingresá tu usuario'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Contraseña
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className={inputStyles}
                placeholder='Ingresá tu contraseña'
              />
            </div>

            {error && (
              <div className='text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 px-4 bg-color-primary-admin hover:bg-color-primary-dark-admin text-white font-medium rounded-lg transition-colors text-base disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-color-primary-admin focus:ring-offset-2'
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
