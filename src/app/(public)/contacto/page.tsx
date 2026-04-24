'use client';

import { company } from '@/app/constants/constants';
import ClockIcon from '@/components/icons/ClockIcon';
import EmailFillIcon from '@/components/icons/EmailFillIcon';
import FacebookIcon from '@/components/icons/FacebookIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import WhatsappFillIcon from '@/components/icons/WhatsappFillIcon';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

const whatsappUrl = `https://api.whatsapp.com/send?phone=549${company.whatsapp[0]}&text=Hola! Quería hacer una consulta sobre un vehículo`;
const whatsappLabel = `+54 9 ${company.whatsapp[0]}`;

const ContactoPage = () => {
  return (
    <>
      <Header />

      {/* Banner */}
      <section
        className='relative overflow-hidden bg-color-bg-secondary-dark'
        aria-label='Contacto'
      >
        <div className='relative w-full aspect-[4/1] min-h-[200px] max-h-[320px]'>
          <Image
            src='/assets/contacto/contacto-banner.webp'
            alt=''
            fill
            className='object-cover object-center'
            priority
            sizes='100vw'
          />
          <div
            className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/80'
            aria-hidden
          />
          <div className='absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto w-full text-center'>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='inline-flex items-center gap-4 mb-3 md:mb-4'
              >
                <div className='w-10 h-px bg-color-primary/70' />
                <span className='text-white text-xs tracking-[0.5em] uppercase font-semibold [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)]'>
                  Contacto
                </span>
                <div className='w-10 h-px bg-color-primary/70' />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className='text-white/90 text-xl sm:text-2xl md:text-3xl leading-tight font-semibold tracking-tight [text-shadow:0px_0px_10px_rgba(0,0,0,0.6)] max-w-3xl mx-auto'
              >
                Escribinos y te asesoramos
              </motion.h1>
            </div>
          </div>
        </div>
      </section>

      {/* Horarios + Redes + Mapa */}
      <section
        className='pt-10 md:pt-12 lg:pt-16'
        aria-labelledby='contacto-heading'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-2 gap-6 lg:gap-8 items-start'>
            {/* Horarios — día por día */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className='relative overflow-hidden p-8 md:p-10 lg:p-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/15'
            >
              <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-color-primary/50 to-transparent' />
              <div className='flex items-center gap-3 mb-6'>
                <span className='flex w-11 h-11 items-center justify-center rounded-xl bg-color-primary/15 border border-color-primary/35 text-color-primary-light'>
                  <ClockIcon className='w-6 h-6' aria-hidden />
                </span>
                <h2
                  id='contacto-heading'
                  className='text-white/90 text-xl md:text-2xl font-bold'
                >
                  Horarios de atención
                </h2>
              </div>
              <ul className='divide-y divide-white/10' role='list'>
                {(company.openHours ?? []).map((line, index) => (
                  <li key={index} className='py-3 md:py-4'>
                    <span className='text-sm sm:text-base text-white/80'>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Redes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className='p-2 md:p-0'
            >
              <div className='flex items-center gap-3 mb-5 md:mb-6'>
                <span className='flex w-11 h-11 items-center justify-center rounded-xl bg-color-primary/15 border border-color-primary/35 text-color-primary-light'>
                  <InstagramIcon className='w-6 h-6' aria-hidden />
                </span>
                <h3 className='text-white/90 text-xl md:text-2xl font-bold'>
                  Redes
                </h3>
              </div>

              <div className='grid sm:grid-cols-2 gap-4'>
                <a
                  href={`https://www.instagram.com/${company.instagram}/`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex flex-col items-center text-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-color-primary/40 px-6 py-7 md:px-8 md:py-8 transition-colors'
                >
                  <span className='flex w-14 h-14 items-center justify-center rounded-2xl bg-color-primary/15 border border-color-primary/35 text-color-primary-light mb-4'>
                    <InstagramIcon className='w-7 h-7' aria-hidden />
                  </span>
                  <p className='text-white font-semibold text-base md:text-lg leading-none mb-2'>
                    Instagram
                  </p>
                  <span className='text-white/80 text-sm font-semibold tracking-wide'>
                    Ver perfil
                  </span>
                </a>

                <a
                  href={whatsappUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex flex-col items-center text-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-color-primary/40 px-6 py-7 md:px-8 md:py-8 transition-colors'
                >
                  <span className='flex w-14 h-14 items-center justify-center rounded-2xl bg-color-primary/15 border border-color-primary/35 text-color-primary-light mb-4'>
                    <WhatsappFillIcon className='w-7 h-7' aria-hidden />
                  </span>
                  <p className='text-white font-semibold text-base md:text-lg leading-none mb-2'>
                    WhatsApp
                  </p>
                  <span className='text-white/80 text-sm font-semibold tracking-wide'>
                    Abrir chat
                  </span>
                </a>

                {company.facebook && (
                  <a
                    href={company.facebook}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group flex flex-col items-center text-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-color-primary/40 px-6 py-7 md:px-8 md:py-8 transition-colors'
                  >
                    <span className='flex w-14 h-14 items-center justify-center rounded-2xl bg-color-primary/15 border border-color-primary/35 text-color-primary-light mb-4'>
                      <FacebookIcon className='w-7 h-7' aria-hidden />
                    </span>
                    <p className='text-white font-semibold text-base md:text-lg leading-none mb-2'>
                      Facebook
                    </p>
                    <span className='text-white/80 text-sm font-semibold tracking-wide'>
                      Ver página
                    </span>
                  </a>
                )}

                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className='group flex flex-col items-center text-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-color-primary/40 px-6 py-7 md:px-8 md:py-8 transition-colors'
                  >
                    <span className='flex w-14 h-14 items-center justify-center rounded-2xl bg-color-primary/15 border border-color-primary/35 text-color-primary-light mb-4'>
                      <EmailFillIcon className='w-7 h-7' aria-hidden />
                    </span>
                    <p className='text-white font-semibold text-base md:text-lg leading-none mb-2'>
                      Email
                    </p>
                    <span className='text-white/80 text-sm font-semibold tracking-wide'>
                      Enviar correo
                    </span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Mapa completo abajo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className='mt-8 lg:mt-10'
          >
            <div className='flex items-center justify-between gap-3 mb-5 md:mb-6'>
              <div className='flex items-center gap-3'>
                <span className='flex w-11 h-11 items-center justify-center rounded-xl bg-color-primary/15 border border-color-primary/35 text-color-primary-light'>
                  <svg
                    className='w-6 h-6'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    aria-hidden='true'
                  >
                    <path
                      d='M12 22s7-4.5 7-12a7 7 0 10-14 0c0 7.5 7 12 7 12z'
                      stroke='currentColor'
                      strokeWidth='1.6'
                    />
                    <path
                      d='M12 13.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4z'
                      stroke='currentColor'
                      strokeWidth='1.6'
                    />
                  </svg>
                </span>
                <h3 className='text-white/90 text-xl md:text-2xl font-bold'>
                  Ubicación
                </h3>
              </div>

              {company.googlemapsLink && company.googlemapsLink !== 'null' && (
                <a
                  href={company.googlemapsLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/80 text-xs sm:text-sm font-semibold tracking-wide hover:text-color-primary-light transition-colors'
                >
                  Abrir en Maps
                </a>
              )}
            </div>

            {company.googlemaps ? (
              <iframe
                src={company.googlemaps}
                className='w-full h-[360px] md:h-[460px]'
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                allowFullScreen
                title={`Mapa de ${company.name}`}
              />
            ) : (
              <p className='text-white/70 text-sm'>
                Mapa no disponible por el momento.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA final */}
      <section
        className='pt-10 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24'
        aria-label='Escribinos'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <motion.a
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            href={whatsappUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='group block relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors duration-300 backdrop-blur-md p-10 md:p-12 lg:p-16 text-center w-full'
          >
            <div
              className='absolute inset-0 bg-gradient-to-br from-white/7 via-transparent to-transparent'
              aria-hidden
            />
            <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-color-primary/50 to-transparent' />
            <p className='relative text-white/80 text-sm sm:text-base md:text-lg mb-3'>
              ¿Listo para tu próximo auto?
            </p>
            <h2 className='relative text-white/90 text-2xl md:text-3xl lg:text-4xl font-bold mb-6 [text-shadow:0px_0px_10px_rgba(0,0,0,0.45)]'>
              Escribinos por WhatsApp
            </h2>
            <span className='relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-xl bg-color-primary text-white font-semibold text-base md:text-lg transition-colors duration-200 hover:bg-color-primary-dark'>
              <WhatsappFillIcon className='w-6 h-6 md:w-7 md:h-7' aria-hidden />
              Consultar por WhatsApp
            </span>
          </motion.a>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ContactoPage;
