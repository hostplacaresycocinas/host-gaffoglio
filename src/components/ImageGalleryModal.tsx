'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import ArrowIcon from './icons/ArrowIcon';
import CloseIcon from './icons/CloseIcon';
import { company } from '@/app/constants/constants';

interface ImageGalleryModalProps {
  images: string[];
  currentIndex: number;
  productId: string;
  marcaId: string;
  onClose: () => void;
}

const ImageGalleryModal = ({
  images,
  currentIndex,
  onClose,
}: ImageGalleryModalProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    startIndex: currentIndex, // Establecer la posición inicial directamente
  });

  const [selectedIndex, setSelectedIndex] = useState(currentIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePressedInContent, setMousePressedInContent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Función para cerrar con animación
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // Duración de la animación de salida
  }, [onClose]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const handleMouseDown = useCallback(() => {
    setIsDragging(false);
    setMousePressedInContent(true);
  }, []);

  const handleMouseMove = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      // Solo prevenir la propagación si realmente hubo drag
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        // Resetear el estado después de un pequeño delay para permitir clicks normales
        setTimeout(() => {
          setIsDragging(false);
          setMousePressedInContent(false);
        }, 100);
        return;
      }
      setIsDragging(false);
      setMousePressedInContent(false);
    },
    [isDragging]
  );

  // Resetear el estado después de un tiempo como medida de seguridad
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMousePressedInContent(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [mousePressedInContent]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Solo cerrar si el click fue directamente en el backdrop y no se presionó el mouse en el contenido
      if (e.target === e.currentTarget && !mousePressedInContent) {
        handleClose();
      }
    },
    [mousePressedInContent, handleClose]
  );

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Resetear el estado cuando cambie la imagen seleccionada (por swipe o navegación)
  useEffect(() => {
    setMousePressedInContent(false);
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
    };

    window.addEventListener('keydown', handleKeyDown);

    // Prevenir el scroll cuando el modal está abierto
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [handleClose, scrollPrev, scrollNext]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-200 ease-out ${
        isVisible && !isClosing
          ? 'bg-black/60 opacity-100'
          : 'bg-black/0 opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative rounded-lg overflow-hidden max-w-4xl w-full aspect-auto h-[50vh] md:h-[70vh] transition-all duration-200 ease-out transform ${
          isVisible && !isClosing
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 transition-colors z-50 bg-color-primary hover:bg-color-primary-dark/80 p-1.5 rounded-full ${
            company.dark ? 'text-color-title' : 'text-color-title-light'
          }`}
        >
          <CloseIcon className='w-6 h-6 lg:w-8 lg:h-8' />
        </button>

        {/* Contenedor del carrusel */}
        <div
          className='overflow-hidden h-full'
          ref={emblaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            cursor: mousePressedInContent ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <div className='flex h-full'>
            {images.map((image, index) => (
              <div
                key={index}
                className='relative min-w-full h-full'
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  cursor: mousePressedInContent ? 'grabbing' : 'grab',
                  userSelect: 'none',
                }}
              >
                <Image
                  priority
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className='object-contain w-full h-full'
                  style={{
                    objectPosition: 'center',
                    cursor: mousePressedInContent ? 'grabbing' : 'grab',
                    userSelect: 'none',
                  }}
                  draggable={false}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botones de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollPrev();
              }}
              className={`absolute left-2 top-1/2 -translate-y-1/2 transition-colors bg-color-primary hover:bg-color-primary-dark/80 p-2 rounded-full opacity-100 cursor-pointer ${
                company.dark ? 'text-color-title' : 'text-color-title-light'
              }`}
            >
              <ArrowIcon className='w-6 h-6 rotate-180' />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollNext();
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors bg-color-primary hover:bg-color-primary-dark/80 p-2 rounded-full opacity-100 cursor-pointer ${
                company.dark ? 'text-color-title' : 'text-color-title-light'
              }`}
            >
              <ArrowIcon className='w-6 h-6' />
            </button>
          </>
        )}

        {/* Contador de imágenes */}
        {images.length > 1 && (
          <div
            role='status'
            aria-label={`Imagen ${selectedIndex + 1} de ${images.length}`}
            className='pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-sm'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='h-3 w-3 shrink-0 text-white/80'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.83.83a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z'
                clipRule='evenodd'
              />
            </svg>
            <span>
              {selectedIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;
