'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimationControls } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';

import { company } from '@/app/constants/constants';

const HERO_SLIDES = [
  {
    mobile: '/assets/inicio/home-mobile-1.webp',
    desktop: '/assets/inicio/home-background-1.webp',
  },
  {
    mobile: '/assets/inicio/home-mobile-2.webp',
    desktop: '/assets/inicio/home-background-2.webp',
  },
  {
    mobile: '/assets/inicio/home-mobile-3.webp',
    desktop: '/assets/inicio/home-background-3.webp',
  },
] as const;

const autoplayDelay = 6500;

/** Zoom muy leve durante todo el tiempo visible (movimiento continuo lineal hasta el siguiente slide) */
const ZOOM_SUBTLE_START = 1;
const ZOOM_SUBTLE_END = 1.1;

const HeroHome = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 45, watchDrag: false },
    [Fade()],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  /** Sube en cada cambio de slide real para reiniciar el zoom desde cero en cada imagen */
  const [zoomCycle, setZoomCycle] = useState(0);
  const prevSnapRef = useRef<number | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const next = emblaApi.selectedScrollSnap();
    setSelectedIndex(next);
    // Solo al cambiar de slide real, no en el primer sync: si no, se remonta el motion al cargar y Framer pierde el zoom.
    if (prevSnapRef.current !== null && prevSnapRef.current !== next) {
      setZoomCycle((c) => c + 1);
    }
    prevSnapRef.current = next;
  }, [emblaApi]);

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

  /**
   * Autoplay manual (sin plugin): el plugin usa setTimeout y al volver de otra pestaña los timers
   * quedan desfasados o frenados; al parar el intervalo al ocultar y crear uno nuevo al volver, el ritmo es estable.
   */
  useEffect(() => {
    if (!emblaApi) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const clear = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const start = () => {
      clear();
      if (
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      )
        return;
      intervalId = setInterval(() => {
        if (
          typeof document !== 'undefined' &&
          document.visibilityState !== 'visible'
        )
          return;
        emblaApi.scrollNext();
      }, autoplayDelay);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clear();
        return;
      }
      setZoomCycle((c) => c + 1);
      start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clear();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [emblaApi]);

  const scrollTo = useCallback(
    (i: number) => {
      emblaApi?.scrollTo(i);
    },
    [emblaApi],
  );

  return (
    <section
      id='inicioSection'
      className='relative flex overflow-hidden bg-color-bg-secondary'
      aria-label='Bienvenida'
    >
      <div className='absolute inset-0 z-0'>
        <div
          ref={emblaRef}
          className='h-full w-full overflow-hidden'
          aria-roledescription='carrusel'
          aria-label='Imágenes destacadas de la concesionaria'
        >
          <div className='flex h-full touch-pan-y'>
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={slide.desktop}
                className='relative h-full min-w-0 flex-[0_0_100%]'
                role='group'
                aria-roledescription='diapositiva'
                aria-hidden={selectedIndex !== index}
              >
                <HeroSlideImage
                  mobileSrc={slide.mobile}
                  desktopSrc={slide.desktop}
                  isActive={selectedIndex === index}
                  priority={index === 0}
                  zoomCycle={zoomCycle}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className='absolute inset-0 bg-gradient-to-r from-color-bg-secondary-dark/70 via-color-bg-secondary-dark/60 to-color-bg-secondary-dark/70'
          aria-hidden
        />
        <div
          className='absolute inset-0 md:bg-gradient-to-b md:from-color-bg-secondary/70 md:via-transparent md:to-color-bg-secondary/70'
          aria-hidden
        />
      </div>

      <div className='relative z-10 flex flex-col items-center justify-end md:justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-28 md:pb-28 md:pt-36 lg:pb-36 lg:pt-36 xl:pb-52 xl:pt-52'>
        <div className='w-full text-center'>
          <div className='md:max-w-2xl lg:max-w-5xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='flex items-center justify-center gap-2 mb-4 md:mb-6'
            >
              <span
                className='w-20 lg:w-28 h-0.5 bg-gradient-to-l from-color-secondary to-color-primary/10'
                aria-hidden
              />
              <h1 className='font-exo italic text-nowrap text-color-title-light/90 text-xs md:text-sm font-semibold tracking-[0.25em]'>
                {company.name}
              </h1>
              <span
                className='w-20 lg:w-28 h-0.5 bg-gradient-to-r from-color-primary to-color-primary/10'
                aria-hidden
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='font-exo text-[34px] min-[380px]:text-[35px] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[85px] font-bold italic text-white tracking-tight leading-[1.15] mb-6 [text-shadow:0px_0px_10px_rgba(0,0,0,0.4)]'
            >
              <span className='block'>Tu próximo auto, </span>
              <span className='block text-color-primary-light mt-2 text-nowrap'>
                nuestro compromiso.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='text-color-text-light text-lg lg:text-xl max-w-md leading-relaxed mb-4 md:mb-6 mx-auto [text-shadow:0px_0px_10px_rgba(0,0,0,0.9)]'
            >
              Usados, 0km, financiación y permuta.
              <br className='hidden sm:block' />
              Todo lo que necesitás en un solo lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className='flex flex-col sm:flex-row gap-4 justify-center max-w-sm md:max-w-none mx-auto'
            >
              <Link
                href='/catalogo'
                className={`group inline-flex items-center justify-center gap-2 px-8 md:px-10 py-4 bg-color-primary ${company.dark ? 'text-color-title' : 'text-color-title-light'} font-medium text-lg tracking-wide hover:bg-color-primary-dark transition-colors duration-300`}
              >
                Ver usados
                <svg
                  className='w-4 h-4 group-hover:translate-x-0.5 transition-transform'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </Link>
              <Link
                href='/0km'
                className='group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-4 border border-white/40 text-white font-medium text-lg tracking-wide hover:border-color-secondary-light hover:text-color-secondary-light transition-all duration-300 backdrop-blur bg-white/5'
              >
                Catálogo 0km
                <svg
                  className='w-4 h-4 group-hover:translate-x-0.5 transition-transform'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Por encima del contenido (z-10); si van dentro del fondo z-0 quedan tapados y no reciben clic */}
      <div
        className='pointer-events-auto absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-1.5 md:bottom-8'
        role='tablist'
        aria-label='Seleccionar imagen del carrusel'
      >
        {HERO_SLIDES.map((slide, i) => {
          const isActive = selectedIndex === i;
          return (
            <button
              key={slide.desktop}
              type='button'
              role='tab'
              aria-selected={isActive}
              aria-label={`Ir a la imagen ${i + 1} de ${HERO_SLIDES.length}`}
              onClick={() => scrollTo(i)}
              className={[
                'inline-flex min-h-[44px] min-w-0 items-center justify-center rounded-full px-1.5 py-3',
                'cursor-pointer touch-manipulation transition-colors duration-300',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-color-primary-light',
              ].join(' ')}
            >
              <span
                className={[
                  'block h-2.5 shrink-0 rounded-full transition-all duration-300 ease-out',
                  isActive
                    ? 'w-8 bg-color-primary-light'
                    : 'w-2.5 bg-white/60 hover:bg-white',
                ].join(' ')}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};

function HeroSlideImage({
  mobileSrc,
  desktopSrc,
  isActive,
  priority,
  zoomCycle,
}: {
  mobileSrc: string;
  desktopSrc: string;
  isActive: boolean;
  priority?: boolean;
  zoomCycle: number;
}) {
  const t = autoplayDelay / 1000;
  const controlsMobile = useAnimationControls();
  const controlsDesktop = useAnimationControls();

  /**
   * Antes: `isActive` cambiaba entre `div+Image` y `motion.div+Image` y además `key` en motion remontaba
   * el `next/image` en cada slide → flash blanco/decodificación. Misma estructura siempre + controls.
   */
  useLayoutEffect(() => {
    if (!isActive) {
      controlsMobile.stop();
      controlsDesktop.stop();
      return;
    }
    controlsMobile.set({ scale: ZOOM_SUBTLE_START });
    controlsDesktop.set({ scale: ZOOM_SUBTLE_START });
    void controlsMobile.start({
      scale: ZOOM_SUBTLE_END,
      transition: { duration: t, ease: 'linear' },
    });
    void controlsDesktop.start({
      scale: ZOOM_SUBTLE_END,
      transition: { duration: t, ease: 'linear' },
    });
  }, [isActive, zoomCycle, t, controlsMobile, controlsDesktop]);

  return (
    <>
      <motion.div
        className='absolute inset-0 origin-center md:hidden will-change-transform'
        initial={false}
        animate={controlsMobile}
      >
        <Image
          src={mobileSrc}
          alt=''
          fill
          className='object-cover object-center'
          sizes='100vw'
          priority={priority}
          loading={priority ? undefined : 'eager'}
        />
      </motion.div>
      <motion.div
        className='absolute inset-0 origin-center hidden md:block will-change-transform'
        initial={false}
        animate={controlsDesktop}
      >
        <Image
          src={desktopSrc}
          alt=''
          fill
          className='object-cover object-center'
          sizes='100vw'
          priority={priority}
          loading={priority ? undefined : 'eager'}
        />
      </motion.div>
    </>
  );
}

export default HeroHome;
