'use client';

import { company } from '@/app/constants/constants';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const ConsignacionPage = () => {
  const beneficios = [
    {
      titulo: 'Tasación objetiva y actualizada',
      descripcion:
        'Realizamos una evaluación precisa del valor de tu vehículo basada en el mercado actual.',
      icono: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-8 w-8'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
    },
    {
      titulo: 'Estrategia de venta personalizada',
      descripcion:
        'Desarrollamos un plan de venta adaptado a las condiciones actuales del mercado para maximizar el valor de tu vehículo.',
      icono: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-8 w-8'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
    },
    {
      titulo: 'Gestión integral de consultas',
      descripcion:
        'Manejamos todas las consultas, negociaciones y visitas de potenciales compradores de manera profesional.',
      icono: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-8 w-8'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z'
          />
        </svg>
      ),
    },
    {
      titulo: 'Asesoramiento administrativo',
      descripcion:
        'Te brindamos soporte completo en todos los trámites administrativos necesarios para la venta.',
      icono: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-8 w-8'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      ),
    },
    {
      titulo: 'Gestión de la venta completa',
      descripcion:
        'Nos encargamos de todo el proceso de venta desde el inicio hasta la finalización exitosa.',
      icono: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-8 w-8'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
          />
        </svg>
      ),
    },
    {
      titulo: 'Seguridad y transparencia',
      descripcion:
        'Garantizamos un proceso seguro y transparente en cada etapa de la operación.',
      icono: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-8 w-8'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className='bg-gradient-to-b '>
        {/* Hero Section */}
        <section className='w-full pt-8 pb-6 md:pt-14 md:pb-12 lg:pt-16 lg:pb-10 flex justify-center items-center'>
          <div className='max-w-6xl w-full flex justify-center mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
            <div className='text-center'>
              <h3 className='text-sm sm:text-base text-color-primary uppercase tracking-wider mb-1'>
                VENDEMOS TU VEHÍCULO
              </h3>
              <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-color-title mb-2 md:mb-4'>
                CONSIGNACIÓN
              </h2>
              <div className='flex items-center justify-center w-full max-w-sm md:max-w-md mx-auto px-4'>
                <div className='h-0.5 flex-grow bg-gradient-to-r from-transparent via-color-primary to-color-trasparent'></div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className=''>
          <div className='max-w-6xl mx-auto px-4 sm:px-6'>
            <div className='flex flex-col gap-2 lg:gap-3 items-center justify-center text-center mb-8 md:mb-12'>
              <p className='text-lg lg:text-xl text-color-text max-w-xl lg:max-w-3xl text-center'>
                Nuestra experiencia en el mercado automotor nos permite ofrecer
                un servicio confiable, transparente y eficiente para la venta de
                su automóvil.
              </p>
              <p className='text-lg lg:text-xl text-color-text max-w-xl lg:max-w-3xl text-center'>
                En SPEED MOTORS ofrecemos un servicio integral de intermediación
                para la venta de su automóvil. Nos ocupamos de todo el proceso,
                garantizando:
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 xl:gap-12 place-items-center'>
              {beneficios.map((beneficio, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className='bg-gradient-to-b from-color-primary-dark to-color-secondary p-6 rounded-xl shadow-lg hover:shadow-xl aspect-[4/3] transition-shadow duration-300 max-w-sm'
                >
                  <div className='text-color-primary-light mb-4'>
                    {beneficio.icono}
                  </div>
                  <h3 className='text-xl font-semibold text-color-title-light mb-2'>
                    {beneficio.titulo}
                  </h3>
                  <p className='text-color-text-light'>
                    {beneficio.descripcion}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className='flex justify-center pt-10 md:pt-16 pb-10 md:pb-16'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            viewport={{
              once: true,
              margin: '0px 0px -100px 0px',
            }}
            className='max-w-2xl lg:max-w-6xl w-full bg-color-secondary rounded-lg shadow-[0_8px_30px_-15px_rgba(0,0,0,0.7)] p-6 md:p-8 border border-neutral-800 mx-4 sm:mx-6 md:mx-8 lg:mx-10 text-center'
          >
            <h3 className='text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-2 md:mb-4 max-w-2xl mx-auto'>
              Maximizamos el valor de su vehículo, minimizando su tiempo y
              riesgos.
            </h3>
            <p className='text-white/70 max-w-2xl mx-auto mb-3 md:mb-5 lg:text-lg'>
              Nuestro equipo está listo para asesorarte y concretar la
              consignación de tu auto. Contactanos para obtener más información.
            </p>
            <div className='flex gap-4 justify-center'>
              <a
                href={`https://api.whatsapp.com/send?phone=549${company.whatsapp[0]}&text=Hola! Quiero consignar mi vehículo`}
                target='_blank'
                rel='noopener noreferrer'
                className='lg:text-lg bg-color-primary hover:bg-color-primary-dark text-white py-3 px-8 rounded-md font-medium transition-all duration-300'
              >
                Consignar
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ConsignacionPage;
