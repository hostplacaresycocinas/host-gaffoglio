'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ImageUpload } from '../../components/ImageUpload';
import { FileText, X } from 'lucide-react';
import { optimizePdfAggressive } from '@/utils/pdfOptimizer';

interface Version {
  id?: string;
  model0kmId: string;
  name: string;
  year: number;
  description?: string;
  technicalSheetUrl?: string;
  listPrice?: number;
  promotionalPrice?: number;
  currency?: string;
  minDownPayment?: number;
  installmentsCount?: number;
  installmentAmount?: number;
  images?: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
  active?: boolean;
}

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    version: {
      model0kmId: string;
      name: string;
      year: number;
      listPrice?: number;
      description?: string;
      currency?: string;
    },
    images?: File[],
    pdf?: File,
    imagesToDelete?: string[]
  ) => Promise<void>;
  initialData?: Version | null;
  modelId: string;
  modelName?: string;
}

const VersionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  modelId,
  modelName,
}: VersionModalProps) => {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    name: '',
    year: currentYear.toString(),
    description: '',
    price: '',
    currency: 'ARS',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{
      id: string;
      imageUrl: string;
      thumbnailUrl: string;
      order: number;
    }>
  >([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isOptimizingPdf, setIsOptimizingPdf] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        year: initialData.year?.toString() || currentYear.toString(),
        description: initialData.description || '',
        price: initialData.listPrice?.toString() || '',
        currency: initialData.currency || 'ARS',
      });
      setExistingImages(initialData.images || []);
      setPdfPreview(initialData.technicalSheetUrl || null);
    } else {
      setFormData({
        name: '',
        year: currentYear.toString(),
        description: '',
        price: '',
        currency: 'ARS',
      });
      setExistingImages([]);
      setPdfPreview(null);
    }
    setSelectedFiles([]);
    setImagesToDelete([]);
    setPdfFile(null);
  }, [initialData, isOpen, currentYear]);

  const handleImagesSelected = async (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleImagesUpdate = (data: {
    newImages: File[];
    imagesToDelete: string[];
    imageOrder: Array<{ id: string; order: number }>;
  }) => {
    setSelectedFiles(data.newImages);
    setImagesToDelete(data.imagesToDelete);
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF');
        return;
      }

      // Permitir archivos más grandes inicialmente, los optimizaremos
      if (file.size > 50 * 1024 * 1024) {
        alert('El PDF no debe superar los 50MB antes de optimizar');
        return;
      }

      setIsOptimizingPdf(true);
      try {
        // Optimizar el PDF
        const optimizedFile = await optimizePdfAggressive(file);

        // Verificar que el archivo optimizado no supere 12MB
        if (optimizedFile.size > 12 * 1024 * 1024) {
          alert(
            `El PDF optimizado aún supera los 12MB (${(
              optimizedFile.size /
              1024 /
              1024
            ).toFixed(
              2
            )}MB). Por favor, use un PDF más pequeño o con menos imágenes.`
          );
          setIsOptimizingPdf(false);
          return;
        }

        setPdfFile(optimizedFile);
        setPdfPreview(URL.createObjectURL(optimizedFile));
      } catch (error) {
        console.error('Error al optimizar PDF:', error);
        alert('Error al optimizar el PDF. Se usará el archivo original.');
        // Si falla la optimización, usar el archivo original si es menor a 12MB
        if (file.size <= 12 * 1024 * 1024) {
          setPdfFile(file);
          setPdfPreview(URL.createObjectURL(file));
        } else {
          alert('El PDF original supera los 12MB y no se pudo optimizar.');
        }
      } finally {
        setIsOptimizingPdf(false);
      }
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    if (pdfPreview && pdfPreview.startsWith('blob:')) {
      URL.revokeObjectURL(pdfPreview);
    }
    setPdfPreview(null);
  };

  const formatNumber = (value: string) => {
    if (!value || value === '') return '';
    const numValue = value.replace(/\./g, '');
    if (numValue === '') return '';
    return parseFloat(numValue).toLocaleString('es-AR');
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof formData
  ) => {
    const value = e.target.value.replace(/\./g, '');
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      // Validar campos requeridos
      if (!formData.name.trim() || !formData.year) {
        alert('Por favor, complete los campos requeridos (nombre, año)');
        setSubmitting(false);
        return;
      }

      // El precio es opcional: si está vacío, enviar null; si tiene valor, parsear
      const priceNum = formData.price.trim()
        ? (() => {
            const parsed = parseFloat(formData.price.replace(/\./g, ''));
            return isNaN(parsed) ? null : parsed;
          })()
        : null;

      if (priceNum !== null && priceNum < 0) {
        alert('El precio debe ser un número válido');
        setSubmitting(false);
        return;
      }

      await onSubmit(
        {
          model0kmId: modelId,
          name: formData.name.trim(),
          year: currentYear,
          listPrice: priceNum !== null ? priceNum : undefined,
          // Enviar string vacío en lugar de undefined para permitir borrar el campo
          description: initialData
            ? formData.description.trim()
            : formData.description.trim() || undefined,
          currency: formData.currency,
        },
        selectedFiles.length > 0 ? selectedFiles : undefined,
        pdfFile || undefined,
        imagesToDelete.length > 0 ? imagesToDelete : undefined
      );

      // Reset form
      setFormData({
        name: '',
        year: currentYear.toString(),
        description: '',
        price: '',
        currency: 'ARS',
      });
      setSelectedFiles([]);
      setImagesToDelete([]);
      setExistingImages([]);
      setPdfFile(null);
      setPdfPreview(null);
      onClose();
    } catch (error) {
      console.error('Error al guardar la versión:', error);
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
              <Dialog.Panel className='w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto'>
                <Dialog.Title
                  as='h3'
                  className='text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center justify-between'
                >
                  <span>
                    {initialData ? 'Editar Versión' : 'Agregar Versión'}
                  </span>
                  <button
                    onClick={onClose}
                    className='p-1 hover:bg-gray-100 rounded-full transition-colors'
                  >
                    <X size={20} className='text-gray-500' />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className='space-y-4'>
                  {/* Nombre del Modelo (solo lectura) */}
                  {modelName && (
                    <div>
                      <label className='block text-base font-medium text-gray-700 mb-1'>
                        Modelo
                      </label>
                      <div className='px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-700'>
                        {modelName}
                      </div>
                      <p className='text-sm text-gray-500 mt-1'>
                        Versión del modelo: {modelName}
                      </p>
                    </div>
                  )}

                  {/* Nombre */}
                  <div>
                    <label className='block text-base font-medium text-gray-700'>
                      Nombre de la Versión{' '}
                      <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className={inputStyles}
                      placeholder='Ej: Corolla XLE 2024'
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }));
                      }}
                      className={textareaStyles}
                      rows={4}
                      placeholder='Descripción completa de la versión con equipamiento y características (soporta saltos de línea)...'
                    />
                    <div className='text-xs text-gray-500 text-right mt-1'>
                      {formData.description.length} caracteres
                    </div>
                  </div>

                  {/* Precio */}
                  <div>
                    <label className='block text-base font-medium text-gray-700'>
                      Cuota desde
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
                        value={formatNumber(formData.price)}
                        onChange={(e) => handleNumberChange(e, 'price')}
                        className={inputStyles}
                        placeholder='0'
                      />
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div>
                    <ImageUpload
                      onImagesSelected={handleImagesSelected}
                      onImagesUpdate={handleImagesUpdate}
                      defaultImages={existingImages}
                      maxFiles={20}
                      accept='image/*'
                    />
                  </div>

                  {/* PDF Ficha Técnica */}
                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      Ficha Técnica (PDF)
                    </label>
                    {pdfPreview ? (
                      <div className='relative border-2 border-gray-200 rounded-lg p-4 bg-gray-50'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <FileText className='w-8 h-8 text-red-600' />
                            <div>
                              <p className='text-sm font-medium text-gray-900'>
                                {pdfFile?.name || 'Ficha técnica cargada'}
                              </p>
                              <p className='text-xs text-gray-500'>PDF</p>
                            </div>
                          </div>
                          <button
                            type='button'
                            onClick={handleRemovePdf}
                            className='p-1 hover:bg-gray-200 rounded-full transition-colors'
                          >
                            <X size={18} className='text-red-500' />
                          </button>
                        </div>
                        {pdfPreview && (
                          <a
                            href={pdfPreview}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='mt-2 inline-block text-sm text-blue-600 hover:text-blue-700'
                          >
                            Ver PDF
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative'>
                        {isOptimizingPdf && (
                          <div className='absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10'>
                            <svg
                              className='animate-spin h-8 w-8 text-blue-600 mb-3'
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
                            <p className='text-base font-medium text-blue-600'>
                              Optimizando PDF...
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              Por favor, espere
                            </p>
                          </div>
                        )}
                        <label
                          htmlFor='pdf'
                          className={`cursor-pointer block ${
                            isOptimizingPdf
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }`}
                        >
                          <div className='text-gray-400 mb-2'>
                            <FileText className='mx-auto h-12 w-12' />
                          </div>
                          <span className='text-sm text-gray-600'>
                            Haz clic para subir una ficha técnica
                          </span>
                          <span className='text-xs text-gray-500 block mt-1'>
                            PDF (máx. 50MB, se optimizará automáticamente)
                          </span>
                        </label>
                        <input
                          type='file'
                          id='pdf'
                          accept='application/pdf'
                          onChange={handlePdfChange}
                          className='hidden'
                          disabled={isOptimizingPdf}
                        />
                      </div>
                    )}
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

export default VersionModal;
