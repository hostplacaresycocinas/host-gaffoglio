'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ArrowIcon from '@/components/icons/ArrowIcon';
import WhatsappIcon from '@/components/icons/WhatsappIcon';
import { company, API_BASE_URL } from '@/app/constants/constants';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import useEmblaCarousel from 'embla-carousel-react';
import DropDownIcon from '@/components/icons/DropDownIcon';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { get0kmHeaders } from '@/app/admin/0km/utils/api';
import CarrouselRelated0km from '@/components/CarrouselRelated0km';

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

interface Version {
  id: string;
  model0kmId: string;
  name: string;
  year: number;
  description?: string;
  listPrice?: number;
  promotionalPrice?: number;
  currency: string;
  minDownPayment?: number;
  installmentsCount?: number;
  installmentAmount?: number;
  technicalSheetUrl?: string;
  images: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
  active: boolean;
  featured: boolean;
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

export default function ZeroKmModelDetailPage() {
  const params = useParams();
  const brandSlug = params.brand as string;
  const modelSlug = params.model as string;
  const [model, setModel] = useState<Model | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainViewportRef, embla] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalStartIndex] = useState(0);
  const [orderedImages, setOrderedImages] = useState<
    Array<{ id: string; imageUrl: string; thumbnailUrl: string; order: number }>
  >([]);

  const scrollPrev = useCallback(() => {
    if (embla) {
      embla.scrollPrev();
    }
  }, [embla]);

  const scrollNext = useCallback(() => {
    if (embla) {
      embla.scrollNext();
    }
  }, [embla]);

  // Manejar las teclas de flecha
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showModal) return;

      if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext, showModal]);

  useEffect(() => {
    if (embla) {
      embla.on('select', () => {
        setSelectedIndex(embla.selectedScrollSnap());
      });
    }
  }, [embla]);

  // Cuando cambia la versión seleccionada, actualizar las imágenes
  useEffect(() => {
    if (selectedVersion && selectedVersion.images.length > 0) {
      const sortedImages = [...selectedVersion.images].sort(
        (a, b) => a.order - b.order
      );
      setOrderedImages(sortedImages);
      setSelectedIndex(0);
      if (embla) {
        embla.reInit();
        embla.scrollTo(0);
      }
    } else if (model && model.images.length > 0) {
      const sortedImages = [...model.images].sort((a, b) => a.order - b.order);
      setOrderedImages(sortedImages);
      setSelectedIndex(0);
      if (embla) {
        embla.reInit();
        embla.scrollTo(0);
      }
    }
  }, [selectedVersion, model, embla]);

  useEffect(() => {
    const fetchModel = async () => {
      if (!brandSlug || !modelSlug) return;

      setLoading(true);
      setError(null);
      try {
        // Buscar la marca
        const brandsResponse = await fetch(
          `${API_BASE_URL}/api/0km/brands?active=true`,
          {
            headers: get0kmHeaders(false),
          }
        );

        if (!brandsResponse.ok) {
          throw new Error('Error al cargar las marcas');
        }

        const brands: Brand[] = await brandsResponse.json();
        const foundBrand =
          brands.find((b) => normalizeToSlug(b.name) === brandSlug) || null;

        if (!foundBrand) {
          throw new Error('Marca no encontrada');
        }

        setBrand(foundBrand);

        // Cargar modelos de la marca
        const modelsResponse = await fetch(
          `${API_BASE_URL}/api/0km/models?brand0kmId=${foundBrand.id}&active=true`,
          {
            headers: get0kmHeaders(false),
          }
        );

        if (!modelsResponse.ok) {
          throw new Error('Error al cargar los modelos');
        }

        const models: Model[] = await modelsResponse.json();
        const foundModel =
          models.find((m) => normalizeToSlug(m.name) === modelSlug) || null;

        if (!foundModel) {
          throw new Error('Modelo no encontrado');
        }

        // Ordenar las imágenes del modelo
        const sortedModelImages = [...foundModel.images].sort(
          (a, b) => a.order - b.order
        );
        setModel({ ...foundModel, images: sortedModelImages });
        setOrderedImages(sortedModelImages);

        // Cargar versiones del modelo
        const versionsResponse = await fetch(
          `${API_BASE_URL}/api/0km/versions?model0kmId=${foundModel.id}&active=true`,
          {
            headers: get0kmHeaders(false),
          }
        );

        if (versionsResponse.ok) {
          const versionsData: Version[] = await versionsResponse.json();
          // Ordenar versiones: destacadas primero, luego por posición/orden alfabético
          const sortedVersions = versionsData.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return a.name.localeCompare(b.name);
          });
          setVersions(sortedVersions);
          // No seleccionar versión automáticamente - mostrar modelo base primero
          setSelectedVersion(null);
        }
      } catch (error) {
        console.error('Error fetching model:', error);
        setError(
          error instanceof Error ? error.message : 'Error al cargar el modelo'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [brandSlug, modelSlug]);

  const handleVersionChange = (version: Version) => {
    setSelectedVersion(version);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <section className='flex flex-col items-center mx-auto pt-8 md:pt-10 pb-16 md:pb-20'>
          <div className='w-full flex justify-center'>
            <div className='w-full max-w-7xl mb-6 mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
              <div className='flex gap-2 font-medium items-center'>
                <div className='h-5 w-20 bg-neutral-800/50 rounded animate-pulse'></div>
                <div className='h-5 w-5 bg-neutral-800/50 rounded animate-pulse'></div>
                <div className='h-5 w-24 bg-neutral-800/50 rounded animate-pulse'></div>
              </div>
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0'>
            <div className='w-full lg:w-1/2'>
              <div className='aspect-[4/3] bg-neutral-800/40 rounded-xl animate-pulse'></div>
            </div>
            <div className='w-full lg:w-1/2'>
              <div className='bg-color-bg-secondary border border-neutral-500 rounded-lg shadow-lg p-6'>
                <div className='h-6 w-32 bg-neutral-800/30 rounded animate-pulse mb-4'></div>
                <div className='h-8 w-48 bg-neutral-800/30 rounded animate-pulse mb-6'></div>
                <div className='h-12 w-full bg-neutral-800/30 rounded animate-pulse'></div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (error || !model || !brand) {
      return (
        <section className='flex flex-col items-center mx-auto pt-8 md:pt-10 pb-16 md:pb-20'>
          <div className='flex flex-col items-center justify-center min-h-[60vh]'>
            <div className='bg-gradient-to-b from-black to-neutral-900 border border-neutral-800 rounded-lg shadow-[0_8px_30px_-15px_rgba(0,0,0,0.7)] p-8 text-center'>
              <p className='text-red-500 mb-4'>
                {error || 'Modelo no encontrado'}
              </p>
              <Link
                href='/0km'
                className='text-color-primary hover:text-color-primary-dark'
              >
                Volver al catálogo 0km
              </Link>
            </div>
          </div>
        </section>
      );
    }

    // Usar imágenes de la versión seleccionada si existe, sino del modelo
    const currentImages =
      selectedVersion && selectedVersion.images.length > 0
        ? orderedImages
        : orderedImages;
    const displayName = selectedVersion
      ? `${model.name} ${selectedVersion.name}`
      : model.name;

    return (
      <section className='flex flex-col items-center mx-auto pt-8 md:pt-10 pb-16 md:pb-20'>
        {/* Navegación */}
        <div className='w-full flex justify-center'>
          <div className='w-full max-w-7xl mb-4 sm:mb-5 mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
            <div className='flex gap-2 font-medium items-center'>
              <Link href={`/0km`}>
                <p className='text-color-text-light hover:text-color-primary transition-colors'>
                  0km
                </p>
              </Link>
              <DropDownIcon className='w-2.5 h-2.5 -rotate-90 text-color-text-light' />
              <Link href={`/0km/${brandSlug}`}>
                <p className='text-color-text-light hover:text-color-primary transition-colors'>
                  {brand.name}
                </p>
              </Link>
              <DropDownIcon className='w-2.5 h-2.5 -rotate-90 text-color-text-light' />
              <p className='text-color-text-light'>{model.name}</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row lg:items-start gap-4 md:gap-6 lg:gap-8 w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0'>
          {/* Columna izquierda - Galería de imágenes */}
          <div className='w-full lg:w-1/2 lg:sticky lg:top-28 lg:self-start'>
            <div className='relative mb-3'>
              {/* Botones de navegación */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className='hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-color-bg-secondary hover:bg-color-bg-secondary/90 text-color-title-light hover:text-color-primary p-3 rounded-full transition-all shadow-lg z-10 opacity-100 cursor-pointer'
                    aria-label='Anterior'
                  >
                    <ArrowIcon className='w-5 h-5 rotate-180' />
                  </button>
                  <button
                    onClick={scrollNext}
                    className='hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-color-bg-secondary hover:bg-color-bg-secondary/90 text-color-title-light hover:text-color-primary p-3 rounded-full transition-all shadow-lg z-10 opacity-100 cursor-pointer'
                    aria-label='Siguiente'
                  >
                    <ArrowIcon className='w-5 h-5' />
                  </button>
                </>
              )}

              {/* Indicador de posición */}
              {currentImages.length > 1 && (
                <div className='absolute bottom-4 right-4 bg-color-bg-secondary text-color-title-light px-3 py-2 rounded-full text-base font-medium shadow-lg z-10'>
                  {selectedIndex + 1}/{currentImages.length}
                </div>
              )}

              {/* Carrusel de imágenes principal */}
              <div className='overflow-hidden rounded-xl' ref={mainViewportRef}>
                <div className='flex'>
                  {currentImages.map((image, index) => (
                    <div
                      key={image.id || index}
                      className='relative min-w-full aspect-[4/3]'
                    >
                      <div className='relative w-full h-full overflow-hidden'>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className='w-full h-full flex items-center justify-center'
                        >
                          <Image
                            src={image.imageUrl}
                            alt={`${displayName} - Imagen ${index + 1}`}
                            fill
                            className='object-contain'
                            sizes='(max-width: 768px) 100vw, 50vw'
                            priority={index === 0}
                          />
                        </motion.div>

                        {!model.active && (
                          <div className='absolute inset-0 bg-black/70 flex items-center justify-center'>
                            <span className='bg-red-500 text-white text-xl md:text-2xl font-medium px-6 py-4 md:px-10 md:py-5 rounded-full'>
                              Pausado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Miniaturas - grid de 3 columnas, ocultas en mobile */}
            {currentImages.length > 1 && (
              <div className='hidden md:grid grid-cols-3 gap-3'>
                {currentImages.slice(1, 4).map((image, index) => {
                  const actualIndex = index + 1;
                  const isLastThumbnail = index === 2;
                  const hasMoreImages = currentImages.length > 4;
                  const shouldShowBlur = isLastThumbnail && hasMoreImages;

                  return (
                    <button
                      key={image.id || actualIndex}
                      onClick={() => {
                        if (embla) {
                          embla.scrollTo(actualIndex);
                        }
                      }}
                      className='relative aspect-[4/3] rounded-lg overflow-hidden outline-none transition-all group'
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className='w-full h-full flex items-center justify-center'
                      >
                        <Image
                          priority
                          src={image.thumbnailUrl}
                          alt={`${displayName} - Miniatura ${actualIndex + 1}`}
                          fill
                          sizes='200px'
                          className={`object-cover ${
                            shouldShowBlur ? 'blur-sm' : ''
                          }`}
                        />
                      </motion.div>

                      {/* Overlay de sombra al hacer hover */}
                      <div className='absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                      {/* Overlay con contador en la última miniatura si hay más imágenes */}
                      {shouldShowBlur && (
                        <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                          <div className='text-center text-white'>
                            <div className='text-3xl font-bold'>
                              +{currentImages.length - 4}
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna derecha - Información del modelo/versión */}
          <div className='w-full lg:w-1/2'>
            <div className='bg-color-bg-secondary border border-neutral-600 rounded-lg shadow-[0_8px_30px_-15px_rgba(0,0,0,0.7)] p-6'>
              {/* Selector de versiones si hay versiones */}
              {versions.length > 0 && (
                <div className='mb-6'>
                  <div className='flex flex-wrap gap-2 border-b border-neutral-700 pb-4'>
                    {/* Botón para modelo base */}
                    <button
                      onClick={() => setSelectedVersion(null)}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-t ${
                        !selectedVersion
                          ? 'text-color-primary border-b-2 border-color-primary bg-neutral-800/50'
                          : 'text-color-text-light hover:text-color-primary hover:bg-neutral-800/30'
                      }`}
                    >
                      {model.versionName || model.name}
                    </button>
                    {/* Botones de versiones */}
                    {versions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => handleVersionChange(version)}
                        className={`px-4 py-2 text-sm font-medium transition-colors rounded-t ${
                          selectedVersion?.id === version.id
                            ? 'text-color-primary border-b-2 border-color-primary bg-neutral-800/50'
                            : 'text-color-text-light hover:text-color-primary hover:bg-neutral-800/30'
                        }`}
                      >
                        {version.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Título */}
              <div className='mb-4'>
                <h1 className='text-2xl md:text-3xl font-bold text-color-title-light mb-2'>
                  {versions.length > 0 && !selectedVersion && model.versionName
                    ? `${model.name} ${model.versionName}`
                    : displayName}
                </h1>
                <div className='flex flex-wrap items-center gap-2 text-base text-color-text-light mt-2'>
                  <span className='font-medium text-color-text-light'>
                    {brand.name}
                  </span>
                  <span className='text-color-primary'>•</span>
                  <span className='font-medium text-color-text-light'>0km</span>
                </div>
              </div>

              {/* Precio si hay versión seleccionada y tiene precio */}
              {selectedVersion &&
                company.price &&
                ((selectedVersion.listPrice && selectedVersion.listPrice > 0) ||
                  (selectedVersion.promotionalPrice &&
                    selectedVersion.promotionalPrice > 0)) && (
                  <div className='mb-6 pb-6 border-b border-neutral-700'>
                    <p className='text-sm text-color-text-light mb-2'>
                      Cuota desde
                    </p>
                    {selectedVersion.promotionalPrice &&
                    selectedVersion.promotionalPrice > 0 ? (
                      <div>
                        <div className='text-3xl md:text-4xl font-bold text-color-primary mb-1'>
                          {selectedVersion.currency === 'ARS' ? '$' : 'US$'}
                          {selectedVersion.promotionalPrice.toLocaleString(
                            selectedVersion.currency === 'ARS'
                              ? 'es-AR'
                              : 'en-US'
                          )}
                        </div>
                        <div className='text-lg text-color-text-light line-through'>
                          {selectedVersion.currency === 'ARS' ? '$' : 'US$'}
                          {selectedVersion.listPrice &&
                          selectedVersion.listPrice > 0
                            ? selectedVersion.listPrice.toLocaleString(
                                selectedVersion.currency === 'ARS'
                                  ? 'es-AR'
                                  : 'en-US'
                              )
                            : ''}
                        </div>
                      </div>
                    ) : (
                      <div className='text-3xl md:text-4xl font-bold text-color-primary'>
                        {selectedVersion.currency === 'ARS' ? '$' : 'US$'}
                        {selectedVersion.listPrice &&
                        selectedVersion.listPrice > 0
                          ? selectedVersion.listPrice.toLocaleString(
                              selectedVersion.currency === 'ARS'
                                ? 'es-AR'
                                : 'en-US'
                            )
                          : ''}
                      </div>
                    )}

                    {/* Información de financiación */}
                    {(selectedVersion.minDownPayment ||
                      selectedVersion.installmentsCount) && (
                      <div className='mt-4 space-y-1 text-sm text-color-text-light'>
                        {selectedVersion.minDownPayment && (
                          <p>
                            Anticipo mínimo:{' '}
                            <span className='font-semibold text-color-title-light'>
                              {selectedVersion.currency === 'ARS' ? '$' : 'US$'}
                              {selectedVersion.minDownPayment.toLocaleString(
                                selectedVersion.currency === 'ARS'
                                  ? 'es-AR'
                                  : 'en-US'
                              )}
                            </span>
                          </p>
                        )}
                        {selectedVersion.installmentsCount &&
                          selectedVersion.installmentAmount && (
                            <p>
                              {selectedVersion.installmentsCount} cuotas de{' '}
                              <span className='font-semibold text-color-title-light'>
                                {selectedVersion.currency === 'ARS'
                                  ? '$'
                                  : 'US$'}
                                {selectedVersion.installmentAmount.toLocaleString(
                                  selectedVersion.currency === 'ARS'
                                    ? 'es-AR'
                                    : 'en-US'
                                )}
                              </span>
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                )}

              {/* Precio del modelo si no hay versión seleccionada y tiene precio */}
              {!selectedVersion &&
                company.price &&
                ((model.listPrice && model.listPrice > 0) ||
                  (model.promotionalPrice && model.promotionalPrice > 0)) && (
                  <div className='mb-6 pb-6 border-b border-neutral-700'>
                    <p className='text-sm text-color-text-light mb-2'>
                      Cuota desde
                    </p>
                    {model.promotionalPrice && model.promotionalPrice > 0 ? (
                      <div>
                        <div className='text-3xl md:text-4xl font-bold text-color-primary mb-1'>
                          {model.currency === 'ARS' ? '$' : 'US$'}
                          {model.promotionalPrice.toLocaleString(
                            model.currency === 'ARS' ? 'es-AR' : 'en-US'
                          )}
                        </div>
                        <div className='text-lg text-color-text-light line-through'>
                          {model.currency === 'ARS' ? '$' : 'US$'}
                          {model.listPrice && model.listPrice > 0
                            ? model.listPrice.toLocaleString(
                                model.currency === 'ARS' ? 'es-AR' : 'en-US'
                              )
                            : ''}
                        </div>
                      </div>
                    ) : (
                      <div className='text-3xl md:text-4xl font-bold text-color-primary'>
                        {model.currency === 'ARS' ? '$' : 'US$'}
                        {model.listPrice && model.listPrice > 0
                          ? model.listPrice.toLocaleString(
                              model.currency === 'ARS' ? 'es-AR' : 'en-US'
                            )
                          : ''}
                      </div>
                    )}
                  </div>
                )}

              {/* Descripción */}
              {(selectedVersion?.description || model.description) && (
                <div className='mb-6'>
                  <h2 className='text-xl font-semibold mb-3 text-color-title-light'>
                    Descripción
                  </h2>
                  <p className='text-color-text-light whitespace-pre-line leading-relaxed'>
                    {selectedVersion?.description || model.description}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              {model.active && (
                <div className='flex flex-col gap-3 mt-6'>
                  <Link
                    href={`https://api.whatsapp.com/send?phone=549${company.whatsapp[0]}&text=Hola! Quería consultar por el ${displayName} 0km`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`w-full h-12 bg-color-primary hover:bg-color-primary-dark flex gap-2 font-medium rounded text-center transition-colors justify-center items-center ${
                      company.dark
                        ? 'text-color-title-light'
                        : 'text-color-title font-semibold'
                    }`}
                  >
                    <span className='relative z-10 flex gap-1 items-center'>
                      <WhatsappIcon
                        className={`w-6 h-6 ${
                          company.dark
                            ? 'text-color-title'
                            : 'text-color-title-light'
                        }`}
                      />
                      <span
                        className={`text-lg ${
                          company.dark
                            ? 'text-color-title font-semibold'
                            : 'text-color-title-light'
                        }`}
                      >
                        Consultar
                      </span>
                    </span>
                  </Link>
                  {/* Link a ficha técnica si existe */}
                  {(selectedVersion?.technicalSheetUrl ||
                    model.technicalSheetUrl) && (
                    <a
                      href={
                        selectedVersion?.technicalSheetUrl ||
                        model.technicalSheetUrl
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-full h-12 bg-neutral-700 hover:bg-neutral-600 text-white flex gap-2 font-medium rounded text-center transition-colors justify-center items-center'
                    >
                      <span>Ver ficha técnica (PDF)</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de galería */}
        {showModal && (
          <ImageGalleryModal
            images={currentImages.map((img) => img.imageUrl)}
            currentIndex={modalStartIndex}
            productId={model.id}
            marcaId={brandSlug}
            onClose={() => setShowModal(false)}
          />
        )}

        {/* Carrusel de modelos relacionados de la misma marca */}
        {brand && model && (
          <div className='mt-12 md:mt-16 pb-8'>
            <CarrouselRelated0km
              title={`Más modelos ${brand.name}`}
              currentModelId={model.id}
              brandId={brand.id}
              brandSlug={brandSlug}
            />
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <Header />
      <div className='relative w-full max-w-full'>{renderContent()}</div>
      <Footer />
    </>
  );
}
