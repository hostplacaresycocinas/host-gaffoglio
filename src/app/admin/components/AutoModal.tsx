'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ImageUpload } from './ImageUpload';
import { Auto } from '@/types/auto';
import Cookies from 'js-cookie';
import { ChevronDown } from 'lucide-react';
import { API_BASE_URL, TENANT } from '@/app/constants/constants';

interface FileWithOrientation extends File {
  orientation?: number;
}

interface AutoFormData {
  id?: string;
  marca: string;
  marcaId: string;
  modelo: string;
  año: string;
  kilometraje: number;
  transmision: string;
  combustible: string;
  puertas: number;
  precio: number;
  currency: 'USD' | 'ARS';
  descripcion: string;
  imagenes: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
  categoria: string;
  color: string;
}

interface AutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<AutoFormData, 'id'> & {
      images?: File[];
      imagesToDelete?: string[];
      imageOrder?: Array<{ id: string; order: number }>;
    }
  ) => void;
  initialData?: Auto;
}

interface Category {
  id: string;
  name: string;
}

const AutoModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: AutoModalProps) => {
  const [formData, setFormData] = useState<AutoFormData>(
    initialData
      ? {
          ...initialData,
          año: initialData.año?.toString() || '',
          imagenes: [],
          color: '',
          currency: initialData.currency || 'USD',
          puertas: initialData.puertas || 0,
        }
      : {
          marca: '',
          marcaId: '',
          modelo: '',
          año: '',
          kilometraje: 0,
          transmision: '',
          combustible: '',
          puertas: 0,
          precio: 0,
          currency: 'USD',
          descripcion: '',
          imagenes: [],
          categoria: '',
          color: '',
        }
  );

  const [selectedFiles, setSelectedFiles] = useState<FileWithOrientation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imageOrder, setImageOrder] = useState<
    Array<{ id: string; order: number }>
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMarcaDropdown, setShowMarcaDropdown] = useState(false);
  const [showCombustibleDropdown, setShowCombustibleDropdown] = useState(false);
  const [showPuertasDropdown, setShowPuertasDropdown] = useState(false);
  const [showTransmisionDropdown, setShowTransmisionDropdown] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const marcaInputRef = useRef<HTMLInputElement>(null);
  const combustibleInputRef = useRef<HTMLInputElement>(null);
  const puertasInputRef = useRef<HTMLInputElement>(null);
  const transmisionInputRef = useRef<HTMLInputElement>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Función para capitalizar la primera letra
  const capitalizeFirst = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Opciones para los selectores
  const combustibleOptions = ['Nafta', 'Diesel', 'GNC', 'Eléctrico', 'Híbrido'];
  const puertasOptions = ['2', '3', '4', '5', '6', '7'];
  const transmisionOptions = ['Manual', 'Automática', 'CVT'];

  // Cargar categorías del API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/categories?tenant=${TENANT}`
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    // Cargar marcas del API
    const fetchMarcas = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cars/brands?tenant=${TENANT}`
        );
        if (response.ok) {
          const data = await response.json();
          setMarcas(data.sort());
        }
      } catch (error) {
        console.error('Error al cargar marcas:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
      fetchMarcas();
    }
  }, [isOpen]);

  // Cerrar los dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }

      if (
        marcaInputRef.current &&
        !marcaInputRef.current.contains(event.target as Node)
      ) {
        setShowMarcaDropdown(false);
      }

      if (
        combustibleInputRef.current &&
        !combustibleInputRef.current.contains(event.target as Node)
      ) {
        setShowCombustibleDropdown(false);
      }

      if (
        puertasInputRef.current &&
        !puertasInputRef.current.contains(event.target as Node)
      ) {
        setShowPuertasDropdown(false);
      }

      if (
        transmisionInputRef.current &&
        !transmisionInputRef.current.contains(event.target as Node)
      ) {
        setShowTransmisionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Resetear el estado cuando el modal se abre o se cierra
  useEffect(() => {
    if (!isOpen) {
      // Limpiar el estado solo cuando se cierra el modal
      setSelectedFiles([]);
      setImagesToDelete([]);
      setImageOrder([]);
    }
  }, [isOpen]);

  // Cargar los datos del auto cuando se está editando
  useEffect(() => {
    const fetchCarDetails = async () => {
      if (initialData?.id && isOpen) {
        setLoading(true);
        try {
          const token = Cookies.get('admin-auth');
          const response = await fetch(
            `${API_BASE_URL}/api/cars/${initialData.id}?tenant=${TENANT}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Error al cargar los detalles del auto');
          }

          const data = await response.json();

          // Ordenar las imágenes por el campo order
          const sortedImages = [...data.images].sort(
            (a, b) => a.order - b.order
          );

          setFormData({
            id: data.id,
            marca: data.brand,
            marcaId: data.brand.toLowerCase(),
            modelo: data.model,
            año: data.year.toString(),
            kilometraje: data.mileage,
            transmision: data.transmission,
            combustible: data.fuel,
            puertas: data.doors,
            precio: parseFloat(data.price),
            currency: data.currency || 'USD',
            descripcion: data.description,
            imagenes: sortedImages,
            categoria: data.Category.name,
            color: data.color || '',
          });

          // Asegurarnos de que no hay imágenes anteriores seleccionadas
          setSelectedFiles([]);
          setImagesToDelete([]);
          setImageOrder([]);
        } catch (error) {
          console.error('Error al cargar los detalles del auto:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCarDetails();
  }, [initialData?.id, isOpen]);

  // Resetear el formulario cuando se abre con nuevos datos
  useEffect(() => {
    if (isOpen && !initialData) {
      setFormData({
        marca: '',
        marcaId: '',
        modelo: '',
        año: '',
        kilometraje: 0,
        transmision: '',
        combustible: '',
        puertas: 0,
        precio: 0,
        currency: 'USD',
        descripcion: '',
        imagenes: [],
        categoria: '',
        color: '',
      });
      // Limpiar completamente el estado de imágenes al crear un auto nuevo
      setSelectedFiles([]);
      setImagesToDelete([]);
      setImageOrder([]);
    }
  }, [isOpen, initialData]);

  const handleImagesUpdate = (data: {
    newImages: File[];
    imagesToDelete: string[];
    imageOrder: Array<{ id: string; order: number }>;
  }) => {
    setSelectedFiles(data.newImages);
    setImagesToDelete(data.imagesToDelete);
    setImageOrder(data.imageOrder);

    // Actualizar el orden de las imágenes en formData
    setFormData((prev) => {
      const updatedImagenes = [...prev.imagenes];
      data.imageOrder.forEach(({ id, order }) => {
        const imageIndex = updatedImagenes.findIndex((img) => img.id === id);
        if (imageIndex !== -1) {
          updatedImagenes[imageIndex] = {
            ...updatedImagenes[imageIndex],
            order,
          };
        }
      });
      // Ordenar las imágenes según el nuevo orden
      updatedImagenes.sort((a, b) => a.order - b.order);
      return {
        ...prev,
        imagenes: updatedImagenes,
      };
    });
  };

  // Función para obtener la orientación EXIF de una imagen
  const getImageOrientation = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (!e.target?.result) {
          resolve(1);
          return;
        }

        const view = new DataView(e.target.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xffd8) {
          resolve(1);
          return;
        }

        const length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;

          if (marker === 0xffe1) {
            if (view.getUint32((offset += 2), false) !== 0x45786966) {
              resolve(1);
              return;
            }
            const little = view.getUint16((offset += 6), false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;

            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + i * 12, little) === 0x0112) {
                resolve(view.getUint16(offset + i * 12 + 8, little));
                return;
              }
            }
          } else if ((marker & 0xff00) !== 0xff00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(1);
      };
      reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    });
  };

  const handleImagesSelected = async (files: File[]) => {
    const filesWithOrientation: FileWithOrientation[] = [];

    for (const file of files) {
      const orientation = await getImageOrientation(file);
      const fileWithOrientation = file as FileWithOrientation;
      fileWithOrientation.orientation = orientation;
      filesWithOrientation.push(fileWithOrientation);
    }

    setSelectedFiles(filesWithOrientation);
    setFormData((prev) => ({ ...prev, imagenes: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      // Validar que todos los campos requeridos estén completos y que el año sea válido
      if (
        !formData.marca ||
        !formData.modelo ||
        !formData.año ||
        isNaN(parseInt(formData.año)) ||
        !formData.categoria ||
        !formData.combustible ||
        !formData.color ||
        !formData.transmision
      ) {
        alert('Por favor, complete todos los campos requeridos');
        setSubmitting(false);
        return;
      }

      // Validar que haya al menos una imagen
      if (selectedFiles.length === 0 && formData.imagenes.length === 0) {
        setErrorMessage('Por favor, subir al menos una imagen del vehículo');
        setShowErrorModal(true);
        setSubmitting(false);
        return;
      }

      // Asegurar que el precio sea un número válido (0 si es NaN)
      let precioValidado = formData.precio;
      if (isNaN(precioValidado)) {
        precioValidado = 0;
      }

      // Asegurar que puertas sea un número válido
      const puertasValidado = formData.puertas === null ? 0 : formData.puertas;

      // Preparar los datos para enviar al componente padre
      const dataToSubmit = {
        marca: formData.marca,
        marcaId: formData.marcaId,
        modelo: formData.modelo,
        año: formData.año,
        kilometraje: formData.kilometraje,
        transmision: formData.transmision,
        combustible: formData.combustible,
        puertas: puertasValidado,
        precio: precioValidado,
        currency: formData.currency,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        color: formData.color,
        imagenes: formData.imagenes,
        images: selectedFiles,
        imagesToDelete,
        imageOrder,
      };

      // Llamar al callback de éxito con los datos del formulario
      await onSubmit(dataToSubmit);

      // Limpiar las URLs de objeto creadas
      formData.imagenes.forEach((imagen) => {
        if (imagen.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imagen.imageUrl);
        }
      });
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      alert(
        'Error al procesar el formulario: ' +
          (error instanceof Error ? error.message : 'Error desconocido')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles =
    'mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-base shadow-sm placeholder-gray-400 focus:outline-none focus:border-color-primary-admin focus:ring-1 focus:ring-color-primary-admin transition-colors';
  const textareaStyles =
    'mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-base shadow-sm placeholder-gray-400 focus:outline-none focus:border-color-primary-admin focus:ring-1 focus:ring-color-primary-admin transition-colors';

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
                  {initialData ? 'Editar Auto' : 'Agregar Nuevo Auto'}
                </Dialog.Title>

                {loading ? (
                  <div className='flex justify-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color-primary-admin'></div>
                  </div>
                ) : (
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
                        <div className='relative' ref={marcaInputRef}>
                          <div className='flex items-center relative'>
                            <input
                              type='text'
                              value={formData.marca}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  marca: e.target.value,
                                  marcaId: e.target.value
                                    .toLowerCase()
                                    .replace(/\s+/g, '-'),
                                }))
                              }
                              onFocus={() => setShowMarcaDropdown(true)}
                              className={inputStyles}
                              placeholder='Ej: Ford, Chevrolet, Toyota'
                              required
                            />
                            <button
                              type='button'
                              className='absolute right-2 p-1'
                              onClick={() =>
                                setShowMarcaDropdown(!showMarcaDropdown)
                              }
                            >
                              <ChevronDown className='h-4 w-4 text-gray-500' />
                            </button>
                          </div>

                          {showMarcaDropdown && (
                            <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base max-h-60 overflow-y-auto'>
                              {marcas.map((marca) => (
                                <div
                                  key={marca}
                                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      marca: marca,
                                      marcaId: marca
                                        .toLowerCase()
                                        .replace(/\s+/g, '-'),
                                    }));
                                    setShowMarcaDropdown(false);
                                  }}
                                >
                                  {marca}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
                              año: e.target.value,
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
                            const numValue = value === '' ? 0 : Number(value);
                            if (!isNaN(numValue)) {
                              setFormData((prev) => ({
                                ...prev,
                                kilometraje: Math.max(0, numValue),
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
                        <div className='relative' ref={categoryInputRef}>
                          <div className='flex items-center relative'>
                            <input
                              type='text'
                              value={capitalizeFirst(formData.categoria)}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  categoria: e.target.value,
                                }))
                              }
                              onFocus={() => setShowCategoryDropdown(true)}
                              className={inputStyles}
                              placeholder='Ej: Auto, SUV, Camioneta'
                              required
                            />
                            <button
                              type='button'
                              className='absolute right-2 p-1'
                              onClick={() =>
                                setShowCategoryDropdown(!showCategoryDropdown)
                              }
                            >
                              <ChevronDown className='h-4 w-4 text-gray-500' />
                            </button>
                          </div>

                          {showCategoryDropdown && (
                            <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base max-h-60 overflow-y-auto'>
                              {categories.map((category) => (
                                <div
                                  key={category.id}
                                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      categoria: category.name,
                                    }));
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  {capitalizeFirst(category.name)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Motor
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
                          placeholder='Ej: 1.6, 2.0, V8'
                          required
                        />
                      </div>

                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Combustible
                        </label>
                        <div className='relative' ref={combustibleInputRef}>
                          <div className='flex items-center relative'>
                            <input
                              type='text'
                              value={formData.combustible}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  combustible: e.target.value,
                                }))
                              }
                              onFocus={() => setShowCombustibleDropdown(true)}
                              className={`${inputStyles} cursor-pointer`}
                              placeholder='Seleccionar tipo de combustible'
                              readOnly
                              required
                            />
                            <button
                              type='button'
                              className='absolute right-2 p-1'
                              onClick={() =>
                                setShowCombustibleDropdown(
                                  !showCombustibleDropdown
                                )
                              }
                            >
                              <ChevronDown className='h-4 w-4 text-gray-500' />
                            </button>
                          </div>

                          {showCombustibleDropdown && (
                            <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base max-h-60 overflow-y-auto'>
                              {combustibleOptions.map((option) => (
                                <div
                                  key={option}
                                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      combustible: option,
                                    }));
                                    setShowCombustibleDropdown(false);
                                  }}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Puertas
                        </label>
                        <div className='relative' ref={puertasInputRef}>
                          <div className='flex items-center relative'>
                            <input
                              type='text'
                              value={
                                formData.puertas === null ? 0 : formData.puertas
                              }
                              onChange={(e) => {
                                const value =
                                  e.target.value === ''
                                    ? 0
                                    : parseInt(e.target.value);
                                // Solo permitir valores válidos (2,3,4,5,6,7) o 0
                                if (
                                  isNaN(value) ||
                                  value === 0 ||
                                  [2, 3, 4, 5, 6, 7].includes(value)
                                ) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    puertas: value,
                                  }));
                                }
                              }}
                              onFocus={() => setShowPuertasDropdown(true)}
                              className={inputStyles}
                              placeholder='Seleccionar cantidad de puertas'
                            />
                            <button
                              type='button'
                              className='absolute right-2 p-1'
                              onClick={() =>
                                setShowPuertasDropdown(!showPuertasDropdown)
                              }
                            >
                              <ChevronDown className='h-4 w-4 text-gray-500' />
                            </button>
                          </div>

                          {showPuertasDropdown && (
                            <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base max-h-60 overflow-y-auto'>
                              {puertasOptions.map((option) => (
                                <div
                                  key={option}
                                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      puertas: parseInt(option),
                                    }));
                                    setShowPuertasDropdown(false);
                                  }}
                                >
                                  {option} puertas
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Transmisión
                        </label>
                        <div className='relative' ref={transmisionInputRef}>
                          <div className='flex items-center relative'>
                            <input
                              type='text'
                              value={formData.transmision}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  transmision: e.target.value,
                                }))
                              }
                              onFocus={() => setShowTransmisionDropdown(true)}
                              className={`${inputStyles} cursor-pointer`}
                              placeholder='Seleccionar tipo de transmisión'
                              readOnly
                              required
                            />
                            <button
                              type='button'
                              className='absolute right-2 p-1'
                              onClick={() =>
                                setShowTransmisionDropdown(
                                  !showTransmisionDropdown
                                )
                              }
                            >
                              <ChevronDown className='h-4 w-4 text-gray-500' />
                            </button>
                          </div>

                          {showTransmisionDropdown && (
                            <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base max-h-60 overflow-y-auto'>
                              {transmisionOptions.map((option) => (
                                <div
                                  key={option}
                                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      transmision: option,
                                    }));
                                    setShowTransmisionDropdown(false);
                                  }}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Precio
                        </label>
                        <div className='flex items-center space-x-1.5'>
                          <button
                            type='button'
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                currency:
                                  prev.currency === 'USD' ? 'ARS' : 'USD',
                              }))
                            }
                            className={`w-20 py-2.5 text-base font-medium rounded-lg border ${
                              formData.currency === 'USD'
                                ? 'bg-green-600/20 text-green-600 border-green-600/60'
                                : 'bg-sky-500/20 text-sky-500 border-sky-500/60'
                            }`}
                          >
                            {formData.currency}
                          </button>
                          <input
                            type='text'
                            value={
                              isNaN(formData.precio)
                                ? ''
                                : formData.precio.toLocaleString('es-AR')
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(/\./g, '');
                              if (value === '') {
                                setFormData((prev) => ({
                                  ...prev,
                                  precio: 0,
                                }));
                              } else {
                                const numValue = Number(value);
                                if (!isNaN(numValue)) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    precio: Math.max(0, numValue),
                                  }));
                                }
                              }
                            }}
                            className={inputStyles}
                            placeholder='0'
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className='block text-base font-medium text-gray-700 mb-2'>
                        Descripción
                      </label>
                      <div className='relative'>
                        <textarea
                          value={formData.descripcion}
                          onChange={(e) => {
                            // Limitar a 5000 caracteres para prevenir problemas
                            const texto = e.target.value.slice(0, 5000);
                            setFormData((prev) => ({
                              ...prev,
                              descripcion: texto,
                            }));
                          }}
                          className={textareaStyles}
                          rows={4}
                          placeholder='Detalles adicionales del vehículo'
                        />
                        <div className='text-xs text-gray-500 text-right mt-1'>
                          {formData.descripcion.length}/5000 caracteres
                        </div>
                      </div>
                    </div>

                    <div>
                      <ImageUpload
                        onImagesSelected={handleImagesSelected}
                        onImagesUpdate={handleImagesUpdate}
                        defaultImages={formData.imagenes}
                        maxFiles={20}
                        accept='image/*'
                      />
                    </div>

                    <div className='mt-6 flex justify-end space-x-3'>
                      <button
                        type='button'
                        onClick={onClose}
                        className='px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-primary-admin'
                        disabled={submitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type='submit'
                        className='px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-color-primary-admin hover:bg-color-primary-admin/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-primary-admin flex items-center'
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
                            {initialData ? 'Actualizando...' : 'Creando...'}
                          </>
                        ) : initialData ? (
                          'Guardar Cambios'
                        ) : (
                          'Crear Auto'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      {/* Modal de Error */}
      <Transition appear show={showErrorModal} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setShowErrorModal(false)}
        >
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
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Error
                  </Dialog.Title>
                  <div className='mt-2'>
                    <p className='text-base text-gray-500'>{errorMessage}</p>
                  </div>

                  <div className='mt-4'>
                    <button
                      type='button'
                      className='inline-flex justify-center rounded-md border border-transparent bg-color-primary-admin px-4 py-2 text-base font-medium text-white hover:bg-color-primary-admin/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-color-primary-admin focus-visible:ring-offset-2'
                      onClick={() => setShowErrorModal(false)}
                    >
                      Entendido
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Transition>
  );
};

export default AutoModal;
