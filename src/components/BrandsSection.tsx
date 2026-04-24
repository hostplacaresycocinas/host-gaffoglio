'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL, TENANT } from '@/app/constants/constants';

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

const BrandsSection = () => {
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
          }
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

  if (loading) {
    return (
      <section className='mt-8 mb-16 md:mt-12 md:mb-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-4 md:mb-6'>
            <div className='inline-flex items-center gap-4 mb-3'>
              <div className='w-10 h-px bg-color-primary/70' />
              <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold'>
                Marcas
              </span>
              <div className='w-10 h-px bg-color-primary/70' />
            </div>
            <h2 className='text-white/90 text-2xl sm:text-3xl md:text-4xl leading-tight font-semibold tracking-tight'>
              Modelos 0km
            </h2>
          </div>
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary'></div>
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className='mt-8 mb-16 md:mt-12 md:mb-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Título y texto de invitación */}
        <div className='mb-8 md:mb-12 text-center'>
          <div className='inline-flex items-center gap-4 mb-3'>
            <div className='w-10 h-px bg-color-primary/70' />
            <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold'>
              Marcas
            </span>
            <div className='w-10 h-px bg-color-primary/70' />
          </div>
          <h2 className='text-white/90 text-2xl sm:text-3xl md:text-4xl leading-tight font-semibold tracking-tight mb-3'>
            Modelos 0km
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className='text-white/80 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed'
          >
            Elegí la marca que estás buscando y conocé los modelos disponibles
          </motion.p>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8'>
          {brands.map((brand) => {
            const brandSlug = normalizeToSlug(brand.name);
            return (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true, margin: '0px 0px -50px 0px' }}
                className='group'
              >
                <Link
                  href={`/0km/${brandSlug}`}
                  className='flex flex-col items-center justify-center p-4 md:p-6 rounded-lg border border-white/10 hover:border-color-primary/50 bg-color-bg-secondary/50 hover:bg-color-bg-secondary transition-all duration-300 group'
                >
                  {/* Logo */}
                  <div className='relative w-full h-20 md:h-24 lg:h-28 mb-3 md:mb-4 flex items-center justify-center'>
                    {brand.imageUrl || brand.thumbnailUrl ? (
                      <Image
                        src={brand.imageUrl || brand.thumbnailUrl || ''}
                        alt={brand.name}
                        fill
                        className='object-contain object-center group-hover:scale-105 transition-transform duration-300'
                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <span className='text-2xl md:text-3xl font-semibold text-color-text-light/60'>
                          {brand.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Nombre */}
                  <h3 className='text-sm md:text-base font-medium text-color-title-light text-center group-hover:text-color-primary transition-colors duration-300'>
                    {brand.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
