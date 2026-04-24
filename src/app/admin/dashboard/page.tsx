'use client';

import { useState, useEffect, useCallback } from 'react';
import AutoModal from '../components/AutoModal';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash,
  Plus,
  RefreshCw,
  Star,
  Zap,
  GripVertical,
  Save,
  Search,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { ConfirmModal } from '../components/ConfirmModal';
import SellConfirmModal from '../components/SellConfirmModal';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Notification } from '../components/Notification';
import { LimitModal } from '../components/LimitModal';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';

// Interfaz para los datos del formulario de autos
interface AutoFormData {
  marca: string;
  modelo: string;
  año: string;
  precio: number;
  currency: 'USD' | 'ARS';
  descripcion: string;
  categoria: string;
  kilometraje: number;
  transmision: string;
  combustible: string;
  puertas: number;
  images?: File[];
  imagesToDelete?: string[];
  imageOrder?: Array<{ id: string; order: number }>;
  color: string;
}

// URL base del API
import { API_BASE_URL, TENANT } from '@/app/constants/constants';

interface Imagen {
  thumbnailUrl: string;
}

interface Categoria {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Auto {
  id: string;
  marca: string;
  marcaId: string;
  modelo: string;
  año: number;
  precio: number;
  currency: 'USD' | 'ARS';
  active: boolean;
  imagenes: string[];
  descripcion: string;
  kilometraje: number;
  combustible: string;
  transmision: string;
  puertas: number;
  categoria: string;
  categoriaId: string;
  destacado: boolean;
  favorito: boolean;
  position: number;
}

// Interfaz para la respuesta de la API
interface ApiCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: string;
  currency: 'USD' | 'ARS';
  description: string;
  position: number;
  featured: boolean;
  favorite: boolean;
  active: boolean;
  categoryId: string;
  mileage: number;
  transmission: string;
  fuel: string;
  doors: number;
  createdAt: string;
  updatedAt: string;
  Category: Categoria;
  images: Imagen[];
}

interface ApiResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  cars: ApiCar[];
}

// Componente para un auto que se puede arrastrar
interface SortableAutoCardProps {
  auto: Auto;
  index: number;
  onEdit: (auto: Auto) => void;
  onDelete: (auto: Auto) => void;
  onSell: (auto: Auto) => void;
  onToggleActive: (id: string) => void;
  onToggleDestacado: (id: string) => void;
  onToggleFavorito: (id: string) => void;
  isDragDisabled?: boolean;
}

