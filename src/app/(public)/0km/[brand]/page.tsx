'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { company, API_BASE_URL, TENANT } from '@/app/constants/constants';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
            'x-tenant-subdomain': TENANT,
          },
        }
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
              'x-tenant-subdomain': TENANT,
            },
          }
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
          <section className='relative bg-white/5 backdrop-blur-sm border-b border-white/10 py-6 md:py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <div className='flex items-center justify-center gap-4 md:gap-6 lg:gap-8'>
                {/* Logo de la marca */}
                {brand.imageUrl || brand.thumbnailUrl ? (
                  <div className='relative w-24 h-16 md:w-32 md:h-20 lg:w-40 lg:h-24 flex-shrink-0'>
                    <Image
                      src={brand.imageUrl || brand.thumbnailUrl || ''}
                      alt={`Logo de ${brand.name}`}
                      fill
                      className='object-contain object-right'
                      priority
                    />
                  </div>
                ) : (
                  <div className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex-shrink-0 bg-white/10 rounded-lg flex items-center justify-center border border-white/20'>
                    <span className='text-2xl md:text-3xl lg:text-4xl font-bold text-white/60'>
                      {brand.name?.charAt(0).toUpperCase() || 'M'}
                    </span>
                  </div>
                )}

                {/* Nombre de la marca */}
                <div className='flex-1'>
                  <h1 className='uppercase text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-color-primary-light mb-1'>
                    {brand.name} 0km
                  </h1>
                  <p className='text-sm md:text-base lg:text-lg text-white/70 font-medium'>
                    Vehículos disponibles
                  </p>
                </div>
              </div>
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
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 mt-10 min-h-[600px] place-content-start'
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
                            <div className='h-full flex flex-col'>
                              {/* Imagen */}
                              <div className='relative w-full h-48 md:h-56 lg:h-60 flex items-center justify-center'>
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                  className='w-full h-full flex items-center justify-center'
                                >
                                  {model.images && model.images.length > 0 ? (
                                    <Image
                                      priority
                                      width={520}
                                      height={380}
                                      className='object-contain w-full h-full p-6'
                                      src={
                                        model.images[0].thumbnailUrl ||
                                        model.images[0].imageUrl
                                      }
                                      alt={model.name}
                                    />
                                  ) : (
                                    <div className='w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center rounded-lg'>
                                      <span className='text-2xl font-bold text-white/50'>
                                        {model.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35 pointer-events-none' />
                              </div>

                              {/* Contenido */}
                              <div className='p-4 pt-5'>
                                <h3 className='text-center text-white/90 text-lg md:text-xl font-semibold uppercase tracking-tight mb-4'>
                                  {model.name}
                                </h3>

                                {/* Botón */}
                                <div className='flex justify-center'>
                                  <span className='inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm md:text-base transition-colors group-hover:bg-white/85'>
                                    Ver más
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
