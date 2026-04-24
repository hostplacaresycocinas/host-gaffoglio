'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { company, API_BASE_URL } from '@/app/constants/constants';
import AutoScroll from 'embla-carousel-auto-scroll';
import { get0kmHeaders } from '@/app/admin/0km/utils/api';

interface Model0km {
  id: string;
  brand0kmId: string;
  name: string;
  description?: string;
  versionName?: string;
  technicalSheetUrl?: string;
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

interface Brand0km {
  id: string;
  name: string;
}

interface CarrouselRelated0kmProps {
  title: string;
  currentModelId: string;
  brandId: string;
  brandSlug: string;
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

const CarrouselRelated0km = ({
  title,
  currentModelId,
  brandId,
  brandSlug,
}: CarrouselRelated0kmProps) => {
  const [emblaRef] = useEmblaCarousel({ dragFree: true, loop: true }, [
    AutoScroll({
      speed: 1,
      stopOnInteraction: false,
      startDelay: 0,
      stopOnFocusIn: false,
    }),
  ]);
  const [clicked, setClicked] = useState(false);
  const [relatedModels, setRelatedModels] = useState<Model0km[]>([]);
  const [brand, setBrand] = useState<Brand0km | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedModels = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener modelos de la misma marca
        const modelsResponse = await fetch(
          `${API_BASE_URL}/api/0km/models?brand0kmId=${brandId}&active=true`,
          {
            headers: get0kmHeaders(false),
          },
        );

        if (!modelsResponse.ok) {
          throw new Error('Error al cargar los modelos');
        }

        const models: Model0km[] = await modelsResponse.json();

        // Filtrar el modelo actual y tomar hasta 10
        const filteredModels = models
          .filter((m) => m.id !== currentModelId)
          .slice(0, 10);

        // Mezclar aleatoriamente
        const shuffled = [...filteredModels].sort(() => Math.random() - 0.5);

        setRelatedModels(shuffled);

        // Obtener info de la marca para el nombre
        const brandsResponse = await fetch(
          `${API_BASE_URL}/api/0km/brands?active=true`,
          {
            headers: get0kmHeaders(false),
          },
        );

        if (brandsResponse.ok) {
          const brands: Brand0km[] = await brandsResponse.json();
          const foundBrand = brands.find((b) => b.id === brandId);
          if (foundBrand) {
            setBrand(foundBrand);
          }
        }
      } catch (err) {
        console.error('Error al cargar modelos relacionados:', err);
        setError('No se pudieron cargar los modelos relacionados');
      } finally {
        setLoading(false);
      }
    };

