'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { company, API_BASE_URL, TENANT_0KM } from '@/app/constants/constants';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitleItaly } from '@/components/SectionTitleItaly';

interface Brand {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

interface Model {
  id: string;
  brand0kmId: string;
  name: string;
  description?: string;
  listPrice?: number;
  promotionalPrice?: number;
  currency?: string;
  active: boolean;
  images: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
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

const ZeroKmBrandPage = () => {
  const params = useParams();
  const brandSlug = params.brand as string;
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<Model[]>([]);

  // Función para encontrar marca por slug
  const findBrandBySlug = async (slug: string): Promise<Brand | null> => {
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
        return null;
      }

      const brands: Brand[] = await response.json();
      return brands.find((b) => normalizeToSlug(b.name) === slug) || null;
    } catch (error) {
      console.error('Error al buscar marca:', error);
      return null;
    }
  };

  // Cargar marca y modelos
  useEffect(() => {
    const loadData = async () => {
      if (!brandSlug) return;

      setLoading(true);
      try {
        // Buscar la marca
        const foundBrand = await findBrandBySlug(brandSlug);
        if (!foundBrand) {
          setBrand(null);
          setModels([]);
          setLoading(false);
          return;
        }

        setBrand(foundBrand);

        // Cargar modelos de la marca
        const modelsResponse = await fetch(
          `${API_BASE_URL}/api/0km/models?brand0kmId=${foundBrand.id}&active=true`,
          {
            headers: {
              'x-tenant-subdomain': TENANT_0KM,
            },
          },
        );

        if (modelsResponse.ok) {
          const modelsData: Model[] = await modelsResponse.json();
          setModels(modelsData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [brandSlug]);

  return (
    <>
      <Header />
      <div className='relative'>
        {/* Hero Section tipo título con logo y nombre */}
        {brand && (
          <section className='relative py-8 md:py-10 lg:py-12'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <SectionTitleItaly
                title={
                  <span className='inline-flex items-center justify-center gap-3 md:gap-4'>
                    {brand.imageUrl || brand.thumbnailUrl ? (
                      <span className='relative w-16 h-11 md:w-20 md:h-14 lg:w-24 lg:h-16 flex-shrink-0'>
                        <Image
                          src={brand.imageUrl || brand.thumbnailUrl || ''}
                          alt={`Logo de ${brand.name}`}
                          fill
                          className='object-contain object-right'
                          priority
                        />
                      </span>
                    ) : (
                      <span className='w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-white/10 rounded-lg flex items-center justify-center border border-white/20'>
                        <span className='text-xl md:text-2xl font-bold text-white/60'>
                          {brand.name?.charAt(0).toUpperCase() || 'M'}
                        </span>
                      </span>
                    )}
                    <span>{brand.name}</span>
                  </span>
                }
                as='h1'
                className='!mb-0'
                titleClassName='uppercase text-color-primary-light'
                subtitle='Modelos 0km'
                subtitleVariant='section'
                subtitleClassName='!text-white/70 !text-sm md:!text-base lg:!text-lg !font-medium'
              />
            </div>
          </section>
        )}

        {/* Sección de Modelos */}
        <section className='mb-16 md:mb-24'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {loading ? (
              <div className='flex justify-center items-center min-h-[600px]'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary'></div>
              </div>
            ) : brand && models.length > 0 ? (
              <>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={brandSlug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-7 mt-8 md:mt-10 min-h-[600px] place-content-start'
                  >
                    {models.map((model) => {
                      const modelSlug = normalizeToSlug(model.name);
                      return (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className='group'
                        >
                          <Link
                            href={`/0km/${brandSlug}/${modelSlug}`}
                            className='block h-full'
                          >
                            <div className='h-full overflow-hidden'>
                              {/* Imagen limpia, sin card/borde */}
                              <div className='relative w-full h-52 md:h-60 lg:h-64 flex items-center justify-center'>
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{
                                    duration: 0.5,
                                    ease: 'easeOut',
                                  }}
                                  className='w-full h-full flex items-center justify-center'
                                >
                                  {model.images && model.images.length > 0 ? (
                                    <Image
                                      priority
                                      width={520}
                                      height={380}
                                      className='object-contain w-full h-full p-6 md:p-7'
                                      src={
                                        model.images[0].thumbnailUrl ||
                                        model.images[0].imageUrl
                                      }
                                      alt={model.name}
                                    />
                                  ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                      <span className='text-2xl font-bold text-white/50'>
                                        {model.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                              </div>

                              {/* Título + botón */}
                              <div className='relative p-4 md:p-5 rounded-b-lg overflow-hidden'>
                                <div className='absolute inset-0 z-0 bg-gradient-to-t from-neutral-800 via-neutral-800/45 to-transparent opacity-100 transition-opacity duration-300 ease-out pointer-events-none' />
                                <div className='absolute inset-0 z-0 bg-gradient-to-t from-neutral-800 via-neutral-800/70 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 pointer-events-none' />
                                <h3 className='relative z-10 text-center text-white/90 text-lg md:text-xl font-semibold uppercase tracking-tight mb-3'>
                                  {model.name}
                                </h3>

                                {/* Botón */}
                                <div className='relative z-10 flex justify-center'>
                                  <span className='inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-color-primary text-color-title-light font-semibold text-sm md:text-base transition-colors group-hover:bg-color-primary-dark'>
                                    Ver modelo
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <div className='flex flex-col items-center min-h-[600px] my-8 md:my-16'>
                <div className='col-span-2 md:col-span-3 lg:col-span-4 text-center text-lg text-color-text-light'>
                  {brand
                    ? `No hay modelos disponibles para ${brand.name}.`
                    : 'Marca no encontrada.'}
                </div>
                <Link
                  className='mt-5 border-2 border-transparent bg-color-primary hover:bg-color-primary/80 transition-colors px-4 md:px-6 py-3 text-color-title font-semibold rounded'
                  href='/0km'
                >
                  Volver a vehículos 0km
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ZeroKmBrandPage;
