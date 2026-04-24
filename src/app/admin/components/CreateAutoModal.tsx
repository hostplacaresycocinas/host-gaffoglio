'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ImageUpload } from './ImageUpload';

interface FormFields {
  marca: string;
  modelo: string;
  año: number;
  kilometraje: number;
  transmision: string;
  combustible: string;
  puertas: number;
  precio: number;
  descripcion: string;
  categoria: string;
  color: string;
}

interface CreateAutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: globalThis.FormData) => Promise<void>;
}

const CreateAutoModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateAutoModalProps) => {
  const [formData, setFormData] = useState<FormFields>({
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    kilometraje: 0,
    transmision: 'Manual',
    combustible: '',
    puertas: 0,
    precio: 0,
    descripcion: '',
    categoria: 'Auto',
    color: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      // Validar campos requeridos
      if (
        !formData.marca ||
        !formData.modelo ||
        !formData.año ||
        !formData.precio ||
        !formData.descripcion ||
        !formData.categoria ||
        !formData.transmision ||
        !formData.combustible ||
        !formData.puertas
      ) {
        alert('Por favor, complete todos los campos requeridos');
        return;
      }

      // Crear FormData para enviar al backend
      const submitFormData = new FormData();
      submitFormData.append('brand', formData.marca);
      submitFormData.append('model', formData.modelo);
      submitFormData.append('year', formData.año.toString());
      submitFormData.append('price', formData.precio.toString());
      submitFormData.append('description', formData.descripcion);
      submitFormData.append('category', formData.categoria);
      submitFormData.append('mileage', formData.kilometraje.toString());
      submitFormData.append('transmission', 'Manual');
      submitFormData.append('fuel', formData.combustible);
      submitFormData.append('doors', formData.puertas.toString());
      submitFormData.append('color', formData.color);

      // Agregar imágenes si existen
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          submitFormData.append('images', file);
        });
      }

      // Enviar al componente padre
      await onSubmit(submitFormData);

      // Limpiar formulario
      setFormData({
        marca: '',
        modelo: '',
        año: new Date().getFullYear(),
        kilometraje: 0,
        transmision: 'Manual',
        combustible: '',
        puertas: 0,
        precio: 0,
        descripcion: '',
        categoria: 'Auto',
        color: '',
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const inputStyles =
    'mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-base shadow-sm placeholder-gray-400 focus:outline-none focus:border-color-secondary focus:ring-1 focus:ring-color-secondary transition-colors';
  const selectStyles =
    'mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-base shadow-sm focus:outline-none focus:border-color-secondary focus:ring-1 focus:ring-color-secondary transition-colors';
  const textareaStyles =
    'mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-base shadow-sm placeholder-gray-400 focus:outline-none focus:border-color-secondary focus:ring-1 focus:ring-color-secondary transition-colors';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title
                  as='h3'
                  className='text-lg font-medium leading-6 text-gray-900 mb-4'
                >
                  Agregar Nuevo Auto
                </Dialog.Title>

                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Modelo
                      </label>
                      <input
                        type='text'
                        value={formData.modelo}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            modelo: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder='Ej: Focus, Cruze, Corolla'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Marca
                      </label>
                      <input
                        type='text'
                        value={formData.marca}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            marca: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder='Ej: Ford, Chevrolet, Toyota'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Año
                      </label>
                      <input
                        type='number'
                        value={formData.año}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            año: parseInt(e.target.value),
                          }))
                        }
                        className={inputStyles}
                        placeholder='Ingrese el año del vehículo'
                        min='1900'
                        max={new Date().getFullYear()}
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Kilometraje
                      </label>
                      <input
                        type='text'
                        value={formData.kilometraje.toLocaleString('es-AR')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\./g, '');
                          if (!isNaN(Number(value))) {
                            setFormData((prev) => ({
                              ...prev,
                              kilometraje: parseInt(value),
                            }));
                          }
                        }}
                        className={inputStyles}
                        placeholder='Ingrese el kilometraje del vehículo'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Categoría
                      </label>
                      <input
                        type='text'
                        value={formData.categoria}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            categoria: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder='Ej: Auto, SUV, Camioneta'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Transmisión
                      </label>
                      <select
                        value={formData.transmision}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            transmision: e.target.value,
                          }))
                        }
                        className={selectStyles}
                        required
                      >
                        <option value=''>
                          Seleccionar tipo de transmisión
                        </option>
                        <option value='Manual'>Manual</option>
                        <option value='Automática'>Automática</option>
                        <option value='CVT'>CVT</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Color
                      </label>
                      <input
                        type='text'
                        value={formData.color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                        className={inputStyles}
                        placeholder='Ej: Negro, Blanco, Rojo'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Combustible
                      </label>
                      <select
                        value={formData.combustible}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            combustible: e.target.value,
                          }))
                        }
                        className={selectStyles}
                        required
                      >
                        <option value=''>
                          Seleccionar tipo de combustible
                        </option>
                        <option value='Nafta'>Nafta</option>
                        <option value='Diésel'>Diésel</option>
                        <option value='GNC'>GNC</option>
                        <option value='Eléctrico'>Eléctrico</option>
                        <option value='Híbrido'>Híbrido</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Puertas
                      </label>
                      <select
                        value={formData.puertas}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            puertas: parseInt(e.target.value),
                          }))
                        }
                        className={selectStyles}
                        required
                      >
                        <option value=''>
                          Seleccionar cantidad de puertas
                        </option>
                        <option value='2'>2 puertas</option>
                        <option value='3'>3 puertas</option>
                        <option value='4'>4 puertas</option>
                        <option value='5'>5 puertas</option>
                        <option value='6'>6 puertas</option>
                        <option value='7'>7 puertas</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700'>
                        Precio
                      </label>
                      <input
                        type='text'
                        value={formData.precio.toLocaleString('es-AR')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\./g, '');
                          if (!isNaN(Number(value))) {
                            setFormData((prev) => ({
                              ...prev,
                              precio: parseInt(value),
                            }));
                          }
                        }}
                        className={inputStyles}
                        placeholder='Ingrese el precio del vehículo'
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          descripcion: e.target.value,
                        }))
                      }
                      className={textareaStyles}
                      rows={4}
                      placeholder='Detalles adicionales del vehículo'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      Imágenes
                    </label>
                    <ImageUpload
                      onImagesSelected={handleImagesSelected}
                      maxFiles={20}
                      accept='image/*'
                    />
                  </div>

                  <div className='mt-6 flex justify-end space-x-3'>
                    <button
                      type='button'
                      onClick={onClose}
                      className='px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-secondary'
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type='submit'
                      className='px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-color-primary-admin hover:bg-color-primary-admin/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-secondary flex items-center'
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <svg
                            className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                          Creando...
                        </>
                      ) : (
                        'Crear Auto'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateAutoModal;