    if (brandId && currentModelId) {
      fetchRelatedModels();
    }
  }, [brandId, currentModelId]);

  if (loading) {
    return (
      <section className='flex justify-center w-full'>
        <div className='max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 overflow-hidden'>
          <div className='flex items-center mb-4 md:mb-6 lg:mb-8'>
            <div className='h-10 w-1 bg-color-primary mr-4'></div>
            <h3 className='text-2xl sm:text-3xl text-color-title-light tracking-wide'>
              {title}
            </h3>
          </div>
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary'></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='flex justify-center w-full'>
        <div className='max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 overflow-hidden'>
          <div className='flex items-center mb-4 md:mb-6 lg:mb-8'>
            <div className='h-10 w-1 bg-color-primary mr-4'></div>
            <h3 className='text-2xl sm:text-3xl text-color-title-light tracking-wide'>
              {title}
            </h3>
          </div>
          <div className='text-center py-8 text-red-500'>{error}</div>
        </div>
      </section>
    );
  }

  if (relatedModels.length === 0) {
    return null; // No mostrar nada si no hay modelos relacionados
  }

  // Duplicar los modelos para crear un loop infinito suave
  // Si hay pocos elementos, los duplicamos más veces
  const duplicateCount = relatedModels.length < 6 ? 3 : 2;
  const duplicatedModels = Array.from(
    { length: duplicateCount },
    () => relatedModels,
  ).flat();

  return (
    <section className='flex justify-center w-full max-w-full overflow-x-hidden'>
      <div className='max-w-7xl min-w-0 w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 overflow-x-hidden'>
        <div className='flex items-center mb-4 md:mb-6 lg:mb-8'>
          <div className='h-10 w-1 bg-color-primary mr-4'></div>
          <h3 className='text-2xl sm:text-3xl text-color-title-light tracking-wide'>
            {title}
          </h3>
        </div>

        <div
          onMouseUp={() => setClicked(false)}
          onMouseDown={() => setClicked(true)}
          onDragStart={(e) => e.preventDefault()}
          ref={emblaRef}
          className={`w-full max-w-full min-w-0 overflow-hidden touch-pan-y [overscroll-behavior-x:none] ${
            clicked ? 'cursor-grabbing' : 'cursor-grab'
          } select-none`}
        >
          <div className='flex gap-6 sm:gap-7 md:gap-8'>
            {duplicatedModels.map((model, index) => {
              const sortedImages = [...model.images].sort(
                (a, b) => a.order - b.order,
              );
              const modelSlug = normalizeToSlug(model.name);

              return (
                <Link
                  href={`/0km/${brandSlug}/${modelSlug}`}
                  className='relative overflow-hidden shrink-0 flex-[0_0_280px] min-[500px]:flex-[0_0_320px] sm:flex-[0_0_280px] md:flex-[0_0_320px] lg:flex-[0_0_300px] xl:flex-[0_0_280px] max-w-full'
                  key={`${model.id}-${index}`}
                >
                  {/* Card container con borde que se ilumina */}
                  <div className='relative overflow-hidden h-full w-full shadow-[0_8px_30px_-15px_rgba(0,0,0,0.7)] group-hover:shadow-[0_8px_30px_-10px_rgba(233,0,2,0.2)] select-none'>
                    {!model.active && (
                      <div className='absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-20'>
                        <span className='bg-red-500 text-white text-sm font-medium px-3 py-1.5 rounded'>
                          Pausado
                        </span>
                      </div>
                    )}

                    {/* Contenedor padre para detectar hover de imagen o info */}
                    <div className='group/image-info'>
                      {/* Contenedor de la imagen */}
                      <div className='relative overflow-hidden aspect-[4/3] rounded-xl group'>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className='w-full h-full'
                        >
                          <Image
                            priority
                            width={600}
                            height={600}
                            className='object-contain w-full h-full transition-transform duration-700 select-none pointer-events-none'
                            src={
                              sortedImages[0]?.thumbnailUrl ||
                              '/assets/placeholder.webp'
                            }
                            alt={model.name}
                          />
                        </motion.div>

                        {/* Overlay con "Ver más" al hacer hover */}
                        <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center'>
                          <div className='flex flex-col items-center gap-2 text-white'>
                            <div className='w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30 [backdrop-filter:blur(4px)]'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='w-6 h-6'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                />
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                />
                              </svg>
                            </div>
                            <span className='text-sm font-medium tracking-wide'>
                              Ver más
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Información del vehículo */}
                      <div className='relative group'>
                        {/* Gradiente base */}
                        <div className='absolute inset-0 bg-gradient-to-b from-transparent to-color-primary/20 rounded-lg'></div>
                        {/* Gradiente hover */}
                        <div className='absolute inset-0 bg-gradient-to-b from-transparent to-color-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out'></div>
                        {/* Contenido */}
                        <div className='relative z-10 p-4'>
                          <h3
                            className={`${
                              company.dark
                                ? 'group-hover:text-color-primary group/image-info:hover:text-color-primary'
                                : 'group-hover:text-color-primary group/image-info:hover:text-color-primary'
                            } text-color-title-light text-lg md:text-xl font-semibold tracking-tight truncate md:mb-1 transition-colors duration-300`}
                          >
                            {model.name}
                          </h3>

                          {company.price &&
                            ((model.listPrice && model.listPrice > 0) ||
                              (model.promotionalPrice &&
                                model.promotionalPrice > 0)) && (
                              <div className='text-color-title-light text-lg md:text-xl font-semibold tracking-tight truncate md:mb-1 transition-colors duration-300'>
                                {model.currency === 'ARS' ? '$' : 'US$'}
                                {(
                                  model.promotionalPrice || model.listPrice
                                )?.toLocaleString(
                                  model.currency === 'ARS' ? 'es-AR' : 'en-US',
                                )}
                              </div>
                            )}

                          {/* Diseño minimalista con separadores tipo | */}
                          <div className='flex flex-wrap items-center text-color-text-light font-medium'>
                            <span>{brand?.name || 'Marca'}</span>
                            <span
                              className={`${
                                company.dark
                                  ? 'text-color-primary'
                                  : 'text-color-primary'
                              } mx-2`}
                            >
                              |
                            </span>
                            <span className='text-sm font-semibold uppercase tracking-wider text-color-primary'>
                              0km
                            </span>
                          </div>

                          <div className='md:mt-1'>
                            <span
                              className={`${
                                company.dark
                                  ? 'text-color-title-light'
                                  : 'text-color-title-light'
                              } inline-flex items-center transition-colors font-semibold`}
                            >
                              Ver más
                              <span className='inline-block transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300 ml-1'>
                                →
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarrouselRelated0km;
