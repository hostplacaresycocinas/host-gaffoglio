'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { company } from '../constants/constants';

const Footer = () => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <footer className='bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='text-lg font-semibold mb-4'>{company.name}</h3>
            <p className='text-gray-400'>{company.footer}</p>
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-4'>Enlaces Rápidos</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href='/autos'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  Vehículos
                </Link>
              </li>
              <li>
                <Link
                  href='/nosotros'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href='/contacto'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-4'>Contacto</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>Dirección: {company.adress}</li>
              <li>Teléfono: {company.whatsapp}</li>
              <li>Email: {company.email}</li>
            </ul>
          </div>
        </div>
        <div className='mt-8 pt-8 border-t border-gray-800 text-center text-gray-400'>
          <p>
            &copy; {new Date().getFullYear()} {company.name}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
