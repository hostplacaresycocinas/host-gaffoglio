'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { company, API_BASE_URL, TENANT } from '@/app/constants/constants';
import AutoScroll from 'embla-carousel-auto-scroll';

interface Imagen {
  id: string;
  carId: string;
  imageUrl: string;
  thumbnailUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Categoria {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Auto {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: {
    valor: number;
    moneda: string;
  };
  description: string;
  position: number;
  featured: boolean;
  favorite: boolean;
  active: boolean;
  categoryId: string;
  mileage: number;
  transmission: string;
  fuel: string;
  doors: number;
  createdAt: string;
  updatedAt: string;
  Images: Imagen[];
  Category: Categoria;
}

interface ApiRecommendedCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  price: number | null;
  currency: string | null;
  description: string | null;
  position: number | null;
  featured: boolean;
  favorite: boolean;
  active: boolean;
  categoryId: string;
  mileage: number | null;
  transmission: string | null;
  fuel: string | null;
  doors: number | null;
  createdAt: string;
  updatedAt: string;
  Category?: { id: string; name: string };
  images?: Array<{ thumbnailUrl?: string; imageUrl?: string; order?: number }>;
}

interface CarrouselRelatedProps {
  title: string;
  currentCarId: string;
  categoryId: string;
}

const CarrouselRelated = ({ title, currentCarId }: CarrouselRelatedProps) => {
  const [emblaRef] = useEmblaCarousel({ dragFree: true, loop: true }, [
    AutoScroll({
      speed: 1,
      stopOnInteraction: false,
      startDelay: 0,
      stopOnFocusIn: false,
    }),
  ]);
  const [clicked, setClicked] = useState(false);
  const [relatedCars, setRelatedCars] = useState<Auto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerRelacionados = async () => {
      setCargando(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cars/${currentCarId}/recommended?tenant=${TENANT}`,
        );
        if (!response.ok) {
          throw new Error('No se pudieron cargar los recomendados');
        }
        const data: ApiRecommendedCar[] = await response.json();
        const autosRelacionados = (data ?? []).map((auto) => ({
          id: auto.id,
          brand: auto.brand,
          model: auto.model,
          year: auto.year,
          color: auto.color || '',
          price: {
            valor: auto.price ?? 0,
            moneda: auto.currency ?? 'USD',
          },
          description: auto.description || '',
          position: auto.position ?? 0,
          featured: auto.featured,
          favorite: auto.favorite,
          active: auto.active,
          categoryId: auto.categoryId,
          mileage: auto.mileage ?? 0,
          transmission: auto.transmission || '',
          fuel: auto.fuel || '',
          doors: auto.doors ?? 0,
          createdAt: auto.createdAt,
          updatedAt: auto.updatedAt,
          Images:
            auto.images?.map((img, index) => ({
              id: `${auto.id}-img-${index}`,
              carId: auto.id,
              imageUrl:
                img.imageUrl || img.thumbnailUrl || '/assets/placeholder.webp',
              thumbnailUrl:
                img.thumbnailUrl || img.imageUrl || '/assets/placeholder.webp',
              order: img.order ?? index,
              createdAt: auto.createdAt,
              updatedAt: auto.updatedAt,
            })) ?? [],
          Category: {
            id: auto.Category?.id || auto.categoryId,
            name: auto.Category?.name || 'Sin categoría',
            createdAt: auto.createdAt,
            updatedAt: auto.updatedAt,
          },
        }));

        setRelatedCars(autosRelacionados);
      } catch (err) {
        console.error(
          'Error al cargar vehículos relacionados del catálogo:',
          err
        );
        setError('No se pudieron cargar los vehículos relacionados');
      } finally {
        setCargando(false);
      }
    };

    obtenerRelacionados();
  }, [currentCarId]);

  if (cargando) {
    return (
      <section className='flex justify-center w-full'>
        <div className='max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 overflow-hidden'>
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
        <div className='max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 overflow-hidden'>
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

  if (relatedCars.length === 0) {
    return (
      <section className='flex justify-center w-full'>
        <div className='max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 overflow-hidden'>
          <div className='flex items-center mb-4 md:mb-6 lg:mb-8'>
            <div className='h-10 w-1 bg-color-primary mr-4'></div>
            <h3 className='text-2xl sm:text-3xl text-color-title-light tracking-wide'>
              {title}
            </h3>
          </div>
          <div className='text-center py-8 text-color-text-light'>
            No hay vehículos relacionados disponibles
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='flex justify-center w-full'>
      <div className='max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 overflow-hidden'>
        <div className='flex items-center mb-4 md:mb-6 lg:mb-8'>
          <div className='h-10 w-1 bg-color-primary mr-4'></div>
          <h3 className='text-2xl sm:text-3xl text-color-title-light tracking-wide'>
            {title}
          </h3>
        </div>

        <div
          onMouseUp={() => setClicked(false)}
          onMouseDown={() => setClicked(true)}
          ref={emblaRef}
          className={`${
            clicked ? 'cursor-grabbing' : 'cursor-grab'
          } select-none`}
        >
          <div className='flex'>
            {relatedCars.map((auto) => (
              <Link
                href={`/catalogo/${auto.id}`}
                className='w-full relative overflow-hidden flex-[0_0_75%] min-[500px]:flex-[0_0_55%] sm:flex-[0_0_40%] lg:flex-[0_0_30%] xl:flex-[0_0_26%] ml-6 sm:ml-7 md:ml-8'
                key={auto.id}
              >
                {/* Card container con borde que se ilumina */}
                <div className='relative overflow-hidden group-hover:border-color-primary transition-all duration-500 h-full shadow-[0_8px_30px_-15px_rgba(0,0,0,0.7)] group-hover:shadow-[0_8px_30px_-10px_rgba(233,0,2,0.2)] select-none'>
                  {!auto.active && (
                    <div className='absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-20'>
                      <span className='bg-red-500 text-white text-sm font-medium px-3 py-1.5 rounded'>
                        Pausado
                      </span>
                    </div>
                  )}

                  {/* Contenedor de la imagen */}
                  <div className='relative overflow-hidden aspect-[4/3] rounded-xl group border border-neutral-600'>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className='w-full h-full '
                    >
                      <Image
                        priority
                        width={600}
                        height={600}
                        className='object-cover w-full h-full transition-transform duration-700 select-none pointer-events-none'
                        style={{
                          objectPosition: `center ${company.objectCover}`,
                        }}
                        src={
                          auto.Images.sort((a, b) => a.order - b.order)[0]
                            ?.thumbnailUrl || '/assets/placeholder.webp'
                        }
                        alt={`${auto.model}`}
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
                            ? 'group-hover:text-color-title-light'
                            : 'group-hover:text-color-title-light'
                        } text-color-title-light text-lg md:text-xl font-semibold tracking-tight truncate md:mb-1 transition-colors duration-300`}
                      >
                        {auto.model}
                      </h3>

                      <div
                        className={`${
                          company.price ? '' : 'hidden'
                        } text-color-primary text-lg md:text-xl font-semibold tracking-tight truncate md:mb-1 transition-colors duration-300`}
                      >
                        {auto.price.moneda === 'ARS' ? '$' : 'US$'}
                        {auto.price.valor.toLocaleString('es-ES')}
                      </div>

                      {/* Diseño minimalista con separadores tipo | */}
                      <div className='flex flex-wrap items-center text-color-text-light font-medium'>
                        <span className=''>{auto.brand}</span>
                        <span
                          className={`${
                            company.dark
                              ? 'text-color-primary'
                              : 'text-color-primary'
                          } mx-2`}
                        >
                          |
                        </span>
                        <span>{auto.year}</span>
                      </div>

                      {/* Precio o etiqueta destacada */}
                      <div className='flex justify-between items-center text-color-text-light mt-0.5'>
                        {auto.mileage === 0 ? (
                          <span className='text-sm font-semibold uppercase tracking-wider text-color-primary'>
                            Nuevo <span className='text-color-primary'>•</span>{' '}
                            {auto.mileage.toLocaleString('es-ES')} km
                          </span>
                        ) : (
                          <span className='text-sm text-color-text-light font-medium uppercase tracking-wider'>
                            Usado <span className='text-color-primary'>•</span>{' '}
                            {auto.mileage.toLocaleString('es-ES')} km
                          </span>
                        )}
                      </div>

                      <div className='md:mt-1'>
                        <span
                          className={`${
                            company.dark
                              ? 'text-color-title-light'
                              : 'text-color-title-light'
                          } inline-flex items-center  transition-colors font-semibold`}
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarrouselRelated;
