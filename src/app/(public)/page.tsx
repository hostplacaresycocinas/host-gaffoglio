'use client';

import HeroHome from '@/components/HeroHome';
import Gallery from '@/components/Gallery';
import PreguntasHome from '@/components/PreguntasHome';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Proceso from '@/components/Proceso';
import CarsHome from '@/components/CarsHome';
import BrandsSection from '@/components/BrandsSection';
// import TestimoniosHome from '@/components/TestimoniosHome';

export default function Home() {
  return (
    <>
      <Header />
      <main className='flex flex-col w-full'>
        <HeroHome />
        <section className='flex flex-col gap-8 md:gap-10 lg:gap-12 mt-10 mb-10 md:mt-16 md:mb-16'>
          <CarsHome title='Nuestros Vehículos' />
        </section>
        <BrandsSection />
        <Proceso />
        <Gallery />
        {/* <TestimoniosHome /> */}
        <PreguntasHome />
      </main>
      <Footer />
    </>
  );
}
