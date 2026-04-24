'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash,
  ArrowLeft,
  Search,
  X,
  Layers,
  FileText,
  GripVertical,
  Save,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/constants/constants';
import { Notification } from '../components/Notification';
import { ConfirmModal } from '../components/ConfirmModal';
import BrandModal from './components/BrandModal';
import ModelModal from './components/ModelModal';
import VersionModal from './components/VersionModal';
import { get0kmHeaders, handleUnauthorized } from './utils/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Interfaces según la nueva API
interface Brand {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  active: boolean;
  position: number;
  models?: Array<{ id: string; name: string; active: boolean }>;
  createdAt?: string;
  updatedAt?: string;
}

interface Model {
  id: string;
  brand0kmId: string;
  name: string;
  description?: string;
  versionName?: string;
  listPrice?: number;
  promotionalPrice?: number;
  currency?: string;
  minDownPayment?: number;
  installmentsCount?: number;
  installmentAmount?: number;
  technicalSheetUrl?: string;
  active: boolean;
  position: number;
  versions?: Array<{ id: string; name: string; active: boolean }>;
  brand?: {
    id: string;
    name: string;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface Version {
  id: string;
  model0kmId: string;
  name: string;
  year: number;
  description?: string;
  technicalSheetUrl?: string;
  listPrice?: number;
  promotionalPrice?: number;
  currency: string;
  minDownPayment?: number;
  installmentsCount?: number;
  installmentAmount?: number;
  active: boolean;
  position: number;
  featured: boolean;
  lastFeaturedAt?: string;
  model?: {
    id: string;
    name: string;
    brand?: {
      id: string;
      name: string;
    };
  };
  images: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Componente sortable para las tarjetas de marcas
interface SortableBrandCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  onSelect: (brand: Brand) => void;
  isDragDisabled?: boolean;
}

const SortableBrandCard = ({
  brand,
  onEdit,
  onDelete,
  onSelect,
  isDragDisabled = false,
}: SortableBrandCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: brand.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-gray-900 rounded-xl overflow-hidden border border-neutral-700/50 cursor-pointer hover:border-white/30 group ${
        isDragging ? 'shadow-lg border-2 border-red-400 opacity-90' : ''
      }`}
      onClick={() => onSelect(brand)}
    >
      {/* Sección superior con imagen */}
      <div className='relative h-64 overflow-hidden'>
        {brand.imageUrl ? (
          <>
            <Image
              src={brand.imageUrl}
              alt={brand.name}
              fill
              className='object-contain p-8'
            />
            <div className='absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80'></div>
          </>
        ) : (
          <div className='absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900'></div>
        )}

        {/* Logo/Nombre sobrepuesto */}
        <div className='absolute inset-0 flex items-center justify-center z-10 p-8'>
          <h3 className='text-3xl font-bold text-white drop-shadow-2xl'>
            {brand.name}
          </h3>
        </div>

        {/* Handle de arrastre */}
        <div
          className='absolute top-4 left-4 p-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full shadow-sm cursor-grab z-20 hover:bg-white/30 transition-colors'
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} className='text-white' />
        </div>

        {/* Botones de acción (solo visibles en hover) */}
        <div className='absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(brand);
            }}
            className='p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors'
            title='Editar marca'
          >
            <Edit size={18} className='text-white' />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(brand);
            }}
            className='p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors'
            title='Eliminar marca'
          >
            <Trash size={18} className='text-white' />
          </button>
        </div>
      </div>

      {/* Sección inferior con contador y botón */}
      <div className='p-6 bg-neutral-900'>
        <p className='text-white/60 mb-3 text-center'>
          {brand.models?.length || 0}{' '}
          {(brand.models?.length || 0) === 1 ? 'modelo' : 'modelos'}
        </p>
        <button className='w-full bg-white text-gray-900 font-semibold py-2.5 px-4 rounded-lg hover:bg-white/90 transition-colors text-sm'>
          Ver modelos &gt;
        </button>
      </div>
    </div>
  );
};

// Vista de marcas
const BrandsView = ({
  brands,
  loading,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  onSelectBrand,
  onBrandsUpdate,
}: {
  brands: Brand[];
  loading: boolean;
  onAddBrand: () => void;
  onEditBrand: (brand: Brand) => void;
  onDeleteBrand: (brand: Brand) => void;
  onSelectBrand: (brand: Brand) => void;
  onBrandsUpdate?: () => void;
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [localBrands, setLocalBrands] = useState<Brand[]>([]);
  const [ordenModificado, setOrdenModificado] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const esperandoActualizacionRef = useRef(false);
  const ordenEsperadoRef = useRef<string[]>([]);

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sincronizar brands con localBrands
  // Solo actualizar si no hay un orden modificado pendiente
  useEffect(() => {
    if (
      !ordenModificado &&
      !guardandoOrden &&
      !esperandoActualizacionRef.current
    ) {
      // Ordenar las marcas por posición (descendente) antes de actualizar
      // Esto asegura que el orden se mantenga incluso después de recargar
      const sortedBrands = [...brands].sort((a, b) => b.position - a.position);
      // Actualizar siempre para reflejar cambios en el contenido (nombre, descripción, etc.)
      setLocalBrands(sortedBrands);
    } else if (esperandoActualizacionRef.current && brands.length > 0) {
      // Cuando estamos esperando una actualización y llegaron nuevos datos,
      // actualizar con los datos del servidor (ya ordenados por posición)
      const sortedBrands = [...brands].sort((a, b) => b.position - a.position);
      const newIds = sortedBrands.map((b) => b.id);

      // Verificar si el orden de IDs coincide con el orden esperado que guardamos
      const ordenCoincide =
        ordenEsperadoRef.current.length === newIds.length &&
        ordenEsperadoRef.current.every((id, index) => id === newIds[index]);

      if (ordenCoincide) {
        // El orden es correcto, actualizar con los datos nuevos
        setLocalBrands(sortedBrands);
        setOrdenModificado(false);
        esperandoActualizacionRef.current = false;
        ordenEsperadoRef.current = [];
      }
      // Si no coincide, mantener el orden local (no actualizar todavía)
      // Esto previene el flash del orden anterior
    }
  }, [brands, ordenModificado, guardandoOrden]);

  // Función para manejar el drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setLocalBrands((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);
        setOrdenModificado(true);

        return newItems;
      });
    }
  };

  // Función para guardar el nuevo orden
  const guardarOrden = async () => {
    setGuardandoOrden(true);
    try {
      const headers = get0kmHeaders(true);

      // Calcular nuevas posiciones (orden descendente: mayor valor = más arriba)
      const updates = localBrands.map((brand, index) => ({
        id: brand.id,
        position: localBrands.length - index,
      }));

      // Hacer requests individuales para cada marca
      // PATCH /api/0km/brands/:id/position
      const updatePromises = updates.map((update) =>
        fetch(`${API_BASE_URL}/api/0km/brands/${update.id}/position`, {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: update.position }),
        })
      );

      // Ejecutar todas las actualizaciones en paralelo
      const responses = await Promise.all(updatePromises);

      // Verificar si alguna request falló
      const failedResponses = responses.filter((response) => {
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized(router);
          return true;
        }
        return !response.ok;
      });

      if (failedResponses.length > 0) {
        throw new Error(
          `Error al actualizar el orden: ${failedResponses.length} marca(s) no se pudieron actualizar`
        );
      }

      // Guardar el orden esperado antes de actualizar
      ordenEsperadoRef.current = localBrands.map((b) => b.id);

      // Actualizar las posiciones en localBrands inmediatamente (optimistic update)
      setLocalBrands((prevBrands) =>
        prevBrands.map((brand) => {
          const update = updates.find((u) => u.id === brand.id);
          return update ? { ...brand, position: update.position } : brand;
        })
      );

      // Marcar que estamos esperando la actualización del servidor
      esperandoActualizacionRef.current = true;

      // Recargar desde el servidor
      // El servidor debería devolver las marcas con las posiciones actualizadas
      // El useEffect detectará cuando lleguen los datos y los sincronizará
      if (onBrandsUpdate) {
        onBrandsUpdate();
      }
    } catch (error) {
      console.error('Error al guardar el orden:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al actualizar el orden de las marcas'
      );
    } finally {
      setGuardandoOrden(false);
    }
  };

  const filteredBrands = localBrands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && brands.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary-admin'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div className='flex flex-col'>
          <h1 className='text-2xl font-semibold text-color-text'>
            Gestión de Vehículos 0km
          </h1>
          <p className='text-gray-500'>
            Total: <span className='font-medium'>{brands.length}</span> marcas
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {ordenModificado && (
            <button
              onClick={guardarOrden}
              disabled={guardandoOrden}
              className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-70'
            >
              {guardandoOrden ? (
                <div className='h-4 w-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin'></div>
              ) : (
                <Save size={16} />
              )}
              Guardar orden
            </button>
          )}
          <button
            onClick={onAddBrand}
            className='flex items-center gap-2 bg-color-primary-admin hover:bg-color-primary-admin/90 text-white px-4 py-2 rounded-md transition-colors'
          >
            <Plus size={18} />
            Agregar Marca
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className='mb-6 relative'>
        <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white'>
          <div className='pl-4 py-2.5 text-gray-400'>
            <Search size={18} />
          </div>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Buscar marca'
            className='flex-grow px-3 py-2.5 focus:outline-none text-color-text'
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-full flex items-center transition-colors'
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Grid de marcas */}
      {filteredBrands.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>
            {searchTerm
              ? `No se encontraron marcas que coincidan con "${searchTerm}".`
              : 'No hay marcas disponibles. Agrega una nueva para comenzar.'}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredBrands.map((brand) => brand.id)}
            strategy={rectSortingStrategy}
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredBrands.map((brand) => (
                <SortableBrandCard
                  key={brand.id}
                  brand={brand}
                  onEdit={onEditBrand}
                  onDelete={onDeleteBrand}
                  onSelect={onSelectBrand}
                  isDragDisabled={!!searchTerm || guardandoOrden}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

// Componente sortable para las tarjetas de versiones
interface SortableVersionCardProps {
  version: Version;
  modelName: string;
  onEdit: (version: Version) => void;
  onDelete: (version: Version) => void;
  isDragDisabled?: boolean;
}

const SortableVersionCard = ({
  version,
  modelName,
  onEdit,
  onDelete,
  isDragDisabled = false,
}: SortableVersionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: version.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-lg overflow-hidden [box-shadow:0_0_10px_rgba(0,0,0,0.08)] transition-shadow ${
        isDragging ? 'shadow-lg border-2 border-red-400 opacity-90' : ''
      } cursor-pointer hover:[box-shadow:0_0_10px_rgba(0,0,0,0.2)]`}
      onClick={() => onEdit(version)}
    >
      <div className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative w-full sm:w-[155px] aspect-[4/3] md:w-[200px] flex-shrink-0'>
            {version.images && version.images.length > 0 ? (
              <Image
                priority
                src={
                  version.images[0].thumbnailUrl || version.images[0].imageUrl
                }
                alt={`${modelName} ${version.name}`}
                width={400}
                height={320}
                className='object-cover rounded-lg'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
                <span className='text-gray-400'>Sin imagen</span>
              </div>
            )}
            {version.featured && (
              <div className='absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                Destacado
              </div>
            )}
            {!version.active && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                <span className='text-white font-semibold'>Inactivo</span>
              </div>
            )}
            {/* Handle de arrastre */}
            <div
              className='absolute top-2 left-2 p-1.5 bg-white/80 border border-gray-300 rounded-full shadow-sm cursor-grab z-10 hover:bg-white hover:border-gray-400 transition-colors'
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} className='text-gray-600' />
            </div>
          </div>

          <div className='flex-grow'>
            <div className='flex justify-between items-start'>
              <div>
                <h3 className='text-lg lg:text-xl font-semibold text-gray-900'>
                  {modelName} {version.name}
                </h3>
                {version.description && (
                  <p className='text-sm text-gray-500 mt-1 line-clamp-3 max-w-2xl'>
                    {version.description}
                  </p>
                )}
                {version.technicalSheetUrl && (
                  <a
                    href={version.technicalSheetUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => e.stopPropagation()}
                    className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-2 transition-colors'
                  >
                    <FileText size={16} />
                    Ver ficha técnica
                  </a>
                )}
                {version.listPrice && version.listPrice > 0 ? (
                  <p className='text-xl lg:text-2xl font-bold text-color-primary-admin mt-2'>
                    {version.currency === 'ARS' ? '$' : 'US$'}
                    {version.promotionalPrice
                      ? version.promotionalPrice.toLocaleString(
                          version.currency === 'ARS' ? 'es-AR' : 'en-US'
                        )
                      : version.listPrice.toLocaleString(
                          version.currency === 'ARS' ? 'es-AR' : 'en-US'
                        )}
                    {version.promotionalPrice && (
                      <span className='text-sm text-gray-500 line-through ml-2'>
                        {version.listPrice.toLocaleString(
                          version.currency === 'ARS' ? 'es-AR' : 'en-US'
                        )}
                      </span>
                    )}
                  </p>
                ) : null}
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(version);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <Edit size={20} className='text-color-primary-admin' />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(version);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <Trash size={20} className='text-red-500' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente sortable para las tarjetas de modelos
interface SortableModelCardProps {
  model: Model;
  onEdit: (model: Model) => void;
  onDelete: (model: Model) => void;
  onAddVersion: (model: Model) => void;
  onSelectModel: (model: Model) => void;
  isDragDisabled?: boolean;
}

