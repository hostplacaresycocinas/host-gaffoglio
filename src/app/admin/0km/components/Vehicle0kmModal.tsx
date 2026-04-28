'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ImageUpload } from '../../components/ImageUpload';
import Cookies from 'js-cookie';
import { ChevronDown, FileText, X } from 'lucide-react';
import { API_BASE_URL, TENANT } from '@/app/constants/constants';

interface FileWithOrientation extends File {
  orientation?: number;
}

interface Vehicle0kmFormData {
  id?: string;
  brandId: string;
  model: string;
  year: string;
  price: number;
  currency: 'USD' | 'ARS';
  description: string;
  kilometraje: number;
  categoria: string;
  motor: string; // Motor (color en AutoModal pero se usa como motor)
  combustible: string;
  puertas: number;
  transmision: string;
  imagenes: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
  active: boolean;
  fichaTecnicaUrl?: string; // URL del PDF de ficha técnica
}

interface Vehicle0kmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Vehicle0kmFormData, 'id'> & {
      images?: File[];
      imagesToDelete?: string[];
      imageOrder?: Array<{ id: string; order: number }>;
      fichaTecnica?: File;
    }
  ) => Promise<void>;
  initialData?: Vehicle0kmFormData | null;
  brandId: string;
}

interface Category {
  id: string;
  name: string;
}

