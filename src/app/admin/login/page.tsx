'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { API_BASE_URL, TENANT } from '@/app/constants/constants';

// URL base del API

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Usar username en lugar de email para coincidir con el API
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      // URL correcta del endpoint de login
      const response = await fetch(
        `${API_BASE_URL}/api/admin/login?tenant=${TENANT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          // Enviar username y password exactamente como espera el API
          body: JSON.stringify({ username, password }),
        }
      );

      // Obtener la respuesta como texto para depuración
      const responseText = await response.text();

      let data;
      try {
        // Intentar parsear la respuesta como JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parseando la respuesta:', parseError);
        throw new Error('La respuesta del servidor no es un JSON válido');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token en cookies
      Cookies.set('admin-auth', data.token, { expires: 7 });

      // También guardar información de usuario si está disponible
      if (data.user) {
        Cookies.set('admin-user', JSON.stringify(data.user), { expires: 7 });
      }

      // Redirigir al dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='min-h-screen flex items-center justify-center bg-gray-300'>
        <div className='w-full max-w-md'>
          <div className='bg-gradient-to-b from-neutral-900 to-black rounded-md border border-neutral-800 [box-shadow:0_0_10px_rgba(0,0,0,0.1)] px-10 py-14'>
            <h2 className='text-2xl font-semibold text-color-title-light mb-8'>
              Panel de Administración
            </h2>

            <form onSubmit={handleSubmit}>
              <div className='space-y-5'>
                <div>
                  <label
                    htmlFor='username'
                    className='block text-base font-medium text-color-text-light mb-2'
                  >
                    Usuario
                  </label>
                  <input
                    id='username'
                    name='username'
                    type='text'
                    autoComplete='username'
                    required
                    className='w-full px-4 py-3 bg-black border border-neutral-800 rounded-md text-color-text-light focus:outline-none focus:ring-1 focus:ring-color-primary focus:border-color-primary text-base'
                    placeholder='Ingresa tu usuario'
                  />
                </div>

                <div>
                  <label
                    htmlFor='password'
                    className='block text-base font-medium text-color-text-light mb-2'
                  >
                    Contraseña
                  </label>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    required
                    className='w-full px-4 py-3 bg-black border border-neutral-800 rounded-md text-color-text-light focus:outline-none focus:ring-1 focus:ring-color-primary focus:border-color-primary text-base'
                    placeholder='Ingresa tu contraseña'
                  />
                </div>
              </div>

              {error && (
                <div className='mt-5 text-base text-red-600'>{error}</div>
              )}

              <div className='mt-8'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full py-3 bg-color-primary-admin hover:bg-color-primary-dark-admin text-white font-medium rounded-md transition-colors text-base disabled:opacity-70'
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
