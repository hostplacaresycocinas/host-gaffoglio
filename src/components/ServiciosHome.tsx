'use client';

import Image from 'next/image';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';

const ServiciosHome = () => {
  const autoplayOptions = {
    delay: 2500,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  };

  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay(autoplayOptions),
    Fade(),
  ]);

  return (
    <div id='serviciosSection'>
      <section className='flex justify-center py-10'>
        <div className='flex flex-col gap-8 items-center my-10 lg:my-16 overflow-hidden'>
          <article>
            <div className='flex flex-col md:gap-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center'>
              <h3 className='text-color-primary'>Tu próximo vehículo</h3>
              <h3 className='text-color-secondary'>te esta esperando</h3>
            </div>
            <p className='text-color-text text-sm sm:text-base md:text-lg lg:text-xl text-center mt-2'>
              Cotización Sin Cargo - Sin Compromiso
            </p>
          </article>
          <article className=''>
            <div className='w-[500px] sm:w-[620px] md:w-[700px] lg:w-[1000px]'>
              <Image
                priority
                className='w-full h-full object-contain'
                src='/assets/servicios/pesos-dolares.webp'
                width={843}
                height={247}
                alt='servicio imagen'
              />
            </div>
          </article>
        </div>
      </section>
      <section className='flex flex-col items-center bg-color-bg-secondary py-16 sm:py-20 md:py-28 my-10 md:my-16'>
        <div className='mx-4'>
          <h4 className='flex flex-col gap-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-color-primary-light'>
            Vendemos También
          </h4>
          <p className='text-base sm:text-lg md:text-2xl font-semibold text-center text-color-title-light mt-1 md:mt-3'>
            Autos - Camionetas - Utilitarios - Usados - Nuevos
          </p>
        </div>
        <div ref={emblaRef} className={`overflow-hidden mt-4 sm:mt-6 md:mt-8`}>
          <div className='flex items-center overflow-hidden'>
            <article className='flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_50%]'>
              <div className='h-48 md:h-[320px] lg:h-[280px]'>
                <Image
                  className='w-full h-full object-contain'
                  src='/assets/servicios/autos-servicio.webp'
                  width={500}
                  height={300}
                  alt='imagen autos'
                />
              </div>
            </article>
            <article className='flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_50%]'>
              <div className='h-48 md:h-[320px] lg:h-[280px]'>
                <Image
                  className='w-full h-full object-contain'
                  src='/assets/servicios/camionetas-servicio.webp'
                  width={500}
                  height={300}
                  alt='imagen camionetas'
                />
              </div>
            </article>
            <article className='flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_50%]'>
              <div className='h-48 md:h-[320px] lg:h-[280px]'>
                <Image
                  className='w-full h-full object-contain'
                  src='/assets/servicios/utilitarios-servicio.webp'
                  width={500}
                  height={300}
                  alt='imagen utilitarios'
                />
              </div>
            </article>
            <article className='flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_50%]'>
              <div className='h-48 md:h-[320px] lg:h-[280px]'>
                <Image
                  className='w-full h-full object-contain'
                  src='/assets/servicios/usados-servicio.webp'
                  width={500}
                  height={300}
                  alt='imagen usados'
                />
              </div>
            </article>
            <article className='flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_50%]'>
              <div className='h-48 md:h-[320px] lg:h-[280px]'>
                <Image
                  className='w-full h-full object-contain'
                  src='/assets/servicios/nuevos-servicio.webp'
                  width={500}
                  height={300}
                  alt='imagen nuevos'
                />
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiciosHome;