const Vehicle0kmModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  brandId,
}: Vehicle0kmModalProps) => {
  const [formData, setFormData] = useState<Vehicle0kmFormData>({
    brandId: brandId,
    model: '',
    year: new Date().getFullYear().toString(),
    price: 0,
    currency: 'USD',
    description: '',
    kilometraje: 0,
    categoria: '',
    motor: '',
    combustible: '',
    puertas: 0,
    transmision: '',
    imagenes: [],
    active: true,
    fichaTecnicaUrl: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<FileWithOrientation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imageOrder, setImageOrder] = useState<
    Array<{ id: string; order: number }>
  >([]);
  const [existingImages, setExistingImages] = useState<
    Array<{
      id: string;
      imageUrl: string;
      thumbnailUrl: string;
      order: number;
    }>
  >([]);
  const [fichaTecnicaFile, setFichaTecnicaFile] = useState<File | null>(null);
  const [fichaTecnicaPreview, setFichaTecnicaPreview] = useState<string | null>(
    null
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCombustibleDropdown, setShowCombustibleDropdown] = useState(false);
  const [showPuertasDropdown, setShowPuertasDropdown] = useState(false);
  const [showTransmisionDropdown, setShowTransmisionDropdown] = useState(false);

  const categoryInputRef = useRef<HTMLInputElement>(null);
  const combustibleInputRef = useRef<HTMLInputElement>(null);
  const puertasInputRef = useRef<HTMLInputElement>(null);
  const transmisionInputRef = useRef<HTMLInputElement>(null);

  const combustibleOptions = [
    'Nafta',
    'Diésel',
    'GNC',
    'Eléctrico',
    'Híbrido',
  ];
  const puertasOptions = ['2', '3', '4', '5', '6', '7'];
  const transmisionOptions = ['Manual', 'Automática', 'CVT'];

  // Generar años desde el actual hasta 10 años atrás
  const currentYear = new Date().getFullYear();

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = Cookies.get('admin-auth');
        const response = await fetch(
          `${API_BASE_URL}/api/admin/categories?tenant=${TENANT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        year: initialData.year?.toString() || currentYear.toString(),
        imagenes: initialData.imagenes || [],
        active: initialData.active ?? true,
        fichaTecnicaUrl: initialData.fichaTecnicaUrl || '',
      });
      setExistingImages(initialData.imagenes || []);
      setFichaTecnicaPreview(initialData.fichaTecnicaUrl || null);
    } else {
      setFormData({
        brandId: brandId,
        model: '',
        year: currentYear.toString(),
        price: 0,
        currency: 'USD',
        description: '',
        kilometraje: 0,
        categoria: '',
        motor: '',
        combustible: '',
        puertas: 0,
        transmision: '',
        imagenes: [],
        active: true,
        fichaTecnicaUrl: '',
      });
      setExistingImages([]);
      setFichaTecnicaPreview(null);
    }
    setSelectedFiles([]);
    setImagesToDelete([]);
    setImageOrder([]);
    setFichaTecnicaFile(null);
  }, [initialData, brandId, isOpen, currentYear]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
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

  const handleImagesSelected = async (files: File[]) => {
    setSelectedFiles(files as FileWithOrientation[]);
  };

  const handleImagesUpdate = (data: {
    newImages: File[];
    imagesToDelete: string[];
    imageOrder: Array<{ id: string; order: number }>;
  }) => {
    setSelectedFiles(data.newImages as FileWithOrientation[]);
    setImagesToDelete(data.imagesToDelete);
    setImageOrder(data.imageOrder);
  };

  const handleFichaTecnicaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF');
        return;
      }
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El PDF no debe superar los 10MB');
        return;
      }
      setFichaTecnicaFile(file);
      setFichaTecnicaPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFichaTecnica = () => {
    setFichaTecnicaFile(null);
    if (fichaTecnicaPreview && fichaTecnicaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(fichaTecnicaPreview);
    }
    setFichaTecnicaPreview(null);
    setFormData((prev) => ({ ...prev, fichaTecnicaUrl: '' }));
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      // Validar campos requeridos
      if (
        !formData.model ||
        !formData.year ||
        !formData.categoria ||
        !formData.combustible ||
        !formData.motor ||
        !formData.transmision
      ) {
        alert('Por favor, complete todos los campos requeridos');
        setSubmitting(false);
        return;
      }

      // Validar que haya al menos una imagen
      if (selectedFiles.length === 0 && existingImages.length === 0) {
        alert('Por favor, subir al menos una imagen del vehículo');
        setSubmitting(false);
        return;
      }

      const submitData = {
        ...formData,
        year: formData.year,
        images: selectedFiles.length > 0 ? selectedFiles : undefined,
        imagesToDelete:
          imagesToDelete.length > 0 ? imagesToDelete : undefined,
        imageOrder: imageOrder.length > 0 ? imageOrder : undefined,
        fichaTecnica: fichaTecnicaFile || undefined,
      };

      await onSubmit(submitData);
      // Reset form
      setFormData({
        brandId: brandId,
        model: '',
        year: currentYear.toString(),
        price: 0,
        currency: 'USD',
        description: '',
        kilometraje: 0,
        categoria: '',
        motor: '',
        combustible: '',
        puertas: 0,
        transmision: '',
        imagenes: [],
        active: true,
        fichaTecnicaUrl: '',
      });
      setSelectedFiles([]);
      setImagesToDelete([]);
      setImageOrder([]);
      setFichaTecnicaFile(null);
      setFichaTecnicaPreview(null);
      onClose();
    } catch (error) {
      console.error('Error al guardar el vehículo:', error);
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
                  {initialData ? 'Editar Vehículo 0km' : 'Agregar Vehículo 0km'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {/* Modelo */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Modelo <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          value={formData.model}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              model: e.target.value,
                            }))
                          }
                          className={inputStyles}
                          placeholder='Ej: Mobi Trekking, 208, Kwid...'
                          required
                        />
                      </div>

                      {/* Año */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Año <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='number'
                          value={formData.year}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              year: e.target.value,
                            }))
                          }
                          className={inputStyles}
                          placeholder='Ingrese el año del vehículo'
                          min='1900'
                          max={currentYear}
                          required
                        />
                      </div>

                      {/* Categoría */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Categoría <span className='text-red-500'>*</span>
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

                      {/* Motor */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Motor <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          value={formData.motor}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              motor: e.target.value,
                            }))
                          }
                          className={inputStyles}
                          placeholder='Ej: 1.6, 2.0, V8'
                          required
                        />
                      </div>

                      {/* Combustible */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Combustible <span className='text-red-500'>*</span>
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

                      {/* Puertas */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Puertas <span className='text-red-500'>*</span>
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

                      {/* Transmisión */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Transmisión <span className='text-red-500'>*</span>
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

                      {/* Precio */}
                      <div>
                        <label className='block text-base font-medium text-gray-700'>
                          Precio <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex items-center space-x-1.5'>
                          <button
                            type='button'
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                currency: prev.currency === 'USD' ? 'ARS' : 'USD',
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
                              isNaN(formData.price)
                                ? ''
                                : formData.price.toLocaleString('es-AR')
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(/\./g, '');
                              if (value === '') {
                                setFormData((prev) => ({
                                  ...prev,
                                  price: 0,
                                }));
                              } else {
                                const numValue = Number(value);
                                if (!isNaN(numValue)) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    price: Math.max(0, numValue),
                                  }));
                                }
                              }
                            }}
                            className={inputStyles}
                            placeholder='0'
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className='block text-base font-medium text-gray-700 mb-2'>
                        Descripción
                      </label>
                      <div className='relative'>
                        <textarea
                          value={formData.description}
                          onChange={(e) => {
                            // Limitar a 5000 caracteres
                            const texto = e.target.value.slice(0, 5000);
                            setFormData((prev) => ({
                              ...prev,
                              description: texto,
                            }));
                          }}
                          className={textareaStyles}
                          rows={4}
                          placeholder='Detalles adicionales del vehículo'
                        />
                        <div className='text-xs text-gray-500 text-right mt-1'>
                          {formData.description.length}/5000 caracteres
                        </div>
                      </div>
                    </div>

                    {/* Imágenes */}
                    <div>
                      <label className='block text-base font-medium text-gray-700 mb-2'>
                        Imágenes <span className='text-red-500'>*</span>
                      </label>
                      <ImageUpload
                        onImagesSelected={handleImagesSelected}
                        onImagesUpdate={handleImagesUpdate}
                        defaultImages={existingImages}
                        maxFiles={20}
                        accept='image/*'
                      />
                    </div>

                    {/* Ficha Técnica (PDF) */}
                    <div>
                      <label className='block text-base font-medium text-gray-700 mb-2'>
                        Ficha Técnica (PDF)
                      </label>
                      {fichaTecnicaPreview ? (
                        <div className='relative border-2 border-gray-200 rounded-lg p-4 bg-gray-50'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <FileText className='w-8 h-8 text-red-600' />
                              <div>
                                <p className='text-sm font-medium text-gray-900'>
                                  {fichaTecnicaFile?.name ||
                                    'Ficha técnica cargada'}
                                </p>
                                <p className='text-xs text-gray-500'>
                                  PDF
                                </p>
                              </div>
                            </div>
                            <button
                              type='button'
                              onClick={handleRemoveFichaTecnica}
                              className='p-1 hover:bg-gray-200 rounded-full transition-colors'
                            >
                              <X size={18} className='text-red-500' />
                            </button>
                          </div>
                          {fichaTecnicaPreview && (
                            <a
                              href={fichaTecnicaPreview}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='mt-2 inline-block text-sm text-blue-600 hover:text-blue-700'
                            >
                              Ver PDF
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                          <label
                            htmlFor='fichaTecnica'
                            className='cursor-pointer block'
                          >
                            <div className='text-gray-400 mb-2'>
                              <FileText className='mx-auto h-12 w-12' />
                            </div>
                            <span className='text-sm text-gray-600'>
                              Haz clic para subir una ficha técnica
                            </span>
                            <span className='text-xs text-gray-500 block mt-1'>
                              PDF (máx. 10MB)
                            </span>
                          </label>
                          <input
                            type='file'
                            id='fichaTecnica'
                            accept='application/pdf'
                            onChange={handleFichaTecnicaChange}
                            className='hidden'
                          />
                        </div>
                      )}
                    </div>

                    {/* Estado activo */}
                    <div>
                      <label className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={formData.active}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              active: e.target.checked,
                            }))
                          }
                          className='w-4 h-4 text-color-primary-admin border-gray-300 rounded focus:ring-color-primary-admin'
                        />
                        <span className='text-sm text-gray-700'>
                          Vehículo activo (visible en el catálogo)
                        </span>
                      </label>
                    </div>

                    {/* Botones */}
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
                        className='px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-color-primary-admin hover:bg-color-primary-admin/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-primary-admin flex items-center'
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
                            Guardando...
                          </>
                        ) : initialData ? (
                          'Actualizar'
                        ) : (
                          'Crear'
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

export default Vehicle0kmModal;