const SortableModelCard = ({
  model,
  onEdit,
  onDelete,
  onAddVersion,
  onSelectModel,
  isDragDisabled = false,
}: SortableModelCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: model.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-lg overflow-hidden [box-shadow:0_0_10px_rgba(0,0,0,0.08)] transition-shadow ${
        isDragging ? 'shadow-lg border-2 border-red-400 opacity-90' : ''
      } cursor-pointer hover:[box-shadow:0_0_10px_rgba(0,0,0,0.2)]`}
      onClick={() => onSelectModel(model)}
    >
      <div className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative w-full sm:w-[155px] aspect-[4/3] md:w-[200px] flex-shrink-0'>
            {model.images && model.images.length > 0 ? (
              <Image
                priority
                src={model.images[0].thumbnailUrl || model.images[0].imageUrl}
                alt={model.name}
                width={400}
                height={320}
                className='object-cover rounded-lg'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
                <span className='text-gray-400'>Sin imagen</span>
              </div>
            )}
            {!model.active && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                <span className='text-white font-semibold'>Inactivo</span>
              </div>
            )}
            {/* Handle de arrastre */}
            <div
              className='absolute top-2 left-2 p-1.5 bg-white/80 border border-gray-300 rounded-full shadow-sm cursor-grab z-10 hover:bg-white hover:border-gray-400 transition-colors'
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} className='text-gray-600' />
            </div>
          </div>

          <div className='flex-grow'>
            <div className='flex justify-between items-start'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <h3 className='text-lg lg:text-xl font-semibold text-gray-900'>
                    {model.name}
                  </h3>
                  {model.versions && model.versions.length > 0 && (
                    <span className='text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium flex items-center gap-1.5'>
                      <Layers size={12} />+{model.versions.length}{' '}
                      {model.versions.length === 1 ? 'versión' : 'versiones'}
                    </span>
                  )}
                </div>
                {model.description && (
                  <p className='text-sm text-gray-500 mt-1 line-clamp-3 max-w-2xl'>
                    {model.description}
                  </p>
                )}
                {model.technicalSheetUrl && (
                  <a
                    href={model.technicalSheetUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => e.stopPropagation()}
                    className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2 transition-colors'
                  >
                    <FileText size={16} />
                    Ver ficha técnica
                  </a>
                )}
                {model.listPrice && model.listPrice > 0 ? (
                  <p className='text-xl lg:text-2xl font-bold text-color-primary-admin mt-2'>
                    {model.currency === 'ARS' ? '$' : 'US$'}
                    {model.promotionalPrice
                      ? model.promotionalPrice.toLocaleString(
                          model.currency === 'ARS' ? 'es-AR' : 'en-US'
                        )
                      : model.listPrice.toLocaleString(
                          model.currency === 'ARS' ? 'es-AR' : 'en-US'
                        )}
                    {model.promotionalPrice && (
                      <span className='text-sm text-gray-500 line-through ml-2'>
                        {model.listPrice.toLocaleString(
                          model.currency === 'ARS' ? 'es-AR' : 'en-US'
                        )}
                      </span>
                    )}
                  </p>
                ) : null}
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddVersion(model);
                  }}
                  className='px-3 py-1.5 text-sm bg-color-primary-admin hover:bg-color-primary-admin/90 text-white rounded-md transition-colors flex items-center gap-1'
                  title='Agregar versión'
                >
                  <Plus size={16} />
                  Agregar versión
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(model);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                  title='Editar modelo'
                >
                  <Edit size={20} className='text-color-primary-admin' />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(model);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                  title='Eliminar modelo'
                >
                  <Trash size={20} className='text-red-500' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vista de modelos de una marca
const ModelsView = ({
  brand,
  models,
  loading,
  onBack,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onAddVersion,
  onSelectModel,
  onModelsUpdate,
}: {
  brand: Brand;
  models: Model[];
  loading: boolean;
  onBack: () => void;
  onAddModel: () => void;
  onEditModel: (model: Model) => void;
  onDeleteModel: (model: Model) => void;
  onAddVersion: (model: Model) => void;
  onSelectModel: (model: Model) => void;
  onModelsUpdate?: () => void;
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [localModels, setLocalModels] = useState<Model[]>(models);
  const [ordenModificado, setOrdenModificado] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const esperandoActualizacionRef = useRef(false);
  const ordenEsperadoRef = useRef<string[]>([]);

  // Configuración de sensores para DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Actualizar modelos locales cuando cambian los modelos prop
  // Solo actualizar si no hay un orden modificado pendiente
  useEffect(() => {
    if (
      !ordenModificado &&
      !guardandoOrden &&
      !esperandoActualizacionRef.current
    ) {
      // Ordenar los modelos por posición (descendente) antes de actualizar
      // Esto asegura que el orden se mantenga incluso después de recargar
      const sortedModels = [...models].sort((a, b) => b.position - a.position);
      // Actualizar siempre para reflejar cambios en el contenido (nombre, descripción, etc.)
      setLocalModels(sortedModels);
    } else if (esperandoActualizacionRef.current && models.length > 0) {
      // Cuando estamos esperando una actualización y llegaron nuevos datos,
      // actualizar con los datos del servidor (ya ordenados por posición)
      const sortedModels = [...models].sort((a, b) => b.position - a.position);
      const newIds = sortedModels.map((m) => m.id);

      // Verificar si el orden de IDs coincide con el orden esperado que guardamos
      const ordenCoincide =
        ordenEsperadoRef.current.length === newIds.length &&
        ordenEsperadoRef.current.every((id, index) => id === newIds[index]);

      if (ordenCoincide) {
        // El orden es correcto, actualizar con los datos nuevos
        setLocalModels(sortedModels);
        setOrdenModificado(false);
        esperandoActualizacionRef.current = false;
        ordenEsperadoRef.current = [];
      }
      // Si no coincide, mantener el orden local (no actualizar todavía)
      // Esto previene el flash del orden anterior
    }
  }, [models, ordenModificado, guardandoOrden]);

  // Función para manejar el drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setLocalModels((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);
        setOrdenModificado(true);

        return newItems;
      });
    }
  };

  // Función para guardar el nuevo orden
  const guardarOrden = async () => {
    setGuardandoOrden(true);
    try {
      const headers = get0kmHeaders(true);

      // Calcular nuevas posiciones (orden descendente: mayor valor = más arriba)
      const updates = localModels.map((model, index) => ({
        id: model.id,
        position: localModels.length - index,
      }));

      // Hacer requests individuales para cada modelo según la documentación
      // PATCH /api/0km/models/:id/position
      const updatePromises = updates.map((update) =>
        fetch(`${API_BASE_URL}/api/0km/models/${update.id}/position`, {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: update.position }),
        })
      );

      // Ejecutar todas las actualizaciones en paralelo
      const responses = await Promise.all(updatePromises);

      // Verificar si alguna request falló
      const failedResponses = responses.filter((response) => {
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized(router);
          return true;
        }
        return !response.ok;
      });

      if (failedResponses.length > 0) {
        throw new Error(
          `Error al actualizar el orden: ${failedResponses.length} modelo(s) no se pudieron actualizar`
        );
      }

      // Guardar el orden esperado antes de actualizar
      ordenEsperadoRef.current = localModels.map((m) => m.id);

      // Actualizar las posiciones en localModels inmediatamente (optimistic update)
      setLocalModels((prevModels) =>
        prevModels.map((model) => {
          const update = updates.find((u) => u.id === model.id);
          return update ? { ...model, position: update.position } : model;
        })
      );

      // Marcar que estamos esperando la actualización del servidor
      esperandoActualizacionRef.current = true;

      // Recargar desde el servidor (similar al dashboard)
      // El servidor debería devolver los modelos con las posiciones actualizadas
      // El useEffect detectará cuando lleguen los datos y los sincronizará
      if (onModelsUpdate) {
        onModelsUpdate();
      }
    } catch (error) {
      console.error('Error al guardar el orden:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al actualizar el orden de los modelos'
      );
    } finally {
      setGuardandoOrden(false);
    }
  };

  const filteredModels = localModels.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && models.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary-admin'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center gap-4 mb-6'>
        <button
          onClick={onBack}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
        >
          <ArrowLeft size={20} className='text-gray-600' />
        </button>
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold text-color-text'>
            Modelos - {brand.name}
          </h1>
          <p className='text-gray-500'>
            Total: <span className='font-medium'>{localModels.length}</span>{' '}
            modelos
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {ordenModificado && (
            <button
              onClick={guardarOrden}
              disabled={guardandoOrden}
              className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-70'
            >
              {guardandoOrden ? (
                <div className='h-4 w-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin'></div>
              ) : (
                <Save size={16} />
              )}
              Guardar orden
            </button>
          )}
          <button
            onClick={onAddModel}
            className='flex items-center gap-2 bg-color-primary-admin hover:bg-color-primary-admin/90 text-white px-4 py-2 rounded-md transition-colors'
          >
            <Plus size={18} />
            Agregar Modelo
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className='mb-6 relative'>
        <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white'>
          <div className='pl-4 py-2.5 text-gray-400'>
            <Search size={18} />
          </div>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Buscar modelo'
            className='flex-grow px-3 py-2.5 focus:outline-none text-color-text'
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-full flex items-center transition-colors'
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Lista de modelos */}
      {filteredModels.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>
            {searchTerm
              ? `No se encontraron modelos que coincidan con "${searchTerm}".`
              : 'No hay modelos disponibles. Agrega uno nuevo para comenzar.'}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredModels.map((model) => model.id)}
            strategy={verticalListSortingStrategy}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='space-y-4'
            >
              {filteredModels.map((model) => (
                <SortableModelCard
                  key={model.id}
                  model={model}
                  onEdit={onEditModel}
                  onDelete={onDeleteModel}
                  onAddVersion={onAddVersion}
                  onSelectModel={onSelectModel}
                  isDragDisabled={!!searchTerm}
                />
              ))}
            </motion.div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

// Vista de versiones de un modelo
const VersionsView = ({
  model,
  versions,
  loading,
  onBack,
  onAddVersion,
  onEditVersion,
  onDeleteVersion,
  onEditModel,
  onVersionsUpdate,
}: {
  model: Model;
  versions: Version[];
  loading: boolean;
  onBack: () => void;
  onAddVersion: () => void;
  onEditVersion: (version: Version) => void;
  onDeleteVersion: (version: Version) => void;
  onEditModel: (model: Model) => void;
  onVersionsUpdate?: () => void;
}) => {
  const router = useRouter();
  const [localVersions, setLocalVersions] = useState<Version[]>([]);
  const [ordenModificado, setOrdenModificado] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const esperandoActualizacionRef = useRef(false);
  const ordenEsperadoRef = useRef<string[]>([]);

  // Configuración de sensores para DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar versiones para asegurar que solo se muestren las del modelo actual
  // Usar useMemo para evitar recrear el array en cada render y prevenir loops infinitos
  const filteredVersions = useMemo(() => {
    return versions.filter((version) => version.model0kmId === model.id);
  }, [versions, model.id]);

  // Actualizar versiones locales cuando cambian las versiones prop
  // Solo actualizar si no hay un orden modificado pendiente
  useEffect(() => {
    // No hacer nada si no hay versiones filtradas
    if (filteredVersions.length === 0) {
      setLocalVersions([]);
      return;
    }

    if (
      !ordenModificado &&
      !guardandoOrden &&
      !esperandoActualizacionRef.current
    ) {
      // Ordenar las versiones por posición (descendente) antes de actualizar
      // Esto asegura que el orden se mantenga incluso después de recargar
      const sortedVersions = [...filteredVersions].sort(
        (a, b) => b.position - a.position
      );

      // Actualizar siempre para reflejar cambios en el contenido (nombre, descripción, etc.)
      setLocalVersions(sortedVersions);
    } else if (
      esperandoActualizacionRef.current &&
      filteredVersions.length > 0
    ) {
      // Cuando estamos esperando una actualización y llegaron nuevos datos,
      // actualizar con los datos del servidor (ya ordenados por posición)
      const sortedVersions = [...filteredVersions].sort(
        (a, b) => b.position - a.position
      );
      const newIds = sortedVersions.map((v) => v.id);

      // Verificar si el orden de IDs coincide con el orden esperado que guardamos
      const ordenCoincide =
        ordenEsperadoRef.current.length === newIds.length &&
        ordenEsperadoRef.current.every((id, index) => id === newIds[index]);

      if (ordenCoincide) {
        // El orden es correcto, actualizar con los datos nuevos
        setLocalVersions(sortedVersions);
        setOrdenModificado(false);
        esperandoActualizacionRef.current = false;
        ordenEsperadoRef.current = [];
      }
      // Si no coincide, mantener el orden local (no actualizar todavía)
      // Esto previene el flash del orden anterior
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredVersions, ordenModificado, guardandoOrden]);

  // Función para manejar el drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setLocalVersions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);
        setOrdenModificado(true);

        return newItems;
      });
    }
  };

  // Función para guardar el nuevo orden
  const guardarOrden = async () => {
    setGuardandoOrden(true);
    try {
      const headers = get0kmHeaders(true);

      // Calcular nuevas posiciones (orden descendente: mayor valor = más arriba)
      const updates = localVersions.map((version, index) => ({
        id: version.id,
        position: localVersions.length - index,
      }));

      // Hacer requests individuales para cada versión
      // PATCH /api/0km/versions/:id/position
      const updatePromises = updates.map((update) =>
        fetch(`${API_BASE_URL}/api/0km/versions/${update.id}/position`, {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: update.position }),
        })
      );

      // Ejecutar todas las actualizaciones en paralelo
      const responses = await Promise.all(updatePromises);

      // Verificar si alguna request falló
      const failedResponses = responses.filter((response) => {
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized(router);
          return true;
        }
        return !response.ok;
      });

      if (failedResponses.length > 0) {
        throw new Error(
          `Error al actualizar el orden: ${failedResponses.length} versión(es) no se pudieron actualizar`
        );
      }

      // Guardar el orden esperado antes de actualizar
      ordenEsperadoRef.current = localVersions.map((v) => v.id);

      // Actualizar las posiciones en localVersions inmediatamente (optimistic update)
      setLocalVersions((prevVersions) =>
        prevVersions.map((version) => {
          const update = updates.find((u) => u.id === version.id);
          return update ? { ...version, position: update.position } : version;
        })
      );

      // Marcar que estamos esperando la actualización del servidor
      esperandoActualizacionRef.current = true;

      // Recargar desde el servidor
      // El useEffect detectará cuando lleguen los datos y los sincronizará
      if (onVersionsUpdate) {
        onVersionsUpdate();
      }
    } catch (error) {
      console.error('Error al guardar el orden:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al actualizar el orden de las versiones'
      );
    } finally {
      setGuardandoOrden(false);
    }
  };

  // Mostrar loading si está cargando y no hay versiones, o si hay versiones pero no corresponden al modelo actual
  if (loading && (versions.length === 0 || filteredVersions.length === 0)) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary-admin'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center gap-4 mb-6'>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onBack) {
              onBack();
            }
          }}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors relative z-10'
        >
          <ArrowLeft size={20} className='text-gray-600' />
        </button>
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold text-color-text'>
            {model.name}
          </h1>
          {localVersions.length > 0 && (
            <p className='text-gray-500'>
              +<span className='font-medium'>{localVersions.length}</span>{' '}
              {localVersions.length === 1 ? 'versión' : 'versiones'}
            </p>
          )}
        </div>
        <div className='flex items-center gap-3'>
          {ordenModificado && (
            <button
              onClick={guardarOrden}
              disabled={guardandoOrden}
              className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-70'
            >
              {guardandoOrden ? (
                <div className='h-4 w-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin'></div>
              ) : (
                <Save size={16} />
              )}
              Guardar orden
            </button>
          )}
          <button
            onClick={onAddVersion}
            className='flex items-center gap-2 bg-color-primary-admin hover:bg-color-primary-admin/90 text-white px-4 py-2 rounded-md transition-colors'
          >
            <Plus size={18} />
            Agregar Versión
          </button>
        </div>
      </div>

      {/* Modelo base */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative bg-white rounded-lg overflow-hidden [box-shadow:0_0_10px_rgba(0,0,0,0.08)] mb-6 cursor-pointer hover:[box-shadow:0_0_10px_rgba(0,0,0,0.2)] transition-shadow'
        onClick={() => onEditModel(model)}
      >
        <div className='p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='relative w-full sm:w-[155px] aspect-[4/3] md:w-[200px] flex-shrink-0'>
              {model.images && model.images.length > 0 ? (
                <Image
                  priority
                  src={model.images[0].thumbnailUrl || model.images[0].imageUrl}
                  alt={model.name}
                  width={400}
                  height={320}
                  className='object-cover rounded-lg'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
                  <span className='text-gray-400'>Sin imagen</span>
                </div>
              )}
              {!model.active && (
                <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                  <span className='text-white font-semibold'>Inactivo</span>
                </div>
              )}
            </div>

            <div className='flex-grow'>
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <h2 className='text-xl lg:text-2xl font-semibold text-gray-900 mb-2'>
                    {model.name}
                    {model.versionName && ` ${model.versionName}`}
                  </h2>
                  {model.description && (
                    <p className='text-sm text-gray-500 line-clamp-3 max-w-2xl'>
                      {model.description}
                    </p>
                  )}
                  {model.technicalSheetUrl && (
                    <a
                      href={model.technicalSheetUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-2 transition-colors'
                    >
                      <FileText size={16} />
                      Ver ficha técnica
                    </a>
                  )}
                  {model.listPrice && model.listPrice > 0 ? (
                    <p className='text-xl lg:text-2xl font-bold text-color-primary-admin mt-2'>
                      {model.currency === 'ARS' ? '$' : 'US$'}
                      {model.promotionalPrice
                        ? model.promotionalPrice.toLocaleString(
                            model.currency === 'ARS' ? 'es-AR' : 'en-US'
                          )
                        : model.listPrice.toLocaleString(
                            model.currency === 'ARS' ? 'es-AR' : 'en-US'
                          )}
                      {model.promotionalPrice && (
                        <span className='text-sm text-gray-500 line-through ml-2'>
                          {model.listPrice.toLocaleString(
                            model.currency === 'ARS' ? 'es-AR' : 'en-US'
                          )}
                        </span>
                      )}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditModel(model);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors ml-4'
                  title='Editar modelo'
                >
                  <Edit size={20} className='text-color-primary-admin' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Título de sección de versiones */}
      <div className='mb-4'>
        <h2 className='text-lg font-semibold text-gray-700'>
          Versiones ({localVersions.length})
        </h2>
      </div>

      {/* Lista de versiones con línea vertical a la izquierda */}
      {localVersions.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>
            No hay versiones disponibles. Agrega una nueva para comenzar.
          </p>
        </div>
      ) : (
        <div className='ml-4 sm:ml-6 border-l-2 border-gray-300 pl-4 sm:pl-6'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localVersions.map((version) => version.id)}
              strategy={verticalListSortingStrategy}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='space-y-4'
              >
                {localVersions.map((version) => (
                  <SortableVersionCard
                    key={version.id}
                    version={version}
                    modelName={model.name}
                    onEdit={onEditVersion}
                    onDelete={onDeleteVersion}
                  />
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

// Función para normalizar nombres a slugs (URL-friendly)
const normalizeToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres unicode (quita acentos)
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
};

// Función para encontrar marca por slug
const findBrandBySlug = (brands: Brand[], slug: string): Brand | undefined => {
  return brands.find((brand) => normalizeToSlug(brand.name) === slug);
};

// Función para encontrar modelo por slug
const findModelBySlug = (models: Model[], slug: string): Model | undefined => {
  return models.find((model) => normalizeToSlug(model.name) === slug);
};

export default function ZeroKmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');
  const modelParam = searchParams.get('model');

  const [view, setView] = useState<'brands' | 'models' | 'versions'>('brands');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<
    Brand | Model | Version | null
  >(null);
  const [deleteType, setDeleteType] = useState<'brand' | 'model' | 'version'>(
    'brand'
  );
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);

  // Cargar marcas
  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/0km/brands`, {
        headers: get0kmHeaders(false),
      });

      if (!response.ok) {
        throw new Error('Error al cargar las marcas');
      }

      const data: Brand[] = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error al cargar las marcas:', error);
      setError(
        error instanceof Error ? error.message : 'Error al cargar las marcas'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargar versiones de un modelo
  const fetchVersions = async (modelId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/0km/versions?model0kmId=${modelId}`,
        {
          headers: get0kmHeaders(false),
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar las versiones');
      }

      const data: Version[] = await response.json();
      // Ordenar por posición (descendente) como en modelos
      const sortedVersions = data.sort((a, b) => b.position - a.position);
      setVersions(sortedVersions);
    } catch (error) {
      console.error('Error al cargar las versiones:', error);
      setError(
        error instanceof Error ? error.message : 'Error al cargar las versiones'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargar modelos de una marca
  const fetchModels = async (brandId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/0km/models?brand0kmId=${brandId}`,
        {
          headers: get0kmHeaders(false),
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar los modelos');
      }

      const data: Model[] = await response.json();
      // Ordenar por posición (descendente) como en el dashboard
      const sortedModels = data.sort((a, b) => b.position - a.position);
      setModels(sortedModels);
    } catch (error) {
      console.error('Error al cargar los modelos:', error);
      setError(
        error instanceof Error ? error.message : 'Error al cargar los modelos'
      );
    } finally {
      setLoading(false);
    }
  };

  // Efecto inicial: cargar marcas y determinar vista basada en query params
  useEffect(() => {
    fetchBrands();
  }, []);

  // Refs para evitar recargas múltiples
  const isInitialLoadRef = useRef(true);
  const lastBrandParamRef = useRef<string | null>(null);
  const lastModelParamRef = useRef<string | null>(null);

  // Efecto para cargar datos basados en query params
  useEffect(() => {
    // Solo procesar si realmente cambió brandParam o es la primera carga
    if (brandParam === lastBrandParamRef.current && !isInitialLoadRef.current) {
      return;
    }

    if (brandParam && brands.length > 0) {
      // Buscar la marca por slug normalizado
      const brand = findBrandBySlug(brands, brandParam);
      if (brand && brand.id !== selectedBrand?.id) {
        lastBrandParamRef.current = brandParam;
        // Limpiar modelos, versiones y modelo seleccionado anteriores inmediatamente para evitar el flash
        setModels([]);
        setVersions([]);
        setSelectedModel(null);
        setSelectedBrand(brand);
        if (modelParam) {
          // Si hay modelo, cargar modelos primero
          fetchModels(brand.id);
        } else {
          // Solo marca, mostrar modelos
          setView('models');
          fetchModels(brand.id);
        }
      }
    } else if (!brandParam) {
      if (lastBrandParamRef.current !== null) {
        lastBrandParamRef.current = null;
        setView('brands');
        setSelectedBrand(null);
        setSelectedModel(null);
        setModels([]);
        setVersions([]);
      }
    }

    isInitialLoadRef.current = false;
  }, [brandParam, brands, selectedBrand, modelParam]);

  // Efecto para cargar el modelo cuando cambia modelParam
  useEffect(() => {
    const modelParamChanged = modelParam !== lastModelParamRef.current;

    if (
      !modelParam &&
      brandParam &&
      selectedBrand?.id &&
      modelParamChanged &&
      lastModelParamRef.current !== null
    ) {
      // Cuando se sale de la vista de versiones (modelParam se elimina pero brandParam existe)
      lastModelParamRef.current = null;
      setSelectedModel(null);
      setVersions([]);
      setView('models');
      // Recargar modelos para actualizar el contador de versiones
      fetchModels(selectedBrand.id);
    } else if (modelParam && modelParamChanged) {
      lastModelParamRef.current = modelParam;
    }
  }, [modelParam, brandParam, selectedBrand]);

  // Efecto separado para cargar el modelo cuando los modelos están disponibles
  useEffect(() => {
    // Solo procesar si hay modelParam y modelos disponibles, pero no se ha seleccionado el modelo aún
    if (
      modelParam &&
      models.length > 0 &&
      lastModelParamRef.current === modelParam
    ) {
      const model = findModelBySlug(models, modelParam);
      if (model && model.id !== selectedModel?.id) {
        // Limpiar versiones anteriores inmediatamente para evitar el flash
        setVersions([]);
        setSelectedModel(model);
        setView('versions');
        fetchVersions(model.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models, modelParam, selectedModel]);

  const handleSelectBrand = (brand: Brand) => {
    if (!brand.id || !brand.name) return;
    const brandSlug = normalizeToSlug(brand.name);
    router.push(`/admin/0km?brand=${brandSlug}`);
  };

  const handleSelectModel = (model: Model) => {
    if (!model.id || !model.name || !selectedBrand?.name) return;
    const brandSlug = normalizeToSlug(selectedBrand.name);
    const modelSlug = normalizeToSlug(model.name);
    // Limpiar selectedModel antes de navegar para forzar que los efectos se ejecuten
    // Esto asegura que la navegación funcione correctamente incluso si el modelo ya estaba seleccionado
    if (selectedModel?.id === model.id) {
      setSelectedModel(null);
    }
    router.push(`/admin/0km?brand=${brandSlug}&model=${modelSlug}`);
  };

  const handleBackToBrands = () => {
    router.push('/admin/0km');
  };

  const handleBackToModels = () => {
    try {
      if (selectedBrand?.name) {
        const brandSlug = normalizeToSlug(selectedBrand.name);
        router.push(`/admin/0km?brand=${brandSlug}`);
      } else {
        router.push('/admin/0km');
      }
    } catch (error) {
      console.error('Error al navegar hacia atrás:', error);
    }
  };

  // Handlers para Brands
  const handleAddBrand = () => {
    setEditingBrand(null);
    setBrandModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandModalOpen(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setItemToDelete(brand);
    setDeleteType('brand');
    setDeleteModalOpen(true);
  };

  // Handlers para Models
  const handleAddModel = () => {
    setEditingModel(null);
    setModelModalOpen(true);
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setModelModalOpen(true);
  };

  const handleDeleteModel = (model: Model) => {
    setItemToDelete(model);
    setDeleteType('model');
    setDeleteModalOpen(true);
  };

  // Handlers para Versions
  const handleAddVersion = (model?: Model) => {
    if (model && model.id) {
      setSelectedModel(model);
    }
    setEditingVersion(null);
    setVersionModalOpen(true);
  };

  const handleEditVersion = (version: Version) => {
    setEditingVersion(version);
    setVersionModalOpen(true);
  };

  const handleDeleteVersion = (version: Version) => {
    setItemToDelete(version);
    setDeleteType('version');
    setDeleteModalOpen(true);
  };

  // Handlers de eliminación
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      let url = '';
      if (deleteType === 'brand') {
        url = `${API_BASE_URL}/api/0km/brands/${itemToDelete.id}`;
      } else if (deleteType === 'model') {
        url = `${API_BASE_URL}/api/0km/models/${itemToDelete.id}`;
      } else {
        url = `${API_BASE_URL}/api/0km/versions/${itemToDelete.id}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: get0kmHeaders(true),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized(router);
        return;
      }

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      setNotification({
        isOpen: true,
        type: 'success',
        message: `${
          deleteType === 'brand'
            ? 'Marca'
            : deleteType === 'model'
            ? 'Modelo'
            : 'Versión'
        } eliminado con éxito`,
      });
      setDeleteModalOpen(false);
      setItemToDelete(null);

      // Refrescar datos según el tipo
      if (deleteType === 'brand') {
        fetchBrands();
        if (selectedBrand?.id === itemToDelete.id) {
          handleBackToBrands();
        }
      } else if (deleteType === 'model') {
        if (selectedBrand?.id) {
          fetchModels(selectedBrand.id);
        }
        if (selectedModel?.id === itemToDelete.id) {
          handleBackToModels();
        }
      } else {
        // Si se elimina una versión
        if (selectedModel?.id) {
          fetchVersions(selectedModel.id);
        }
        // También recargar modelos si estamos en la vista de modelos para actualizar el contador
        if (selectedBrand?.id && (view === 'models' || !selectedModel)) {
          fetchModels(selectedBrand.id);
        }
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : `Error al eliminar ${
                deleteType === 'brand'
                  ? 'la marca'
                  : deleteType === 'model'
                  ? 'el modelo'
                  : 'la versión'
              }`,
      });
    }
  };

  // Handlers de submit para Brands
  const handleBrandSubmit = async (
    brand: { name: string },
    imageFile?: File
  ) => {
    try {
      const formData = new FormData();
      formData.append('name', brand.name);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editingBrand
        ? `${API_BASE_URL}/api/0km/brands/${editingBrand.id}`
        : `${API_BASE_URL}/api/0km/brands`;

      const response = await fetch(url, {
        method: editingBrand ? 'PUT' : 'POST',
        headers: get0kmHeaders(true),
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized(router);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la marca');
      }

      setNotification({
        isOpen: true,
        type: 'success',
        message: editingBrand
          ? 'Marca actualizada con éxito'
          : 'Marca creada con éxito',
      });
      setBrandModalOpen(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (error) {
      console.error('Error al guardar la marca:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Error al guardar la marca',
      });
      throw error;
    }
  };

  // Handlers de submit para Models
  const handleModelSubmit = async (
    model: {
      brand0kmId: string;
      name: string;
      description?: string;
      year?: number;
      versionName?: string;
      listPrice?: number;
      promotionalPrice?: number;
      currency?: string;
      minDownPayment?: number;
      installmentsCount?: number;
      installmentAmount?: number;
    },
    images?: File[],
    pdf?: File,
    imagesToDelete?: string[]
  ) => {
    try {
      const formData = new FormData();
      formData.append('brand0kmId', model.brand0kmId);
      formData.append('name', model.name);
      // Siempre enviar description cuando estamos editando, incluso si está vacío
      // Para crear, solo enviar si tiene contenido
      if (editingModel || model.description !== undefined) {
        formData.append('description', model.description || '');
      }
      if (model.year) {
        formData.append('year', model.year.toString());
      }
      // Siempre enviar versionName cuando estamos editando, incluso si está vacío
      if (editingModel || model.versionName !== undefined) {
        formData.append('versionName', model.versionName || '');
      }
      // Siempre enviar listPrice, incluso si es undefined/null para que el backend lo actualice
      if (model.listPrice !== undefined) {
        formData.append('listPrice', model.listPrice.toString());
      } else {
        formData.append('listPrice', '');
      }
      if (model.promotionalPrice !== undefined) {
        formData.append('promotionalPrice', model.promotionalPrice.toString());
      } else {
        formData.append('promotionalPrice', '');
      }
      if (model.currency) {
        formData.append('currency', model.currency);
      }
      if (model.minDownPayment !== undefined) {
        formData.append('minDownPayment', model.minDownPayment.toString());
      }
      if (model.installmentsCount !== undefined) {
        formData.append(
          'installmentsCount',
          model.installmentsCount.toString()
        );
      }
      if (model.installmentAmount !== undefined) {
        formData.append(
          'installmentAmount',
          model.installmentAmount.toString()
        );
      }
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }
      if (pdf) {
        formData.append('pdf', pdf);
      }
      if (imagesToDelete && imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      const url = editingModel
        ? `${API_BASE_URL}/api/0km/models/${editingModel.id}`
        : `${API_BASE_URL}/api/0km/models`;

      const response = await fetch(url, {
        method: editingModel ? 'PUT' : 'POST',
        headers: get0kmHeaders(true),
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized(router);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el modelo');
      }

      setNotification({
        isOpen: true,
        type: 'success',
        message: editingModel
          ? 'Modelo actualizado con éxito'
          : 'Modelo creado con éxito',
      });
      setModelModalOpen(false);
      setEditingModel(null);
      if (selectedBrand?.id) {
        await fetchModels(selectedBrand.id);
        // Actualizar selectedModel si estamos editando el modelo actualmente seleccionado
        if (editingModel && selectedModel?.id === editingModel.id) {
          // Buscar el modelo actualizado en la lista de modelos
          const response = await fetch(
            `${API_BASE_URL}/api/0km/models/${editingModel.id}`,
            {
              headers: get0kmHeaders(false),
            }
          );
          if (response.ok) {
            const updatedModel = await response.json();
            setSelectedModel(updatedModel);
          }
        }
      }
    } catch (error) {
      console.error('Error al guardar el modelo:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Error al guardar el modelo',
      });
      throw error;
    }
  };

  // Handlers de submit para Versions
  const handleVersionSubmit = async (
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
  ) => {
    try {
      const formData = new FormData();
      formData.append('model0kmId', version.model0kmId);
      formData.append('name', version.name);
      formData.append('year', version.year.toString());
      // Siempre enviar listPrice, incluso si es undefined/null para que el backend lo actualice
      if (version.listPrice !== undefined) {
        formData.append('listPrice', version.listPrice.toString());
      } else {
        formData.append('listPrice', '');
      }
      // Siempre enviar description cuando estamos editando, incluso si está vacío
      // Para crear, solo enviar si tiene contenido
      if (editingVersion || version.description !== undefined) {
        formData.append('description', version.description || '');
      }
      if (version.currency) {
        formData.append('currency', version.currency);
      }
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }
      if (pdf) {
        formData.append('pdf', pdf);
      }
      if (imagesToDelete && imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      const url = editingVersion
        ? `${API_BASE_URL}/api/0km/versions/${editingVersion.id}`
        : `${API_BASE_URL}/api/0km/versions`;

      const response = await fetch(url, {
        method: editingVersion ? 'PUT' : 'POST',
        headers: get0kmHeaders(true),
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized(router);
        return;
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const textError = await response.text();
            if (textError) {
              errorMessage = textError.substring(0, 200);
            }
          }
        } catch (parseError) {
          console.error('Error al parsear respuesta de error:', parseError);
        }
        throw new Error(errorMessage);
      }

      setNotification({
        isOpen: true,
        type: 'success',
        message: editingVersion
          ? 'Versión actualizada con éxito'
          : 'Versión creada con éxito',
      });
      setVersionModalOpen(false);
      setEditingVersion(null);

      // Recargar versiones si estamos en la vista de versiones
      if (selectedModel?.id) {
        await fetchVersions(selectedModel.id);
      }

      // Recargar modelos si estamos en la vista de modelos para actualizar el contador de versiones
      if (selectedBrand?.id && (view === 'models' || !selectedModel)) {
        await fetchModels(selectedBrand.id);
        // Si estamos en la vista de versiones, también actualizar selectedModel
        if (selectedModel?.id && view === 'versions') {
          const response = await fetch(
            `${API_BASE_URL}/api/0km/models/${selectedModel.id}`,
            {
              headers: get0kmHeaders(false),
            }
          );
          if (response.ok) {
            const updatedModel = await response.json();
            setSelectedModel(updatedModel);
          }
        }
      }
    } catch (error) {
      console.error('Error al guardar la versión:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Error al guardar la versión',
      });
      throw error;
    }
  };

  return (
    <div className='max-w-7xl my-10'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'>
          {error}
        </div>
      )}

      {view === 'brands' && (
        <BrandsView
          brands={brands}
          loading={loading}
          onAddBrand={handleAddBrand}
          onEditBrand={handleEditBrand}
          onDeleteBrand={handleDeleteBrand}
          onSelectBrand={handleSelectBrand}
          onBrandsUpdate={fetchBrands}
        />
      )}

      {view === 'models' && selectedBrand && (
        <ModelsView
          brand={selectedBrand}
          models={models}
          loading={loading}
          onBack={handleBackToBrands}
          onAddModel={handleAddModel}
          onEditModel={handleEditModel}
          onDeleteModel={handleDeleteModel}
          onAddVersion={handleAddVersion}
          onSelectModel={handleSelectModel}
          onModelsUpdate={() => {
            // Recargar modelos desde el servidor para asegurar sincronización
            if (selectedBrand?.id) {
              fetchModels(selectedBrand.id);
            }
          }}
        />
      )}

      {view === 'versions' && selectedBrand && selectedModel && (
        <VersionsView
          model={selectedModel}
          versions={versions}
          loading={loading}
          onBack={handleBackToModels}
          onAddVersion={() => handleAddVersion()}
          onEditVersion={handleEditVersion}
          onDeleteVersion={handleDeleteVersion}
          onEditModel={handleEditModel}
          onVersionsUpdate={() => {
            // Recargar versiones desde el servidor para asegurar sincronización
            if (selectedModel?.id) {
              fetchVersions(selectedModel.id);
            }
          }}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Eliminar ${
          deleteType === 'brand'
            ? 'Marca'
            : deleteType === 'model'
            ? 'Modelo'
            : 'Versión'
        }`}
        message={`¿Estás seguro de que deseas eliminar ${
          deleteType === 'brand'
            ? `la marca ${(itemToDelete as Brand)?.name}`
            : deleteType === 'model'
            ? `el modelo ${(itemToDelete as Model)?.name}`
            : `la versión ${(itemToDelete as Version)?.name}`
        }? Esta acción no se puede deshacer.`}
      />

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type={notification.type}
        message={notification.message}
      />

      <BrandModal
        isOpen={brandModalOpen}
        onClose={() => {
          setBrandModalOpen(false);
          setEditingBrand(null);
        }}
        onSubmit={handleBrandSubmit}
        initialData={editingBrand}
      />

      {selectedBrand?.id && (
        <ModelModal
          isOpen={modelModalOpen}
          onClose={() => {
            setModelModalOpen(false);
            setEditingModel(null);
          }}
          onSubmit={handleModelSubmit}
          initialData={editingModel || undefined}
          brandId={selectedBrand.id}
        />
      )}

      {selectedModel?.id && (
        <VersionModal
          isOpen={versionModalOpen}
          onClose={() => {
            setVersionModalOpen(false);
            setEditingVersion(null);
            // Si estamos en la vista de modelos (no en versiones), limpiar selectedModel al cerrar
            // para evitar conflictos de navegación cuando el usuario hace click en el contenedor
            if (view === 'models') {
              setSelectedModel(null);
            }
          }}
          onSubmit={handleVersionSubmit}
          initialData={editingVersion || undefined}
          modelId={selectedModel.id}
          modelName={selectedModel.name}
        />
      )}
    </div>
  );
}
