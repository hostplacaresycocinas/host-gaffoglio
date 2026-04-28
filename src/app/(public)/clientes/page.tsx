'use client';

import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { company } from '@/app/constants/constants';
import { motion } from 'framer-motion';
import { SectionTitleItaly } from '@/components/SectionTitleItaly';
import { useRef } from 'react';

const clientes = [
  {
    id: 'clientes-1',
  },
  {
    id: 'clientes-2',
  },
  {
    id: 'clientes-3',
  },
  {
    id: 'clientes-4',
  },
  {
    id: 'clientes-5',
  },
  {
    id: 'clientes-6',
  },
] as const;

const ClientesPage = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handlePlay = (currentIndex: number) => {
    videoRefs.current.forEach((video, index) => {
      if (!video || index === currentIndex) return;
      if (!video.paused) {
        video.pause();
      }
    });
  };

  return (
    <>
      <Header />

      <section className='relative h-44 md:h-60 lg:h-72 flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <Image
            src='/assets/contacto/contacto-banner.webp'
            alt='Clientes de Gaffoglio Multimarcas'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/80' />
        </div>
        <div className='relative z-10 text-center px-4 max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <SectionTitleItaly
              title='Clientes'
              as='h1'
              className='!mb-0'
              titleClassName='[text-shadow:0px_0px_10px_rgba(0,0,0,0.6)]'
              subtitle='Historias reales de quienes ya eligieron su próximo auto'
              subtitleVariant='banner'
            />
          </motion.div>
        </div>
      </section>

      <section className='py-10 md:py-14 lg:py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'>
            {clientes.map((cliente, i) => (
              <motion.article
                key={cliente.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: '0px 0px -100px 0px' }}
                className='relative overflow-hidden rounded-xl md:rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md'
              >
                <div className='relative aspect-[9/16] bg-black'>
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={`/assets/clientes/${cliente.id}.mp4`}
                    className='h-full w-full object-contain bg-black'
                    controls
                    playsInline
                    preload='metadata'
                    onPlay={() => handlePlay(i)}
                  />
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            className='mt-8 md:mt-10 text-center rounded-xl md:rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6 md:p-8'
          >
            <p className='text-white/85 text-base md:text-lg leading-relaxed'>
              Vos también podés ser el próximo.
              <span className='text-color-primary-light'>
                {' '}
                Seguinos en Instagram
              </span>{' '}
              y conocé entregas, novedades y oportunidades.
            </p>
            <a
              href={`https://www.instagram.com/${company.instagram}/`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex mt-5 items-center justify-center gap-2 rounded-lg bg-color-primary px-6 py-3 text-color-title-light font-semibold hover:bg-color-primary-dark transition-colors'
            >
              Ir a Instagram
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ClientesPage;
