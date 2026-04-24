'use client';

import { company } from '@/app/constants/constants';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useState } from 'react';

const VentaPage = () => {
  const [formData, setFormData] = useState({
    // Datos del vehículo
    marca: '',
    modelo: '',
    anio: '',
    kilometraje: '',
    version: '',
    color: '',
    estadoGeneral: '',
    // Documentación
    documentacionAlDia: '',
    verificacionTecnica: '',
    observaciones: '',
    // Datos de contacto
    nombreCompleto: '',
    telefono: '',
    email: '',
    localidad: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mensaje =
      `*Quiero vender mi vehículo*\n\n` +
      `*Datos del vehículo:*\n` +
      `Marca: ${formData.marca}\n` +
      `Modelo: ${formData.modelo}\n` +
      `Año: ${formData.anio}\n` +
      `Kilometraje: ${formData.kilometraje}\n` +
      `Versión/Motor/Caja: ${formData.version}\n` +
      `Color: ${formData.color}\n` +
      `Estado General: ${formData.estadoGeneral}\n\n` +
      `*Documentación:*\n` +
      `Documentación al día: ${formData.documentacionAlDia}\n` +
      `Verificación técnica: ${formData.verificacionTecnica}\n` +
      (formData.observaciones
        ? `Observaciones: ${formData.observaciones}\n\n`
        : '\n') +
      `*Datos de contacto:*\n` +
      `Nombre: ${formData.nombreCompleto}\n` +
      `Teléfono: ${formData.telefono}\n` +
      `Email: ${formData.email}\n` +
      `Localidad: ${formData.localidad}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=549${
      company.whatsapp[0]
    }&text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <Header />
      <main className='bg-gradient-to-b'>
        {/* Hero Section */}
        <section className='w-full pt-8 pb-6 md:pt-14 md:pb-12 lg:pt-16 lg:pb-10 flex justify-center items-center'>
          <div className='max-w-6xl w-full flex justify-center mx-4 sm:mx-6 md:mx-8 lg:mx-10'>
            <div className='text-center'>
              <h3 className='text-sm sm:text-base text-color-primary uppercase tracking-wider mb-1'>
                COMPRAMOS TU VEHÍCULO
              </h3>
              <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-color-title mb-2 md:mb-4'>
                FORMULARIO DE VENTA
              </h2>
              <div className='flex items-center justify-center w-full max-w-sm md:max-w-md mx-auto px-4'>
                <div className='h-0.5 flex-grow bg-gradient-to-r from-transparent via-color-primary to-transparent'></div>
              </div>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section className='pb-16'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6'>
            <div className='flex flex-col gap-2 lg:gap-3 items-center justify-center text-center mb-8 md:mb-12'>
              <p className='text-lg lg:text-xl text-color-text max-w-xl lg:max-w-3xl text-center'>
                Complete el siguiente formulario con los datos de su vehículo y
                nos pondremos en contacto con usted a la brevedad.
              </p>
              <p className='text-lg lg:text-xl text-color-text max-w-xl lg:max-w-3xl text-center'>
                Al enviar el formulario, los datos serán enviados directamente a
                nuestro WhatsApp para una atención más rápida y personalizada.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className='space-y-5 bg-white/50 p-3 rounded-xl [box-shadow:0_0_10px_rgba(0,0,0,0.08)] border border-color-primary-light/50'
            >
              {/* Datos del vehículo */}
              <div className='p-6 space-y-6 '>
                <h3 className='text-xl font-semibold text-color-title mb-4'>
                  Datos del vehículo
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Marca *
                    </label>
                    <input
                      type='text'
                      name='marca'
                      required
                      value={formData.marca}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Modelo *
                    </label>
                    <input
                      type='text'
                      name='modelo'
                      required
                      value={formData.modelo}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Año de fabricación *
                    </label>
                    <input
                      type='number'
                      name='anio'
                      required
                      min='1900'
                      max={new Date().getFullYear()}
                      value={formData.anio}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Kilometraje *
                    </label>
                    <input
                      type='number'
                      name='kilometraje'
                      required
                      min='0'
                      value={formData.kilometraje}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Versión/Motor/Caja *
                    </label>
                    <input
                      type='text'
                      name='version'
                      required
                      value={formData.version}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Color *
                    </label>
                    <input
                      type='text'
                      name='color'
                      required
                      value={formData.color}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Estado general *
                    </label>
                    <textarea
                      name='estadoGeneral'
                      required
                      value={formData.estadoGeneral}
                      onChange={handleChange}
                      rows={3}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                </div>
              </div>

              {/* Documentación */}
              <div className='p-6 space-y-6'>
                <h3 className='text-xl font-semibold text-color-title mb-4'>
                  Documentación
                </h3>
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Posee título y documentación al día *
                    </label>
                    <select
                      name='documentacionAlDia'
                      required
                      value={formData.documentacionAlDia}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    >
                      <option value=''>Seleccione una opción</option>
                      <option value='Si'>Sí</option>
                      <option value='No'>No</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Posee verificación técnica vigente *
                    </label>
                    <select
                      name='verificacionTecnica'
                      required
                      value={formData.verificacionTecnica}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    >
                      <option value=''>Seleccione una opción</option>
                      <option value='Si'>Sí</option>
                      <option value='No'>No</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Observaciones adicionales
                    </label>
                    <textarea
                      name='observaciones'
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows={3}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                </div>
              </div>

              {/* Datos de contacto */}
              <div className='p-6 space-y-6'>
                <h3 className='text-xl font-semibold text-color-title mb-4'>
                  Datos de contacto
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Nombre completo *
                    </label>
                    <input
                      type='text'
                      name='nombreCompleto'
                      required
                      value={formData.nombreCompleto}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Teléfono *
                    </label>
                    <input
                      type='tel'
                      name='telefono'
                      required
                      value={formData.telefono}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Email *
                    </label>
                    <input
                      type='email'
                      name='email'
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-color-text mb-2'>
                      Localidad *
                    </label>
                    <input
                      type='text'
                      name='localidad'
                      required
                      value={formData.localidad}
                      onChange={handleChange}
                      className='w-full px-4 py-2 rounded-lg bg-white/50 border border-color-primary-light/30 text-color-text focus:outline-none focus:ring-2 focus:ring-color-primary-light'
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-center'>
                <button
                  type='submit'
                  className='px-8 py-3 mb-5 lg:mb-7 bg-color-primary hover:bg-color-primary-dark text-white rounded-lg font-medium transition-colors duration-300'
                >
                  Enviar formulario por WhatsApp
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default VentaPage;
