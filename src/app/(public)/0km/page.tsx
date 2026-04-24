'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { company, API_BASE_URL, TENANT } from '@/app/constants/constants';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Brand {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  active: boolean;
  models?: Array<{ id: string; name: string; active: boolean }>;
}

// Función para normalizar nombres a slugs (URL-friendly)
const normalizeToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ZeroKmPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/0km/brands?active=true`,
          {
            headers: {
              'x-tenant-subdomain': TENANT,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Error al cargar las marcas');
        }

        const data: Brand[] = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error al cargar las marcas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <>
      <Header />
      <div className='relative'>
        {/* Hero Section con imagen de fondo */}
        <section className='relative h-44 md:h-60 lg:h-72 flex items-center justify-center overflow-hidden'>
          {/* Imagen de fondo con overlay */}
          <div className='absolute inset-0 z-0'>
            <Image
              src='/assets/contacto/contacto-banner.webp'
              alt={`Vehículos 0km de ${company.name}`}
              fill
              className='object-cover'
              priority
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/80'></div>
          </div>
          <div className='relative z-10 text-center px-4 max-w-4xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='inline-flex items-center gap-4 mb-3 md:mb-4'
            >
              <div className='w-10 h-px bg-color-primary/70' />
              <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)]'>
                0km
              </span>
              <div className='w-10 h-px bg-color-primary/70' />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-white/90 text-xl sm:text-2xl md:text-3xl leading-tight font-semibold tracking-tight [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)] max-w-3xl mx-auto'
            >
              Vehículos 0km disponibles
            </motion.h1>
          </div>
        </section>

        {/* Sección de Marcas */}
        <section className='mt-8 mb-16 md:mt-12 md:mb-24'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {loading ? (
              <div className='flex justify-center items-center min-h-[600px]'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary'></div>
              </div>
            ) : brands.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
                {brands.map((brand) => {
                  const brandSlug = normalizeToSlug(brand.name);
                  return (
                    <motion.div
                      key={brand.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
                      className='group relative'
                    >
                      <Link href={`/0km/${brandSlug}`} className='block h-full'>
                        <div className='relative overflow-hidden rounded-2xl h-full bg-white/5 backdrop-blur-md border border-white/15 hover:border-white/25 transition-colors'>
                          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />
                          {/* Imagen de fondo */}
                          <div className='relative w-full h-56 md:h-64 rounded-2xl overflow-hidden'>
                            {brand.imageUrl || brand.thumbnailUrl ? (
                              <Image
                                src={brand.imageUrl || brand.thumbnailUrl || ''}
                                alt={brand.name}
                                fill
                                className='object-contain p-8 lg:p-10'
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                              />
                            ) : (
                              <div className='w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center'>
                                <span className='text-4xl font-bold text-white/50'>
                                  {brand.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {/* Gradiente overlay */}
                            <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70'></div>
                          </div>

                          {/* Contenido debajo de la imagen */}
                          <div className='relative p-6 lg:p-7'>
                            <h3 className='text-white/90 text-xl md:text-2xl font-bold text-center mb-1'>
                              {brand.name}
                            </h3>

                            {/* Cantidad de modelos */}
                            {brand.models && brand.models.length > 0 && (
                              <p className='text-white/70 text-center text-sm mb-4'>
                                {brand.models.length}{' '}
                                {brand.models.length === 1
                                  ? 'modelo'
                                  : 'modelos'}
                              </p>
                            )}

                            {/* Descripción */}
                            {brand.description && (
                              <p className='text-white/75 text-center text-sm leading-relaxed mb-5 line-clamp-2'>
                                {brand.description}
                              </p>
                            )}

                            {/* Botón */}
                            <div className='flex justify-center'>
                              <span
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-color-primary font-semibold text-sm md:text-base transition-colors group-hover:bg-color-primary-dark ${company.dark ? 'text-color-title' : 'text-color-title-light'}`}
                              >
                                Ver modelos
                                <svg
                                  className='w-5 h-5'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 5l7 7-7 7'
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className='flex flex-col items-center min-h-[600px] my-8 md:my-16'>
                <div className='text-center text-lg text-color-text-light'>
                  No hay marcas disponibles en este momento.
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ZeroKmPage;
