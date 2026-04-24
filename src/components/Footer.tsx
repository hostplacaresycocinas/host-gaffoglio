'use client';

import { navigation } from '@/app/constants/constants';
import { company } from '@/app/constants/constants';

import Image from 'next/image';
import InstagramIcon from './icons/InstagramIcon';
import FacebookIcon from './icons/FacebookIcon';

import Link from 'next/link';
import LocationIcon from './icons/LocationIcon';
import WhatsappFillIcon from './icons/WhatsappFillIcon';
import EmailFillIcon from './icons/EmailFillIcon';
import OnlymotorsLogo from './icons/OnlymotorsLogo';

const Footer = () => {
  return (
    <div className='relative'>
      <footer
        id='contactoSection'
        className='bg-color-bg-secondary-dark text-white relative overflow-hidden border-t border-white/10'
      >
        {/* Borde superior con gradiente */}
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

        {/* Overlay decorativo */}
        <div className='absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70'></div>
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/20'></div>

        {/* Fondo sutil adicional para diferenciación */}
        <div className='absolute inset-0 bg-white/[0.02]'></div>

        <div className='relative z-10'>
          {/* Sección principal */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-16 md:py-24 lg:py-32'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
              {/* Columna 1 - Logo y descripción */}
              <div className='lg:col-span-2'>
                <div className='mb-6'>
                  <div className='w-48 sm:w-52 md:w-56 h-14 md:h-16'>
                    <Image
                      className='w-full h-full object-contain object-left'
                      src='/assets/company/logo.webp'
                      alt={`${company.name} logo`}
                      width={288}
                      height={72}
                    />
                  </div>
                </div>

                <p className='text-white/80 text-sm lg:text-base mb-8 max-w-md leading-relaxed'>
                  Concesionaria multimarca en Sáenz Peña, Chaco.
                  <br />
                  Autos 0km y usados seleccionados.
                </p>

                {/* Redes sociales */}
                <div className='flex gap-4'>
                  {company.instagram && (
                    <a
                      href={`https://www.instagram.com/${company.instagram}/`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10'
                    >
                      <InstagramIcon className='w-5 h-5 text-white' />
                    </a>
                  )}
                  {company.facebook && (
                    <a
                      href={`${company.facebook}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10'
                    >
                      <FacebookIcon className='w-5 h-5 text-white' />
                    </a>
                  )}
                  {company.whatsapp && (
                    <a
                      href={`https://api.whatsapp.com/send?phone=549${company.whatsapp[0]}&text=Hola! Quería hacer una consulta`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10'
                    >
                      <WhatsappFillIcon className='w-5 h-5 text-white' />
                    </a>
                  )}
                </div>
              </div>

              {/* Columna 2 - Navegación */}
              <div>
                <div className='inline-flex items-center gap-3 mb-6'>
                  <div className='w-7 h-px bg-white/60' />
                  <h4 className='text-white/90 font-semibold text-lg'>
                    Navegación
                  </h4>
                </div>
                <ul className='space-y-3'>
                  {navigation.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={`${link.url}`}
                        className='text-white/80 hover:text-white transition-colors duration-300 text-sm lg:text-base relative group inline-block'
                      >
                        <span className='relative'>
                          {link.title}
                          <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full'></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Columna 3 - Contacto */}
              <div>
                <div className='inline-flex items-center gap-3 mb-6'>
                  <div className='w-7 h-px bg-white/60' />
                  <h4 className='text-white/90 font-semibold text-lg'>
                    Contacto
                  </h4>
                </div>

                <div className='flex flex-col gap-3'>
                  {/* Dirección */}
                  {(company.adress || company.city) && (
                    <div className='flex items-start gap-3'>
                      <LocationIcon className='w-6 h-6 text-white/60 mt-0.5 flex-shrink-0' />
                      {company.googlemapsLink &&
                      company.googlemapsLink !== 'null' &&
                      company.googlemapsLink !== '' ? (
                        <Link
                          href={company.googlemapsLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-white/70 hover:text-white transition-colors duration-300 text-sm lg:text-base leading-relaxed'
                        >
                          <span>{company.adress && `${company.adress}, `}</span>
                          <span>{company.city && `${company.city}`}</span>
                        </Link>
                      ) : (
                        <span className='text-white/70 text-sm lg:text-base leading-relaxed'>
                          {company.adress && `${company.adress}, `}
                          {company.city && `${company.city}`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* WhatsApp */}
                  {company.whatsapp && (
                    <div className='flex flex-col gap-3'>
                      {company.whatsapp.map((whatsappNumber, idx) => (
                        <a
                          key={idx}
                          href={`https://api.whatsapp.com/send?phone=549${whatsappNumber}&text=Hola! Quería hacer una consulta`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300'
                        >
                          <WhatsappFillIcon className='w-6 h-6 text-white/60 flex-shrink-0' />
                          <span className='text-sm lg:text-base'>
                            {whatsappNumber}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Instagram */}
                  {company.instagram && (
                    <div className='flex items-center gap-3'>
                      <InstagramIcon className='w-6 h-6 text-white/60 flex-shrink-0' />
                      <a
                        href={`https://www.instagram.com/${company.instagram}/`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-white/70 hover:text-white transition-colors duration-300 text-sm lg:text-base'
                      >
                        @{company.instagram}
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {company.email && (
                    <div className='flex items-center gap-3'>
                      <EmailFillIcon className='w-6 h-6 text-white/60 flex-shrink-0' />
                      <a
                        href={`mailto:${company.email}`}
                        className='text-white/70 hover:text-white transition-colors duration-300 text-sm lg:text-base'
                      >
                        {company.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección inferior */}
          <div className='border-t border-white/10 backdrop-blur-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-8 pb-12'>
              <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
                <div className='text-white/70 text-sm lg:text-base'>
                  <span>
                    © {new Date().getFullYear()} {company.name}. Todos los
                    derechos reservados.
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-white/70 text-sm lg:text-base'>
                    Desarrollado por:
                  </span>
                  <a
                    href='https://www.onlymotors.com.ar/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:opacity-80 transition-opacity duration-300'
                  >
                    <OnlymotorsLogo
                      className='w-24 md:w-28'
                      gradientStart='#ffffff'
                      gradientEnd='#A1A1A1'
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
