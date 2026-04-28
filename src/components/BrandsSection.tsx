'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL, TENANT_0KM } from '@/app/constants/constants';
import { SectionTitleItaly } from '@/components/SectionTitleItaly';

interface Brand {
  id: string;
  position?: number;
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
              'x-tenant-subdomain': TENANT_0KM,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Error al cargar las marcas');
        }

        const data: Brand[] = await response.json();
        const ordered = [...data].sort(
          (a, b) => (b.position ?? 0) - (a.position ?? 0),
        );
        setBrands(ordered);
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
          <SectionTitleItaly title='Modelos 0km' />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <SectionTitleItaly
              title='Modelos 0km'
              className='!mb-0'
              subtitle='Elegí la marca que estás buscando y conocé los modelos disponibles'
              subtitleVariant='section'
            />
          </motion.div>
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
                  className='relative flex flex-col items-center justify-center p-4 md:p-6 rounded-lg border border-white/15 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-color-primary/45 hover:bg-white/10 group'
                >
                  <div className='absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

                  {/* Logo */}
                  <div className='relative w-full h-20 md:h-24 lg:h-28 mb-3 md:mb-4 flex items-center justify-center'>
                    {brand.imageUrl || brand.thumbnailUrl ? (
                      <Image
                        src={brand.imageUrl || brand.thumbnailUrl || ''}
                        alt={brand.name}
                        fill
                        className='object-contain object-center transition-transform duration-300 group-hover:scale-105'
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

                  {!!brand.models?.length && (
                    <p className='mt-1.5 text-[10px] md:text-xs tracking-[0.18em] uppercase text-white/55'>
                      {brand.models.length} modelos
                    </p>
                  )}
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