const SortableAutoCard = ({
  auto,
  onEdit,
  onDelete,
  onSell,
  onToggleActive,
  onToggleDestacado,
  onToggleFavorito,
  isDragDisabled = false,
}: SortableAutoCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: auto.id,
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
      onClick={() => onEdit(auto)}
    >
      <div className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative w-full sm:w-[155px] aspect-[4/3] md:w-[200px] flex-shrink-0'>
            {auto.imagenes && auto.imagenes.length > 0 ? (
              <Image
                priority
                src={auto.imagenes[0]}
                alt={`${auto.modelo}`}
                width={400}
                height={320}
                className='object-cover rounded-lg'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
                <span className='text-gray-400'>Sin imagen</span>
              </div>
            )}
            {!auto.active && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                <span className='text-white font-semibold'>Pausado</span>
              </div>
            )}
            <div
              className='absolute top-2 left-2 p-1.5 bg-white/80 rounded-full shadow-sm cursor-grab z-10 hover:bg-white'
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
                  {auto.modelo}
                </h3>
                {auto.precio && auto.precio > 0 ? (
                  <p className='text-xl lg:text-2xl font-bold text-color-primary-admin mt-1'>
                    {auto.currency === 'ARS' ? '$' : 'US$'}
                    {auto.precio.toLocaleString(
                      auto.currency === 'ARS' ? 'es-AR' : 'en-US'
                    )}
                  </p>
                ) : (
                  ''
                )}
                <p className='text-base lg:text-base text-gray-500 mt-2'>
                  {auto.año} • {auto.combustible} •{' '}
                  {auto.kilometraje.toLocaleString('es-AR')} km
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(auto.id);
                  }}
                  className={`px-3 py-1 rounded-full text-base font-medium transition-colors ${
                    auto.active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {auto.active ? 'Activo' : 'Pausado'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (auto.active) {
                      onToggleDestacado(auto.id);
                    }
                  }}
                  className={`p-2 rounded-full transition-all hidden ${
                    auto.destacado
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  } ${!auto.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={
                    !auto.active
                      ? 'Auto pausado, no puede modificarse'
                      : auto.destacado
                      ? 'Quitar de Ingreso'
                      : 'Marcar como Ingreso'
                  }
                >
                  {auto.destacado ? (
                    <Zap size={20} fill='currentColor' />
                  ) : (
                    <Zap size={20} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (auto.active) {
                      onToggleFavorito(auto.id);
                    }
                  }}
                  className={`p-2 rounded-full transition-all hidden ${
                    auto.favorito
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  } ${!auto.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={
                    !auto.active
                      ? 'Auto pausado, no puede modificarse'
                      : auto.favorito
                      ? 'Quitar de favoritos'
                      : 'Marcar como favorito'
                  }
                >
                  {auto.favorito ? (
                    <Star size={20} fill='currentColor' />
                  ) : (
                    <Star size={20} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(auto);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <Edit size={20} className='text-color-primary-admin' />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(auto);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <Trash size={20} className='text-red-500' />
                </button>
              </div>
            </div>

            {/* Botón de vender con posición absoluta */}
            <div className='mt-4 flex justify-end'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSell(auto);
                }}
                className='bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors'
              >
                Vender
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [autos, setAutos] = useState<Auto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState<Auto | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAutos, setTotalAutos] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [autoToDelete, setAutoToDelete] = useState<Auto | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [autoToSell, setAutoToSell] = useState<Auto | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [todosLosAutos, setTodosLosAutos] = useState<Auto[]>([]);
  const [ordenModificado, setOrdenModificado] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [autosDestacados, setAutosDestacados] = useState<Auto[]>([]);
  const [autosFavoritos, setAutosFavoritos] = useState<Auto[]>([]);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitType, setLimitType] = useState<'destacado' | 'favorito'>(
    'destacado'
  );
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Auto[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [paginasBusqueda, setPaginasBusqueda] = useState(1);

  // Configuración de sensores para DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distancia en píxeles que se debe mover antes de comenzar el arrastre
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleUnauthorized = () => {
    // Remover el token
    Cookies.remove('admin-auth');
    // Redirigir al login
    router.push('/admin/login');
  };

  // Obtener todos los autos (sin búsqueda)
  const fetchTodosLosAutos = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const token = Cookies.get('admin-auth');

      const url = `${API_BASE_URL}/api/admin/cars?page=${page}&limit=12&tenant=${TENANT}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudieron cargar los autos`
        );
      }

      const data: ApiResponse = await response.json();

      const autosFormateados: Auto[] = data.cars.map((car) => ({
        id: car.id,
        marca: car.brand,
        marcaId: car.brand.toLowerCase(),
        modelo: car.model,
        año: car.year,
        precio: parseFloat(car.price),
        currency: car.currency || 'USD',
        active: car.active,
        imagenes:
          car.images && car.images.length > 0
            ? car.images.map((img) => img.thumbnailUrl)
            : [],
        descripcion: car.description,
        kilometraje: car.mileage,
        combustible: car.fuel,
        transmision: car.transmission,
        puertas: car.doors,
        categoria: car.Category?.name || 'Sin categoría',
        categoriaId: car.categoryId,
        destacado: car.featured,
        favorito: car.favorite,
        position: car.position,
      }));

      // Mantener un registro de todos los autos cargados
      if (append) {
        // Si estamos añadiendo más autos a los existentes
        const autosIds = new Set(todosLosAutos.map((auto) => auto.id));
        const nuevosAutos = autosFormateados.filter(
          (auto) => !autosIds.has(auto.id)
        );

        // Añadir los nuevos autos manteniendo el orden por posición
        setTodosLosAutos((prev) => {
          const combinados = [...prev, ...nuevosAutos];
          // Ordenar por posición (mayor a menor)
          return combinados.sort((a, b) => b.position - a.position);
        });
      } else {
        // Si estamos recargando completamente (página 1)
        setTodosLosAutos(
          autosFormateados.sort((a, b) => b.position - a.position)
        );
      }

      // Actualizar la página actual y la vista
      if (page === 1) {
        setAutos(autosFormateados);
      } else {
        // Solo actualizar autos si es la primera carga o si estamos en modo no-append
        if (!append) {
          setAutos(autosFormateados);
        }
      }

      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalAutos(data.total);

      setBuscando(false);
    } catch (error) {
      console.error('Error al cargar los autos:', error);
      setError(
        error instanceof Error ? error.message : 'Error al cargar los autos'
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Buscar autos
  const fetchBusqueda = async (page = 1, append = false, search = '') => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const token = Cookies.get('admin-auth');

      const url = `${API_BASE_URL}/api/admin/cars?page=${page}&limit=12${
        search ? `&model=${encodeURIComponent(search)}` : ''
      }&tenant=${TENANT}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudieron cargar los autos`
        );
      }

      const data: ApiResponse = await response.json();

      const autosFormateados: Auto[] = data.cars.map((car) => ({
        id: car.id,
        marca: car.brand,
        marcaId: car.brand.toLowerCase(),
        modelo: car.model,
        año: car.year,
        precio: parseFloat(car.price),
        currency: car.currency || 'USD',
        active: car.active,
        imagenes: car.images.map((img) => img.thumbnailUrl),
        descripcion: car.description,
        kilometraje: car.mileage,
        combustible: car.fuel,
        transmision: car.transmission,
        puertas: car.doors,
        categoria: car.Category?.name || 'Sin categoría',
        categoriaId: car.categoryId,
        destacado: car.featured,
        favorito: car.favorite,
        position: car.position,
      }));

      // Actualizar resultados de búsqueda
      if (append) {
        setResultadosBusqueda((prev) => [...prev, ...autosFormateados]);
      } else {
        setResultadosBusqueda(autosFormateados);
      }

      setBuscando(true);
      setCurrentPage(data.currentPage);
      setPaginasBusqueda(data.totalPages);
      setTotalResultados(data.total);
    } catch (error) {
      console.error('Error al buscar autos:', error);
      setError(
        error instanceof Error ? error.message : 'Error al buscar autos'
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (buscando) {
      if (currentPage < paginasBusqueda && !loadingMore) {
        fetchBusqueda(currentPage + 1, true, busqueda);
      }
    } else {
      if (currentPage < totalPages && !loadingMore) {
        fetchTodosLosAutos(currentPage + 1, true);
      }
    }
  };

  const observer = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: buscando
      ? currentPage < paginasBusqueda
      : currentPage < totalPages,
    loading: loadingMore,
  });

  useEffect(() => {
    fetchTodosLosAutos();
  }, []);

  // Efecto para actualizar el estado de autos cuando cambia todosLosAutos
  // Esto asegura que cualquier cambio de orden se refleje correctamente
  useEffect(() => {
    if (!buscando) {
      // Mostrar autos en la página actual manteniendo el orden de todosLosAutos
      const startIndex = (currentPage - 1) * 12;
      const endIndex = startIndex + 12;
      setAutos(
        todosLosAutos.slice(
          startIndex,
          Math.min(endIndex, todosLosAutos.length)
        )
      );
    }
  }, [todosLosAutos, currentPage, buscando]);

  const handleDeleteClick = (auto: Auto) => {
    setAutoToDelete(auto);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!autoToDelete) return;

    try {
      const token = Cookies.get('admin-auth');
      const response = await fetch(
        `${API_BASE_URL}/api/cars/${autoToDelete.id}?tenant=${TENANT}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('Error al eliminar el auto');
      }

      // Eliminar el auto de la lista actual
      setAutos((prevAutos) =>
        prevAutos.filter((auto) => auto.id !== autoToDelete.id)
      );

      // Eliminar de la lista completa de autos cargados
      setTodosLosAutos((prev) =>
        prev.filter((auto) => auto.id !== autoToDelete.id)
      );

      // Actualizar el contador total
      setTotalAutos((prev) => prev - 1);

      // Si la página actual está ahora vacía y no es la primera página,
      // mostrar la página anterior
      if (autos.length === 1 && currentPage > 1) {
        const nuevaPagina = currentPage - 1;
        setCurrentPage(nuevaPagina);

        // Mostrar los autos de la página anterior desde los que ya tenemos cargados
        const indiceInicial = (nuevaPagina - 1) * 10;
        const nuevoAutos = todosLosAutos
          .filter((auto) => auto.id !== autoToDelete.id)
          .slice(indiceInicial, indiceInicial + 10);

        setAutos(nuevoAutos);
      }

      // Mostrar notificación de éxito
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Auto eliminado con éxito',
      });
    } catch (error) {
      console.error('Error al eliminar el auto:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Error al eliminar el auto',
      });
    }
  };

  const handleToggleEstado = async (id: string) => {
    try {
      const token = Cookies.get('admin-auth');
      const response = await fetch(
        `${API_BASE_URL}/api/cars/${id}/toggle-active?tenant=${TENANT}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cambiar el estado del auto');
      }

      // Obtener el auto actualizado de la respuesta
      const autoActualizado: ApiCar = await response.json();

      // Actualizar el auto en la lista local para evitar tener que recargar toda la lista
      setAutos((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                active: autoActualizado.active,
              }
            : auto
        )
      );

      // Actualizar también en todosLosAutos
      setTodosLosAutos((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                active: autoActualizado.active,
              }
            : auto
        )
      );

      // Actualizar resultados de búsqueda si hay búsqueda activa
      if (buscando) {
        setResultadosBusqueda((prevResultados) =>
          prevResultados.map((auto) =>
            auto.id === id
              ? {
                  ...auto,
                  active: autoActualizado.active,
                }
              : auto
          )
        );
      }

      // Si el auto está en destacados o favoritos, actualizar esas listas también
      setAutosDestacados((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                active: autoActualizado.active,
              }
            : auto
        )
      );

      setAutosFavoritos((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                active: autoActualizado.active,
              }
            : auto
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado del auto:', error);
      alert('Error al cambiar el estado del auto');
    }
  };

  const handleToggleDestacado = async (id: string) => {
    try {
      const token = Cookies.get('admin-auth');

      // Verificar si estamos intentando activar un auto destacado y ya llegamos al límite
      const autoActual = todosLosAutos.find((auto) => auto.id === id);
      if (autoActual && !autoActual.destacado && autosDestacados.length >= 10) {
        // Mostrar modal de límite alcanzado
        setLimitType('destacado');
        setLimitModalOpen(true);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cars/${id}/toggle-featured?tenant=${TENANT}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(
          `Error al cambiar el estado de destacado del auto: ${response.status}`
        );
      }

      const autoActualizado = await response.json();

      // Actualizar en la lista visible actual
      setAutos((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                destacado: autoActualizado.featured,
              }
            : auto
        )
      );

      // Actualizar en todos los autos
      setTodosLosAutos((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                destacado: autoActualizado.featured,
              }
            : auto
        )
      );

      // Actualizar resultados de búsqueda si hay búsqueda activa
      if (buscando) {
        setResultadosBusqueda((prevResultados) =>
          prevResultados.map((auto) =>
            auto.id === id
              ? {
                  ...auto,
                  destacado: autoActualizado.featured,
                }
              : auto
          )
        );
      }

      // Actualizar la lista de autos destacados
      // Si el auto se convirtió en destacado, añadirlo a la lista si no existe
      if (autoActualizado.featured) {
        const autoExistente = autosDestacados.find((auto) => auto.id === id);
        if (!autoExistente) {
          // Buscar el auto completo en todosLosAutos
          const autoCompleto =
            todosLosAutos.find((auto) => auto.id === id) ||
            (buscando
              ? resultadosBusqueda.find((auto) => auto.id === id)
              : null);

          if (autoCompleto) {
            setAutosDestacados((prev) => [
              ...prev,
              { ...autoCompleto, destacado: true },
            ]);
          }
        }
      } else {
        // Si el auto dejó de ser destacado, eliminarlo de la lista
        setAutosDestacados((prev) => prev.filter((auto) => auto.id !== id));
      }

      // Volver a obtener la lista completa de destacados para asegurar sincronización
      fetchAutosDestacados();
    } catch (error) {
      console.error('Error al cambiar el estado de destacado del auto:', error);
      alert('Error al cambiar el estado de destacado del auto');
    }
  };

  const handleToggleFavorito = async (id: string) => {
    try {
      const token = Cookies.get('admin-auth');

      // Verificar si estamos intentando activar un auto favorito y ya llegamos al límite
      const autoActual = todosLosAutos.find((auto) => auto.id === id);
      if (autoActual && !autoActual.favorito && autosFavoritos.length >= 10) {
        // Mostrar modal de límite alcanzado
        setLimitType('favorito');
        setLimitModalOpen(true);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cars/${id}/toggle-favorite?tenant=${TENANT}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(
          `Error al cambiar el estado de favorito del auto: ${response.status}`
        );
      }

      const autoActualizado = await response.json();

      // Actualizar en la lista visible actual
      setAutos((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                favorito: autoActualizado.favorite,
              }
            : auto
        )
      );

      // Actualizar en todos los autos
      setTodosLosAutos((prevAutos) =>
        prevAutos.map((auto) =>
          auto.id === id
            ? {
                ...auto,
                favorito: autoActualizado.favorite,
              }
            : auto
        )
      );

      // Actualizar resultados de búsqueda si hay búsqueda activa
      if (buscando) {
        setResultadosBusqueda((prevResultados) =>
          prevResultados.map((auto) =>
            auto.id === id
              ? {
                  ...auto,
                  favorito: autoActualizado.favorite,
                }
              : auto
          )
        );
      }

      // Actualizar la lista de autos favoritos
      // Si el auto se convirtió en favorito, añadirlo a la lista si no existe
      if (autoActualizado.favorite) {
        const autoExistente = autosFavoritos.find((auto) => auto.id === id);
        if (!autoExistente) {
          // Buscar el auto completo en todosLosAutos o en resultados de búsqueda
          const autoCompleto =
            todosLosAutos.find((auto) => auto.id === id) ||
            (buscando
              ? resultadosBusqueda.find((auto) => auto.id === id)
              : null);

          if (autoCompleto) {
            setAutosFavoritos((prev) => [
              ...prev,
              { ...autoCompleto, favorito: true },
            ]);
          }
        }
      } else {
        // Si el auto dejó de ser favorito, eliminarlo de la lista
        setAutosFavoritos((prev) => prev.filter((auto) => auto.id !== id));
      }

      // Volver a obtener la lista completa de favoritos para asegurar sincronización
      fetchAutosFavoritos();
    } catch (error) {
      console.error('Error al cambiar el estado de favorito del auto:', error);
      alert('Error al cambiar el estado de favorito del auto');
    }
  };

  const handleCreateAuto = async (data: AutoFormData) => {
    try {
      const token = Cookies.get('admin-auth');

      // Crear un FormData para enviar los datos y las imágenes
      const formData = new FormData();

      // Agregar los campos de texto
      formData.append('brand', data.marca);
      formData.append('model', data.modelo);
      formData.append('year', data.año);
      formData.append('price', data.precio.toString());
      formData.append('currency', data.currency);

      // Tratamiento especial para la descripción
      try {
        // Limitar la longitud y manejar posibles caracteres especiales
        const descripcion = data.descripcion || '';
        // Convertir caracteres especiales a entidades HTML si es necesario
        const descripcionLimpia = descripcion.replace(/\r\n/g, '\n').trim();
        formData.append('description', descripcionLimpia);
      } catch (e) {
        console.error('Error al procesar la descripción:', e);
        formData.append('description', 'Error al procesar la descripción');
      }

      formData.append('category', data.categoria);
      formData.append('mileage', data.kilometraje.toString());
      formData.append('transmission', data.transmision);
      formData.append('fuel', data.combustible);
      formData.append('doors', data.puertas.toString());
      formData.append('color', data.color);

      // Agregar imágenes nuevas si existen
      const tieneImagenesNuevas = data.images && data.images.length > 0;
      if (tieneImagenesNuevas) {
        data.images?.forEach((image: File) => {
          formData.append('images', image);
        });
      }

      // Agregar imagesToDelete si existe
      if (data.imagesToDelete && data.imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(data.imagesToDelete));
      }

      // Agregar imageOrder si existe
      if (data.imageOrder && data.imageOrder.length > 0) {
        const jsonImageOrder = JSON.stringify(data.imageOrder);
        formData.append('imageOrder', jsonImageOrder);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cars?tenant=${TENANT}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.message || 'Error al crear el auto');
      }

      // Mostrar notificación de éxito
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Auto creado exitosamente',
      });

      // Cerrar el modal y actualizar la lista
      setIsModalOpen(false);
      setSelectedAuto(undefined);
      setCurrentPage(1);
      // Recargar desde la primera página
      fetchTodosLosAutos(1, false);
    } catch (error) {
      console.error('Error al crear el auto:', error);

      // Mostrar notificación de error
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Error al crear el auto',
      });
    }
  };

  const handleEditAuto = async (data: AutoFormData) => {
    try {
      if (!selectedAuto) {
        throw new Error('No se ha seleccionado ningún auto para editar');
      }

      const token = Cookies.get('admin-auth');

      // Crear un FormData para enviar los datos y las imágenes
      const formData = new FormData();

      // Agregar los campos de texto
      formData.append('brand', data.marca);
      formData.append('model', data.modelo);
      formData.append('year', data.año);
      formData.append('price', data.precio.toString());
      formData.append('currency', data.currency);

      // Tratamiento especial para la descripción
      try {
        // Limitar la longitud y manejar posibles caracteres especiales
        const descripcion = data.descripcion || '';
        // Convertir caracteres especiales a entidades HTML si es necesario
        const descripcionLimpia = descripcion.replace(/\r\n/g, '\n').trim();
        formData.append('description', descripcionLimpia);
      } catch (e) {
        console.error('Error al procesar la descripción:', e);
        formData.append('description', 'Error al procesar la descripción');
      }

      formData.append('category', data.categoria);
      formData.append('mileage', data.kilometraje.toString());
      formData.append('transmission', data.transmision);
      formData.append('fuel', data.combustible);
      formData.append('doors', data.puertas.toString());
      formData.append('color', data.color);

      // Agregar imágenes nuevas si existen
      const tieneImagenesNuevas = data.images && data.images.length > 0;
      if (tieneImagenesNuevas) {
        data.images?.forEach((image: File) => {
          formData.append('images', image);
        });
      }

      // Agregar imágenes a eliminar si existen
      const tieneImagenesAEliminar =
        data.imagesToDelete && data.imagesToDelete.length > 0;
      if (tieneImagenesAEliminar) {
        const jsonImagesToDelete = JSON.stringify(data.imagesToDelete);
        formData.append('imagesToDelete', jsonImagesToDelete);
      }

      // Agregar orden de imágenes si existe
      if (data.imageOrder && data.imageOrder.length > 0) {
        const jsonImageOrder = JSON.stringify(data.imageOrder);
        formData.append('imageOrder', jsonImageOrder);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cars/${selectedAuto.id}?tenant=${TENANT}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.message || 'Error al actualizar el auto');
      }

      // En lugar de actualizar parcialmente, vamos a obtener el auto completo actualizado
      // para asegurarnos de tener las imágenes ordenadas correctamente
      try {
        const getResponse = await fetch(
          `${API_BASE_URL}/api/cars/${selectedAuto.id}?tenant=${TENANT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (getResponse.ok) {
          const autoCompleto = await getResponse.json();

          // Ordenar las imágenes según el orden devuelto por el API
          const imagenesOrdenadas = autoCompleto.images
            ? [...autoCompleto.images].sort((a, b) => a.order - b.order)
            : [];

          // Crear el objeto actualizado con las imágenes ordenadas
          const autoActualizado: Auto = {
            id: selectedAuto.id,
            marca: autoCompleto.brand,
            marcaId: autoCompleto.brand.toLowerCase(),
            modelo: autoCompleto.model,
            año: autoCompleto.year,
            precio: parseFloat(autoCompleto.price),
            currency: autoCompleto.currency || 'USD',
            active: autoCompleto.active,
            imagenes: imagenesOrdenadas.map((img) => img.thumbnailUrl),
            descripcion: autoCompleto.description,
            kilometraje: autoCompleto.mileage,
            combustible: autoCompleto.fuel,
            transmision: autoCompleto.transmission,
            puertas: autoCompleto.doors,
            categoria: autoCompleto.Category?.name || 'Sin categoría',
            categoriaId: autoCompleto.categoryId,
            destacado: autoCompleto.featured,
            favorito: autoCompleto.favorite,
            position: autoCompleto.position,
          };

          // Actualizar en todosLosAutos
          setTodosLosAutos((prev) =>
            prev.map((auto) =>
              auto.id === selectedAuto.id ? autoActualizado : auto
            )
          );

          // Actualizar en autos (vista actual)
          setAutos((prev) =>
            prev.map((auto) =>
              auto.id === selectedAuto.id ? autoActualizado : auto
            )
          );

          // Actualizar también en resultados de búsqueda si está activa una búsqueda
          if (buscando) {
            setResultadosBusqueda((prev) =>
              prev.map((auto) =>
                auto.id === selectedAuto.id ? autoActualizado : auto
              )
            );
          }
        } else {
          console.error('Error al obtener el auto actualizado');
        }
      } catch (error) {
        console.error('Error al obtener el auto actualizado:', error);
      }

      // Cerrar el modal
      setIsModalOpen(false);
      setSelectedAuto(undefined);

      // Mostrar notificación de éxito
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Auto actualizado exitosamente',
      });
    } catch (error) {
      console.error('Error al actualizar el auto:', error);

      // Mostrar notificación de error
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Error al actualizar el auto',
      });
    }
  };

  const handleSellClick = (auto: Auto) => {
    setAutoToSell(auto);
    setSellModalOpen(true);
  };

  const handleSellConfirm = async () => {
    if (!autoToSell) return;

    try {
      const token = Cookies.get('admin-auth');
      const response = await fetch(
        `${API_BASE_URL}/api/sells/${autoToSell.id}/sell?tenant=${TENANT}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sellDate: new Date().toISOString(),
          }),
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Error al marcar el auto como vendido'
        );
      }

      // Actualizar la lista actual
      setAutos((prev) => prev.filter((auto) => auto.id !== autoToSell.id));

      // Actualizar la lista completa de autos cargados
      setTodosLosAutos((prev) =>
        prev.filter((auto) => auto.id !== autoToSell.id)
      );

      // Actualizar el contador total
      setTotalAutos((prev) => prev - 1);

      // Si la página actual está ahora vacía y no es la primera página,
      // mostrar la página anterior
      if (autos.length === 1 && currentPage > 1) {
        const nuevaPagina = currentPage - 1;
        setCurrentPage(nuevaPagina);

        // Mostrar los autos de la página anterior desde los que ya tenemos cargados
        const indiceInicial = (nuevaPagina - 1) * 10;
        const nuevoAutos = todosLosAutos
          .filter((auto) => auto.id !== autoToSell.id)
          .slice(indiceInicial, indiceInicial + 10);

        setAutos(nuevoAutos);
      }

      // Mostrar notificación de éxito
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Auto marcado como vendido exitosamente',
      });

      // Cerrar el modal de venta
      setSellModalOpen(false);
      setAutoToSell(null);
    } catch (error) {
      console.error('Error al marcar el auto como vendido:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Error al marcar el auto como vendido',
      });

      // Cerrar el modal incluso si hay error
      setSellModalOpen(false);
      setAutoToSell(null);
    }
  };

  // Crear una referencia para el elemento observado
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null && currentPage < totalPages && !loadingMore) {
        observer.current?.observe(node);
      }
    },
    [currentPage, totalPages, loadingMore]
  );

  // Función para manejar el drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setTodosLosAutos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Si no encontramos los índices, no hacemos nada
        if (oldIndex === -1 || newIndex === -1) return items;

        // Crear la nueva lista reordenada
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Marcar que el orden ha sido modificado
        setOrdenModificado(true);

        // Cuando se modifica el orden, cargar todos los elementos en la vista
        // para evitar problemas con el scrolling infinito
        setAutos(newItems);

        return newItems;
      });
    }
  };

  // Función para guardar el nuevo orden
  const guardarOrden = async () => {
    setGuardandoOrden(true);
    try {
      const token = Cookies.get('admin-auth');

      // Calcular nuevas posiciones utilizando el arreglo todosLosAutos actual
      const updates = todosLosAutos.map((auto, index) => ({
        id: auto.id,
        position: todosLosAutos.length - index, // Orden descendente (mayor valor = más arriba)
      }));

      const response = await fetch(
        `${API_BASE_URL}/api/cars/positions?tenant=${TENANT}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updates }),
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudo actualizar el orden`
        );
      }

      setNotification({
        isOpen: true,
        type: 'success',
        message: 'El orden de los vehículos ha sido actualizado correctamente.',
      });

      setOrdenModificado(false);

      // Recargar todos los autos para asegurar que tenemos el orden correcto
      fetchTodosLosAutos(1, false);
    } catch (error) {
      console.error('Error al guardar el orden:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Error al actualizar el orden de los vehículos',
      });
    } finally {
      setGuardandoOrden(false);
    }
  };

  // Función para obtener los autos destacados
  const fetchAutosDestacados = async () => {
    try {
      const token = Cookies.get('admin-auth');
      const response = await fetch(
        `${API_BASE_URL}/api/cars/featured?tenant=${TENANT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar los autos destacados');
      }

      const data: ApiCar[] = await response.json();
      const autosFormateados: Auto[] = data.map((car) => ({
        id: car.id,
        marca: car.brand,
        marcaId: car.brand.toLowerCase(),
        modelo: car.model,
        año: car.year,
        precio: parseFloat(car.price),
        currency: car.currency || 'USD',
        active: car.active,
        imagenes: car.images.map((img) => img.thumbnailUrl),
        descripcion: car.description,
        kilometraje: car.mileage,
        combustible: car.fuel,
        transmision: car.transmission,
        puertas: car.doors,
        categoria: car.Category?.name || 'Sin categoría',
        categoriaId: car.categoryId,
        destacado: car.featured,
        favorito: car.favorite,
        position: car.position,
      }));

      setAutosDestacados(autosFormateados);
    } catch (error) {
      console.error('Error al cargar los autos destacados:', error);
    }
  };

  // Función para obtener los autos favoritos
  const fetchAutosFavoritos = async () => {
    try {
      const token = Cookies.get('admin-auth');
      const response = await fetch(
        `${API_BASE_URL}/api/cars/favorites?tenant=${TENANT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar los autos favoritos');
      }

      const data: ApiCar[] = await response.json();
      const autosFormateados: Auto[] = data.map((car) => ({
        id: car.id,
        marca: car.brand,
        marcaId: car.brand.toLowerCase(),
        modelo: car.model,
        año: car.year,
        precio: parseFloat(car.price),
        currency: car.currency || 'USD',
        active: car.active,
        imagenes: car.images.map((img) => img.thumbnailUrl),
        descripcion: car.description,
        kilometraje: car.mileage,
        combustible: car.fuel,
        transmision: car.transmission,
        puertas: car.doors,
        categoria: car.Category?.name || 'Sin categoría',
        categoriaId: car.categoryId,
        destacado: car.featured,
        favorito: car.favorite,
        position: car.position,
      }));

      setAutosFavoritos(autosFormateados);
    } catch (error) {
      console.error('Error al cargar los autos favoritos:', error);
    }
  };

  // Efecto para cargar los autos destacados y favoritos
  useEffect(() => {
    fetchAutosDestacados();
    fetchAutosFavoritos();
  }, []);

  // Función para manejar la búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
  };

  // Manejar la búsqueda cuando el usuario presiona Enter o hace clic en buscar
  const executeSearch = () => {
    if (busqueda.trim() === '') {
      limpiarBusqueda();
      return;
    }
    // Reiniciar a la página 1 y realizar la búsqueda
    setCurrentPage(1);
    fetchBusqueda(1, false, busqueda);
  };

  // Limpiar la búsqueda
  const limpiarBusqueda = () => {
    setBusqueda('');
    setBuscando(false);
    setResultadosBusqueda([]);
    // Cargar todos los autos nuevamente
    fetchTodosLosAutos(1, false);
  };

  if (loading && autos.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary-admin'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl my-10'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div className='flex flex-col'>
          <h1 className='text-2xl font-semibold text-color-text'>
            Administrar Vehículos{' '}
            {loading && (
              <RefreshCw className='inline ml-2 h-5 w-5 animate-spin' />
            )}
          </h1>
          <p className='text-gray-500'>
            Total: <span className='font-medium'>{totalAutos}</span> vehículos
            {buscando && (
              <span className='ml-2'>({totalResultados} encontrados)</span>
            )}
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
          <div className='hidden items-center gap-2 text-base'>
            <div className='bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full'>
              <span className='font-semibold'>{autosDestacados.length}/10</span>{' '}
              ingresos
            </div>
            <div className='bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full'>
              <span className='font-semibold'>{autosFavoritos.length}/10</span>{' '}
              destacados
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedAuto(undefined);
              setIsModalOpen(true);
            }}
            className='flex items-center gap-2 bg-color-primary-admin hover:bg-color-primary-admin/90 text-white px-4 py-2 rounded-md transition-colors'
          >
            <Plus size={18} />
            Agregar Auto
          </button>
        </div>
      </div>

      {/* Buscador de autos */}
      <div className='mb-6 relative'>
        <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white'>
          <div className='pl-4 py-2.5 text-gray-400'>
            <Search size={18} />
          </div>
          <input
            type='text'
            value={busqueda}
            onChange={handleSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch();
              }
            }}
            placeholder='Buscar modelo'
            className='flex-grow px-3 py-2.5 focus:outline-none text-color-text'
          />
          {busqueda && (
            <button
              onClick={limpiarBusqueda}
              className='px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-full flex items-center transition-colors'
              aria-label='Limpiar búsqueda'
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={executeSearch}
            className='px-5 py-2.5 bg-color-primary-admin text-white hover:bg-color-primary-admin/90 transition-colors h-full font-medium'
          >
            Buscar
          </button>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'>
          {error}
        </div>
      )}

      {(buscando
        ? resultadosBusqueda.length === 0
        : todosLosAutos.length === 0) && !loading ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>
            {buscando
              ? `No se encontraron autos que coincidan con "${busqueda}".`
              : 'No hay autos disponibles. Agrega uno nuevo para comenzar.'}
          </p>
          {buscando && (
            <button
              onClick={limpiarBusqueda}
              className='mt-3 text-color-primary-admin hover:underline'
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <>
          {buscando ? (
            // Si estamos buscando, no usar DndContext para evitar arrastre
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='space-y-4'
            >
              {resultadosBusqueda.map((auto) => (
                <div
                  key={auto.id}
                  className='relative bg-white rounded-lg overflow-hidden [box-shadow:0_0_10px_rgba(0,0,0,0.08)] cursor-pointer hover:[box-shadow:0_0_10px_rgba(0,0,0,0.2)]'
                  onClick={() => {
                    setSelectedAuto(auto);
                    setIsModalOpen(true);
                  }}
                >
                  <div className='p-4 sm:p-6'>
                    <div className='flex flex-col sm:flex-row gap-4'>
                      <div className='relative w-full sm:w-[155px] aspect-[4/3] md:w-[200px] flex-shrink-0'>
                        {auto.imagenes && auto.imagenes.length > 0 ? (
                          <Image
                            priority
                            src={auto.imagenes[0]}
                            alt={`${auto.modelo}`}
                            width={400}
                            height={320}
                            className='object-cover rounded-lg'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
                            <span className='text-gray-400'>Sin imagen</span>
                          </div>
                        )}
                        {!auto.active && (
                          <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                            <span className='text-white font-semibold'>
                              Pausado
                            </span>
                          </div>
                        )}
                      </div>

                      <div className='flex-grow'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <h3 className='text-lg lg:text-xl font-semibold text-gray-900'>
                              {auto.marca} {auto.modelo}
                            </h3>
                            {auto.precio && auto.precio > 0 ? (
                              <p className='text-xl lg:text-2xl font-bold text-color-primary-admin mt-1'>
                                {auto.currency === 'ARS' ? '$' : 'US$'}
                                {auto.precio.toLocaleString(
                                  auto.currency === 'ARS' ? 'es-AR' : 'en-US'
                                )}
                              </p>
                            ) : (
                              ''
                            )}
                            <p className='text-base lg:text-base text-gray-500 mt-2'>
                              {auto.año} • {auto.combustible} •{' '}
                              {auto.kilometraje.toLocaleString('es-AR')} km
                            </p>
                          </div>
                          <div className='flex gap-2'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleEstado(auto.id);
                              }}
                              className={`px-3 py-1 rounded-full text-base font-medium transition-colors ${
                                auto.active
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              }`}
                            >
                              {auto.active ? 'Activo' : 'Pausado'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (auto.active) {
                                  handleToggleDestacado(auto.id);
                                }
                              }}
                              className={`p-2 rounded-full transition-all hidden ${
                                auto.destacado
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              } ${
                                !auto.active
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              title={
                                !auto.active
                                  ? 'Auto pausado, no puede modificarse'
                                  : auto.destacado
                                  ? 'Quitar de Ingreso'
                                  : 'Marcar como Ingreso'
                              }
                            >
                              {auto.destacado ? (
                                <Zap size={20} fill='currentColor' />
                              ) : (
                                <Zap size={20} />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (auto.active) {
                                  handleToggleFavorito(auto.id);
                                }
                              }}
                              className={`p-2 rounded-full transition-all hidden ${
                                auto.favorito
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shadow-sm'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              } ${
                                !auto.active
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              title={
                                !auto.active
                                  ? 'Auto pausado, no puede modificarse'
                                  : auto.favorito
                                  ? 'Quitar de favoritos'
                                  : 'Marcar como favorito'
                              }
                            >
                              {auto.favorito ? (
                                <Star size={20} fill='currentColor' />
                              ) : (
                                <Star size={20} />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAuto(auto);
                                setIsModalOpen(true);
                              }}
                              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                            >
                              <Edit
                                size={20}
                                className='text-color-primary-admin'
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(auto);
                              }}
                              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                            >
                              <Trash size={20} className='text-red-500' />
                            </button>
                          </div>
                        </div>

                        {/* Botón de vender con posición absoluta */}
                        <div className='mt-4 flex justify-end'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSellClick(auto);
                            }}
                            className='bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors'
                          >
                            Vender
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {currentPage < paginasBusqueda && !loadingMore && (
                <div ref={observerRef} className='h-10'></div>
              )}
              {loadingMore && (
                <div className='py-6 flex justify-center items-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color-primary-admin'></div>
                  <span className='ml-3 text-gray-600'>
                    Cargando más vehículos...
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            // Si no estamos buscando, usar DndContext para permitir arrastre
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todosLosAutos.map((auto) => auto.id)}
                strategy={verticalListSortingStrategy}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className='space-y-4'
                >
                  {/* Mostrar siempre todos los autos en el orden actual cuando no se está buscando */}
                  {todosLosAutos.map((auto, idx) => (
                    <SortableAutoCard
                      key={auto.id}
                      auto={auto}
                      index={idx}
                      onEdit={() => {
                        setSelectedAuto(auto);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteClick}
                      onSell={handleSellClick}
                      onToggleActive={handleToggleEstado}
                      onToggleDestacado={handleToggleDestacado}
                      onToggleFavorito={handleToggleFavorito}
                      isDragDisabled={guardandoOrden}
                    />
                  ))}
                  {currentPage < totalPages &&
                    !loadingMore &&
                    !ordenModificado && (
                      <div ref={observerRef} className='h-10'></div>
                    )}
                  {loadingMore && (
                    <div className='py-6 flex justify-center items-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color-primary-admin'></div>
                      <span className='ml-3 text-gray-600'>
                        Cargando más vehículos...
                      </span>
                    </div>
                  )}
                </motion.div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      <AutoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAuto(undefined);
        }}
        onSubmit={selectedAuto ? handleEditAuto : handleCreateAuto}
        initialData={selectedAuto}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAutoToDelete(null);
        }}
        onConfirm={handleDelete}
        title='Eliminar Auto'
        message={`¿Estás seguro de que deseas eliminar el ${autoToDelete?.modelo}? Esta acción no se puede deshacer.`}
      />

      <SellConfirmModal
        isOpen={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false);
          setAutoToSell(null);
        }}
        onConfirm={handleSellConfirm}
        autoName={`${autoToSell?.modelo}`}
      />

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type={notification.type}
        message={notification.message}
      />

      {/* Modal de límite alcanzado */}
      <LimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        type={limitType}
      />
    </div>
  );
}
