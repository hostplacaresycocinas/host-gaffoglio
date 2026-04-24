'use client';

import Image from 'next/image';
import { company } from '@/app/constants/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const NosotrosPage = () => {
  return (
    <>
      <Header />

      {/* Hero Section con imagen de fondo */}
      <section className='relative h-44 md:h-60 lg:h-72 flex items-center justify-center overflow-hidden'>
        {/* Imagen de fondo con overlay */}
        <div className='absolute inset-0 z-0'>
          <Image
            src='/assets/nosotros/nosotros-banner.webp'
            alt={`Equipo de ${company.name}`}
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/80'></div>
        </div>

        {/* Contenido centrado */}
        <div className='relative z-10 text-center px-4 max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='inline-flex items-center gap-4 mb-4 md:mb-6'
          >
            <div className='w-10 h-px bg-color-primary/70' />
            <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)]'>
              Sobre Nosotros
            </span>
            <div className='w-10 h-px bg-color-primary/70' />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-white/90 text-xl sm:text-2xl md:text-3xl leading-tight font-semibold tracking-tight [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)] max-w-3xl mx-auto'
          >
            Tu socio de confianza para encontrar el vehículo perfecto
          </motion.p>
        </div>
      </section>

      {/* Sección de historia */}
      <section className='py-8 md:py-12'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='grid lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-16 items-center justify-center'>
            {/* Imagen */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className='relative'
            >
              <div className='mx-auto relative max-w-md lg:max-w-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] border border-white/10 group'>
                <Image
                  src='/assets/nosotros/nosotros-1.webp'
                  alt={`Equipo de ${company.name}`}
                  fill
                  className='object-cover w-full h-full'
                />
              </div>
              {/* Elemento decorativo */}
              <div className='absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full -z-10 hidden lg:block'></div>
            </motion.div>

            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className='max-w-lg flex flex-col items-center lg:items-start justify-center text-center lg:text-left'
            >
              <h2 className='text-white/90 text-2xl sm:text-3xl md:text-4xl leading-tight mb-5 max-w-xl [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)]'>
                <span className='font-bold'>{company.name}</span>
                <br />
                <span className='font-bold'>Concesionaria multimarca</span>
              </h2>
              <div className='space-y-4 text-white/80 text-sm sm:text-base leading-relaxed max-w-prose'>
                <p>
                  En {company.name} te ayudamos a encontrar el vehículo ideal,
                  con unidades usadas y 0km cuidadosamente seleccionadas para
                  distintos estilos de manejo y presupuesto.
                </p>
                <p>
                  Brindamos asesoramiento claro, opciones de financiación y una
                  atención transparente de principio a fin, para que vivas una
                  experiencia simple, segura y sin sorpresas.
                </p>
                <div className='pt-3'>
                  <div className='inline-flex items-center justify-center lg:justify-start gap-6 rounded-xl bg-white/5 backdrop-blur-md border border-color-primary/30 px-5 py-3'>
                    <div className='text-center lg:text-left'>
                      <p className='text-white/90 font-semibold text-sm md:text-base leading-none'>
                        Vehículos verificados
                      </p>
                    </div>

                    <div className='w-px h-8 bg-color-primary/35' />

                    <div className='text-center lg:text-left'>
                      <p className='text-white/90 font-semibold text-sm md:text-base leading-none'>
                        Financiación
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección de valores */}
      <section className='mt-8 md:mt-12 pb-16 md:pb-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className='text-center mb-5 md:mb-8'
          >
            <h2 className='text-white/90 text-2xl sm:text-3xl md:text-4xl leading-tight mb-2 md:mb-3 [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)]'>
              <span className='font-bold'>Nuestros</span>{' '}
              <span className='font-bold'>Valores</span>
            </h2>
            <p className='text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed'>
              Los pilares que sostienen nuestro compromiso con la calidad y la
              satisfacción del cliente.
            </p>
          </motion.div>

          {/* Valores Grid */}
          <div className='grid md:grid-cols-3 gap-5 lg:gap-6'>
            {/* Valor 1 - Excelencia */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className='relative'
            >
              <div className='bg-white/5 backdrop-blur-md relative overflow-hidden rounded-xl h-full border border-white/15'>
                <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-color-primary/50 to-transparent'></div>

                <div className='relative p-5 md:p-6'>
                  <div className='w-11 h-11 bg-color-primary/15 border border-color-primary/35 rounded-lg flex items-center justify-center mb-4'>
                    <svg
                      className='w-5 h-5 text-color-primary-light'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                      />
                    </svg>
                  </div>

                  {/* Contenido */}
                  <h3 className='text-white/90 text-xl md:text-2xl font-bold leading-tight mb-2'>
                    Excelencia
                  </h3>
                  <p className='text-white/75 leading-relaxed text-sm md:text-base'>
                    Seleccionamos cada unidad con criterios estrictos para
                    ofrecer calidad comprobada, buen estado general e historial
                    confiable antes de publicarla.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Valor 2 - Confianza */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className='relative'
            >
              <div className='bg-white/5 backdrop-blur-md relative overflow-hidden rounded-xl h-full border border-white/15'>
                <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-color-primary/50 to-transparent'></div>

                <div className='relative p-5 md:p-6'>
                  <div className='w-11 h-11 bg-color-primary/15 border border-color-primary/35 rounded-lg flex items-center justify-center mb-4'>
                    <svg
                      className='w-5 h-5 text-color-primary-light'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                  </div>

                  {/* Contenido */}
                  <h3 className='text-white/90 text-xl md:text-2xl font-bold leading-tight mb-2'>
                    Confianza
                  </h3>
                  <p className='text-white/75 leading-relaxed text-sm md:text-base'>
                    Trabajamos con transparencia, información clara y
                    acompañamiento en cada decisión, desde la primera consulta
                    hasta la entrega del vehículo.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Valor 3 - Innovación */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className='relative'
            >
              <div className='bg-white/5 backdrop-blur-md relative overflow-hidden rounded-xl h-full border border-white/15'>
                <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-color-primary/50 to-transparent'></div>

                <div className='relative p-5 md:p-6'>
                  <div className='w-11 h-11 bg-color-primary/15 border border-color-primary/35 rounded-lg flex items-center justify-center mb-4'>
                    <svg
                      className='w-5 h-5 text-color-primary-light'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                  </div>

                  {/* Contenido */}
                  <h3 className='text-white/90 text-xl md:text-2xl font-bold leading-tight mb-2'>
                    Innovación
                  </h3>
                  <p className='text-white/75 leading-relaxed text-sm md:text-base'>
                    Mejoramos procesos y herramientas para que comprar tu auto
                    sea simple, rapido y seguro, con una gestión más ágil y
                    opciones adaptadas a cada cliente.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default NosotrosPage;
