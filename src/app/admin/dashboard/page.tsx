'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Search, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useRouter } from 'next/navigation';

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

// Los vehículos llegan directo desde el CRM vía API, por lo que el panel es
// solo de lectura: al tocar una card se abre la ficha pública del catálogo
// en una pestaña nueva para previsualizar cómo se ve.
function mapApiCar(car: ApiCar): Auto {
  return {
    id: car.id,
    marca: car.brand,
    marcaId: car.brand.toLowerCase(),
    modelo: car.model,
    año: car.year,
    precio: parseFloat(car.price),
    currency: car.currency || 'ARS',
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
  };
}

// Card de vehículo (solo lectura). Al hacer click abre la ficha pública.
function AutoCard({ auto, onOpen }: { auto: Auto; onOpen: (auto: Auto) => void }) {
  return (
    <div
      className='group relative bg-white rounded-lg overflow-hidden [box-shadow:0_0_10px_rgba(0,0,0,0.08)] cursor-pointer hover:[box-shadow:0_0_10px_rgba(0,0,0,0.2)] transition-shadow'
      onClick={() => onOpen(auto)}
    >
      <div className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row gap-2 md:gap-4'>
          <div className='relative w-full sm:w-[155px] sm:min-h-0 aspect-[4/3] md:w-[200px] flex-shrink-0 overflow-hidden rounded-lg self-start'>
            {auto.imagenes && auto.imagenes.length > 0 ? (
              <Image
                priority
                src={auto.imagenes[0]}
                alt={`${auto.modelo}`}
                fill
                sizes='(max-width: 640px) 100vw, 200px'
                className='object-cover rounded-lg'
              />
            ) : (
              <div className='absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg'>
                <span className='text-gray-400'>Sin imagen</span>
              </div>
            )}
            {!auto.active && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                <span className='text-white font-semibold'>Pausado</span>
              </div>
            )}
          </div>

          <div className='flex-grow min-w-0'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3'>
              <div className='min-w-0'>
                <h3 className='text-lg lg:text-xl font-semibold text-gray-900 line-clamp-2'>
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
                <p className='text-base text-gray-600 mt-0.5'>{auto.marca}</p>
                <p className='text-base lg:text-base text-gray-500 mt-2'>
                  {auto.año} • {auto.combustible} •{' '}
                  {auto.kilometraje.toLocaleString('es-AR')} km
                </p>
              </div>
              <div className='flex items-center gap-1.5 text-color-primary-admin text-sm font-medium shrink-0 opacity-0 sm:group-hover:opacity-100 transition-opacity'>
                <ExternalLink size={16} />
                Ver en el sitio
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAutos, setTotalAutos] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Auto[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [paginasBusqueda, setPaginasBusqueda] = useState(1);

  const handleUnauthorized = () => {
    Cookies.remove('admin-auth');
    router.push('/admin/login');
  };

  // Abrir la ficha pública del vehículo en una pestaña nueva
  const handleOpenAuto = (auto: Auto) => {
    window.open(`/catalogo/${auto.id}`, '_blank', 'noopener,noreferrer');
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
      const autosFormateados = data.cars.map(mapApiCar);

      if (append) {
        setAutos((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          return [...prev, ...autosFormateados.filter((a) => !ids.has(a.id))];
        });
      } else {
        setAutos(autosFormateados);
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
      const autosFormateados = data.cars.map(mapApiCar);

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

  // Crear una referencia para el elemento observado
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      const hasMore = buscando
        ? currentPage < paginasBusqueda
        : currentPage < totalPages;
      if (node !== null && hasMore && !loadingMore) {
        observer.current?.observe(node);
      }
    },
    [currentPage, totalPages, paginasBusqueda, buscando, loadingMore]
  );

  // Manejar el cambio del input de búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  // Ejecutar la búsqueda
  const executeSearch = () => {
    if (busqueda.trim() === '') {
      limpiarBusqueda();
      return;
    }
    setCurrentPage(1);
    fetchBusqueda(1, false, busqueda);
  };

  // Limpiar la búsqueda
  const limpiarBusqueda = () => {
    setBusqueda('');
    setBuscando(false);
    setResultadosBusqueda([]);
    fetchTodosLosAutos(1, false);
  };

  const listaActual = buscando ? resultadosBusqueda : autos;
  const hayMas = buscando
    ? currentPage < paginasBusqueda
    : currentPage < totalPages;

  if (loading && listaActual.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary-admin'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl my-6 md:my-8 lg:my-10'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div className='flex flex-col'>
          <h1 className='text-2xl font-semibold text-color-text'>
            Vehículos{' '}
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
            className='px-5 py-2.5 bg-color-primary-admin text-white hover:bg-color-primary-admin/80 transition-colors h-full font-medium'
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

      {listaActual.length === 0 && !loading ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>
            {buscando
              ? `No se encontraron autos que coincidan con "${busqueda}".`
              : 'No hay vehículos disponibles.'}
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='space-y-4'
        >
          {listaActual.map((auto) => (
            <AutoCard key={auto.id} auto={auto} onOpen={handleOpenAuto} />
          ))}
          {hayMas && !loadingMore && (
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
      )}
    </div>
  );
}
