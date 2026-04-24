import Cookies from 'js-cookie';
import { TENANT } from '@/app/constants/constants';

/**
 * Obtiene los headers necesarios para las requests al API 0km
 */
export function get0kmHeaders(includeAuth = false): HeadersInit {
  const headers: HeadersInit = {
    'x-tenant-subdomain': TENANT,
  };

  if (includeAuth) {
    const token = Cookies.get('admin-auth');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Maneja errores de autenticación
 */
export function handleUnauthorized(router: { push: (path: string) => void }) {
  Cookies.remove('admin-auth');
  router.push('/admin/login');
}

