// 'use client';

// import SearchIcon from '@/components/icons/SearchIcon';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Suspense, useEffect, useState } from 'react';
// import { API_BASE_URL, company, TENANT } from '@/app/constants/constants';
// import ArrowIcon from '@/components/icons/ArrowIcon';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from '@/components/ui/select';
// import CloseIcon from '@/components/icons/CloseIcon';
// import Footer from '@/components/Footer';
// import Header from '@/components/Header';

// interface Imagen {
//   thumbnailUrl: string;
// }

// interface Categoria {
//   id: string;
//   name: string;
// }

// interface ApiCar {
//   id: string;
//   brand: string;
//   model: string;
//   mlTitle: string;
//   year: number;
//   color: string;
//   price: number;
//   currency: 'USD' | 'ARS';
//   description: string;
//   categoryId: string;
//   mileage: number;
//   transmission: string;
//   fuel: string;
//   doors: number;
//   position: number;
//   featured: boolean;
//   favorite: boolean;
//   active: boolean;
//   createdAt: string;
//   updatedAt: string;
//   Category: Categoria;
//   images: Imagen[];
// }

// interface Category {
//   id: string;
//   name: string;
// }

// const ITEMS_PER_PAGE = 12;

// const CatalogoPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [searchValue, setSearchValue] = useState(
//     searchParams.get('search') || ''
//   );
//   const marcaFilter = searchParams.get('marca') || '';
//   const categoriaFilter = searchParams.get('categoria') || '';
//   const currentPage = Number(searchParams.get('page')) || 1;
//   const searchFilter = searchParams.get('search') || '';

//   const [cars, setCars] = useState<ApiCar[]>([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [todasLasMarcas, setTodasLasMarcas] = useState<string[]>([]);
//   const [categorias, setCategorias] = useState<Category[]>([]);

//   // Función para obtener todas las marcas disponibles
//   const fetchMarcas = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/cars/brands?tenant=${TENANT}`
//       );
//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`);
//       }
//       const data = await response.json();
//       const marcas = data.map((brand: string) => brand).sort();
//       setTodasLasMarcas(marcas);
//     } catch (error) {
//       console.error('Error al cargar las marcas:', error);
//     }
//   };

//   // Función para obtener las categorías
//   const fetchCategories = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/categories?tenant=${TENANT}`
//       );
//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`);
//       }
//       const data = await response.json();
//       const categoriasProcesadas = data.map(
//         (category: { id?: string; name: string }) => ({
//           id: category.id || category.name.toLowerCase(),
//           name:
//             category.name.charAt(0).toUpperCase() +
//             category.name.slice(1).toLowerCase(),
//         })
//       );
//       setCategorias(categoriasProcesadas);
//     } catch (error) {
//       console.error('Error al cargar las categorías:', error);
//     }
//   };

//   // Función para obtener los autos con filtros
//   const fetchCars = async (
//     page: number,
//     filters?: { search?: string; marca?: string; categoria?: string }
//   ) => {
//     setLoading(true);
//     try {
//       // Construir query parameters
//       const params = new URLSearchParams();
//       params.append('tenant', TENANT);
//       params.append('page', page.toString());
//       params.append('limit', ITEMS_PER_PAGE.toString());

//       // Agregar filtros si existen
//       if (filters?.search) {
//         params.append('search', filters.search);
//       }
//       if (filters?.marca) {
//         params.append('brand', filters.marca);
//       }
//       if (filters?.categoria) {
//         params.append('category', filters.categoria);
//       }

//       const response = await fetch(
//         `${API_BASE_URL}/api/cars?${params.toString()}`
//       );
//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`);
//       }
//       const data = await response.json();

//       setCars(data.cars || []);
//       setTotalPages(data.totalPages || 1);
//     } catch (error) {
//       console.error('Error al cargar los vehículos:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Efecto para cargar las marcas y categorías al montar el componente
//   useEffect(() => {
//     fetchMarcas();
//     fetchCategories();
//   }, []);

//   // Efecto para cargar los autos cuando cambian los filtros
//   useEffect(() => {
//     fetchCars(currentPage, {
//       search: searchFilter,
//       marca: marcaFilter,
//       categoria: categoriaFilter,
//     });
//   }, [currentPage, searchFilter, marcaFilter, categoriaFilter]);

//   // Restaurar la página guardada al recargar
//   useEffect(() => {
//     if (!searchParams.has('page')) {
//       const savedPage = sessionStorage.getItem('catalogCurrentPage');
//       if (savedPage) {
//         const params = new URLSearchParams(window.location.search);
//         params.set('page', savedPage);
//         router.replace(`/catalogo?${params.toString()}`, { scroll: false });
//         sessionStorage.removeItem('catalogCurrentPage');
//       }
//     }
//   }, [router, searchParams]);

//   // Mantener la posición del scroll solo en recargas
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       sessionStorage.setItem(
//         'catalogScrollPosition',
//         window.scrollY.toString()
//       );
//       sessionStorage.setItem('catalogCurrentPage', currentPage.toString());
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
//     if (savedScrollPosition) {
//       window.scrollTo(0, parseInt(savedScrollPosition));
//       sessionStorage.removeItem('catalogScrollPosition');
//     }

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, [currentPage]);

//   // Función para actualizar filtros
//   const updateFilters = (key: string, value: string) => {
//     const params = new URLSearchParams(window.location.search);

//     if (value) {
//       params.set(key, value);
//     } else {
//       params.delete(key);
//     }

//     // Resetear a la página 1 cuando se cambian los filtros (excepto para la paginación)
//     if (key !== 'page') {
//       params.delete('page');
//     }

//     router.push(`/catalogo?${params.toString()}`);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Función para cambiar de página
//   const handlePageChange = (page: number) => {
//     updateFilters('page', page.toString());
//   };

//   // Manejar la búsqueda
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchValue(e.target.value);
//   };

//   const executeSearch = (value: string) => {
//     updateFilters('search', value);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     executeSearch(searchValue);
//   };

//   const filteredProducts = cars.filter((car) => {
//     // Validar que mlTitle no sea null o undefined
//     if (!car.mlTitle) return false;

//     const normalizedProductName = car.mlTitle
//       .normalize('NFD')
//       .replace(/[\u0300-\u036f]/g, '');

//     const matchesSearch = normalizedProductName
//       .toLowerCase()
//       .includes(searchFilter.toLowerCase());

//     const matchesMarca = !marcaFilter || car.brand === marcaFilter;
//     const matchesCategoria =
//       !categoriaFilter || car.Category.name === categoriaFilter;

//     return matchesSearch && matchesMarca && matchesCategoria;
//   });

//   return (
//     <div className='relative'>
//       <section className='flex flex-col items-center w-full mb-16 md:mb-20'>
//         {/* Sección de filtros modernizada */}
//         <div className='w-full flex justify-center mt-8 md:mt-10'>
//           <div className='max-w-md sm:max-w-2xl lg:max-w-7xl w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-0'>
//             {/* Contenedor principal con fondo oscuro y sombra */}
//             <div className='bg-color-bg-secondary border border-neutral-600 rounded-lg shadow-[0_8px_30px_-15px_rgba(0,0,0,0.7)] p-5'>
//               {/* Título de la sección de filtros */}
//               <div className='mb-5 flex items-center justify-between'>
//                 <div className='flex items-center'>
//                   <div
//                     className={`${
//                       company.dark
//                         ? 'bg-color-primary-light'
//                         : 'bg-color-primary'
//                     } w-1 h-5 rounded mr-3`}
//                   ></div>
//                   <h4 className='text-white font-medium'>Filtrar vehículos</h4>
//                 </div>
//               </div>

//               {/* Vista móvil - Buscador y filtros en acordeón */}
//               <div className='sm:hidden space-y-4'>
//                 {/* Buscador móvil */}
//                 <form onSubmit={handleSubmit} className='relative'>
//                   <input
//                     type='text'
//                     placeholder='Buscar vehículo...'
//                     value={searchValue}
//                     onChange={handleSearch}
//                     className='w-full pl-10 pr-4 py-3 border border-neutral-700 rounded-md bg-neutral-800/80 outline-none text-white placeholder-white/40 focus:border-color-primary focus:ring-1 focus:ring-color-primary/40 transition-all'
//                   />
//                   <div className='absolute left-0 top-0 h-full px-3 flex items-center text-white/50'>
//                     <SearchIcon className='w-5 h-5' />
//                   </div>
//                   <button
//                     type='submit'
//                     className={`${
//                       company.dark
//                         ? 'hover:text-color-primary-light'
//                         : 'hover:text-color-primary-dark'
//                     } absolute right-0 top-0 h-full px-4 text-white/50 transition-colors`}
//                   >
//                     Buscar
//                   </button>
//                 </form>

//                 {/* Filtros en línea para móvil */}
//                 <div className='flex gap-2'>
//                   <Select
//                     value={marcaFilter || 'all'}
//                     onValueChange={(value) => {
//                       updateFilters('marca', value === 'all' ? '' : value);
//                     }}
//                   >
//                     <SelectTrigger className='h-10 flex-1 px-3 py-2 border border-neutral-700 rounded-md bg-neutral-800/80 text-white text-sm outline-none focus:border-color-primary focus:ring-1 focus:ring-color-primary/40 transition-all appearance-none'>
//                       <SelectValue placeholder='Marcas' />
//                     </SelectTrigger>
//                     <SelectContent className='bg-neutral-800 border border-neutral-700 text-white rounded-lg shadow-lg max-h-60 overflow-y-auto'>
//                       <SelectItem
//                         value='all'
//                         className='text-neutral-400 hover:text-white hover:bg-neutral-700'
//                       >
//                         Marcas
//                       </SelectItem>
//                       {todasLasMarcas.map((marca) => (
//                         <SelectItem
//                           key={marca}
//                           value={marca}
//                           className='hover:text-color-primary hover:bg-neutral-700'
//                         >
//                           {marca}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>

//                   <Select
//                     value={categoriaFilter || 'all'}
//                     onValueChange={(value) => {
//                       updateFilters('categoria', value === 'all' ? '' : value);
//                     }}
//                   >
//                     <SelectTrigger className='h-10 flex-1 px-3 py-2 border border-neutral-700 rounded-md bg-neutral-800/80 text-white text-sm outline-none focus:border-color-primary focus:ring-1 focus:ring-color-primary/40 transition-all appearance-none'>
//                       <SelectValue placeholder='Categorías' />
//                     </SelectTrigger>
//                     <SelectContent className='bg-neutral-800 border border-neutral-700 text-white rounded-lg shadow-lg max-h-60 overflow-y-auto'>
//                       <SelectItem
//                         value='all'
//                         className='text-neutral-400 hover:text-white hover:bg-neutral-700'
//                       >
//                         Categorías
//                       </SelectItem>
//                       {categorias.map((categoria) => (
//                         <SelectItem
//                           key={categoria.id}
//                           value={categoria.name.toLowerCase()}
//                           className='hover:text-color-primary hover:bg-neutral-700'
//                         >
//                           {categoria.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Vista desktop - Filtros completos */}
//               <div className='hidden sm:flex sm:flex-row gap-4 sm:gap-6'>
//                 {/* Buscador mejorado */}
//                 <div className='relative flex-grow'>
//                   <label className='block text-xs text-white/70 uppercase tracking-wider mb-1.5'>
//                     Buscar por nombre
//                   </label>
//                   <form onSubmit={handleSubmit} className='relative'>
//                     <input
//                       type='text'
//                       placeholder='Ej: Mercedes Benz, Ford...'
//                       value={searchValue}
//                       onChange={handleSearch}
//                       className='w-full px-4 py-3 border border-neutral-700 rounded-md bg-neutral-800/80 outline-none text-white placeholder-white/40 focus:border-color-primary focus:ring-1 focus:ring-color-primary/40 transition-all'
//                     />
//                     <button
//                       type='submit'
//                       className={`${
//                         company.dark
//                           ? 'hover:text-color-primary-light'
//                           : 'hover:text-color-primary'
//                       } absolute right-0 top-0 h-full px-4 text-white/50 transition-colors`}
//                     >
//                       <SearchIcon className='w-5 h-5' />
//                     </button>
//                   </form>
//                 </div>

//                 {/* Filtros en columna en móvil, fila en escritorio */}
//                 <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
//                   {/* Filtro de Marca */}
//                   <div>
//                     <label className='block text-xs text-white/70 uppercase tracking-wider mb-1.5'>
//                       Marca
//                     </label>
//                     <div className='relative'>
//                       <Select
//                         value={marcaFilter || 'all'}
//                         onValueChange={(value) => {
//                           updateFilters('marca', value === 'all' ? '' : value);
//                         }}
//                       >
//                         <SelectTrigger className='h-full w-full sm:w-44 px-4 py-3 pr-10 border border-neutral-700 rounded-md bg-neutral-800/80 text-white outline-none focus:border-color-primary focus:ring-1 focus:ring-color-primary/40 transition-all appearance-none'>
//                           <SelectValue placeholder='Todas las marcas' />
//                         </SelectTrigger>
//                         <SelectContent className='bg-neutral-800 border border-neutral-700 text-white rounded-lg shadow-lg'>
//                           <SelectItem
//                             value='all'
//                             className='text-neutral-400 hover:text-white hover:bg-neutral-700'
//                           >
//                             Todas las marcas
//                           </SelectItem>
//                           {todasLasMarcas.map((marca) => (
//                             <SelectItem
//                               key={marca}
//                               value={marca}
//                               className={`${
//                                 company.dark
//                                   ? 'hover:text-color-primary-light'
//                                   : 'hover:text-color-primary'
//                               } hover:bg-neutral-700`}
//                             >
//                               {marca}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   {/* Filtro de Categoría */}
//                   <div>
//                     <label className='block text-xs text-white/70 uppercase tracking-wider mb-1.5'>
//                       Categoría
//                     </label>
//                     <div className='relative'>
//                       <Select
//                         value={categoriaFilter || 'all'}
//                         onValueChange={(value) => {
//                           updateFilters(
//                             'categoria',
//                             value === 'all' ? '' : value
//                           );
//                         }}
//                       >
//                         <SelectTrigger className='h-full w-full sm:w-44 px-4 py-3 pr-10 border border-neutral-700 rounded-md bg-neutral-800/80 text-white outline-none focus:border-color-primary focus:ring-1 focus:ring-color-primary/40 transition-all appearance-none'>
//                           <SelectValue placeholder='Todas las categorías' />
//                         </SelectTrigger>
//                         <SelectContent className='bg-neutral-800 border border-neutral-700 text-white rounded-lg shadow-lg'>
//                           <SelectItem
//                             value='all'
//                             className='text-neutral-400 hover:text-white hover:bg-neutral-700'
//                           >
//                             Todas las categorías
//                           </SelectItem>
//                           {categorias.map((categoria) => (
//                             <SelectItem
//                               key={categoria.id}
//                               value={categoria.name.toLowerCase()}
//                               className={`${
//                                 company.dark
//                                   ? 'hover:text-color-primary-light'
//                                   : 'hover:text-color-primary'
//                               } hover:bg-neutral-700`}
//                             >
//                               {categoria.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Filtros activos */}
//               {(searchFilter || marcaFilter || categoriaFilter) && (
//                 <div className='mt-4 flex flex-wrap gap-2'>
//                   {searchFilter && (
//                     <div className='flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-800/80 border border-neutral-700 text-white'>
//                       <span>Búsqueda: {searchFilter}</span>
//                       <button
//                         onClick={() => updateFilters('search', '')}
//                         className='text-neutral-400 hover:text-white transition-colors'
//                       >
//                         <CloseIcon className='w-4 h-4 stroke-[2]' />
//                       </button>
//                     </div>
//                   )}
//                   {marcaFilter && (
//                     <div className='flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-800/80 border border-neutral-700 text-white'>
//                       <span>Marca: {marcaFilter}</span>
//                       <button
//                         onClick={() => updateFilters('marca', '')}
//                         className='text-neutral-400 hover:text-white transition-colors'
//                       >
//                         <CloseIcon className='w-4 h-4 stroke-[2]' />
//                       </button>
//                     </div>
//                   )}
//                   {categoriaFilter && (
//                     <div className='flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-800/80 border border-neutral-700 text-white'>
//                       <span>Categoría: {categoriaFilter}</span>
//                       <button
//                         onClick={() => updateFilters('categoria', '')}
//                         className='text-neutral-400 hover:text-white transition-colors'
//                       >
//                         <CloseIcon className='w-4 h-4 stroke-[2]' />
//                       </button>
//                     </div>
//                   )}
//                   {(searchFilter || marcaFilter || categoriaFilter) && (
//                     <button
//                       onClick={() => {
//                         setSearchValue('');
//                         router.push('/catalogo');
//                       }}
//                       className='flex items-center gap-2 px-3 py-2 rounded-full bg-color-primary hover:bg-color-primary/80 text-black transition-colors'
//                     >
//                       <span>Limpiar filtros</span>
//                       <CloseIcon className='w-4 h-4 stroke-[2]' />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <>
//           {loading && filteredProducts.length === 0 ? (
//             <div className='flex justify-center items-center min-h-[600px]'>
//               <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-color-primary'></div>
//             </div>
//           ) : filteredProducts.length > 0 ? (
//             <>
//               <AnimatePresence mode='wait'>
//                 <motion.div
//                   key={`${currentPage}-${marcaFilter}-${categoriaFilter}-${searchFilter}`}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   transition={{ duration: 0.2 }}
//                   className='max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:w-full gap-y-10 lg:gap-y-16 gap-x-4 sm:gap-x-6 lg:gap-x-12 mt-10 min-h-[600px] place-content-start mx-4 sm:mx-6 md:mx-8 lg:mx-10'
//                 >
//                   {filteredProducts.map((car) => (
//                     <motion.div
//                       key={car.id}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.15 }}
//                       className='w-full'
//                     >
//                       <Link
//                         href={`/catalogo/${car.id}`}
//                         className='w-full relative overflow-hidden'
//                       >
//                         {/* Card container con borde que se ilumina */}
//                         <div className='relative overflow-hidden group-hover:border-color-primary transition-all duration-500 h-full'>
//                           {!car.active && (
//                             <div className='absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-20'>
//                               <span className='bg-red-500 text-white text-sm font-medium px-3 py-1.5 rounded'>
//                                 Pausado
//                               </span>
//                             </div>
//                           )}

//                           {/* Contenedor de la imagen */}
//                           <div className='relative overflow-hidden aspect-[4/3] rounded-xl group border border-neutral-600'>
//                             <motion.div
//                               initial={{ opacity: 0 }}
//                               animate={{ opacity: 1 }}
//                               transition={{ duration: 0.5, ease: 'easeOut' }}
//                               className='w-full h-full '
//                             >
//                               <Image
//                                 priority
//                                 width={600}
//                                 height={600}
//                                 className='object-cover w-full h-full transition-transform duration-700'
//                                 style={{
//                                   objectPosition: `center ${company.objectCover}`,
//                                 }}
//                                 src={
//                                   car.images &&
//                                   car.images.length > 0 &&
//                                   car.images[0]?.thumbnailUrl
//                                     ? car.images[0].thumbnailUrl
//                                     : '/assets/placeholder.webp'
//                                 }
//                                 alt={`${car.mlTitle || 'Vehículo'}`}
//                               />
//                             </motion.div>

//                             {/* Overlay con "Ver más" al hacer hover */}
//                             <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
//                             <div className='absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center'>
//                               <div className='flex flex-col items-center gap-2 text-white'>
//                                 <div className='w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30 [backdrop-filter:blur(4px)]'>
//                                   <svg
//                                     xmlns='http://www.w3.org/2000/svg'
//                                     className='w-6 h-6'
//                                     fill='none'
//                                     viewBox='0 0 24 24'
//                                     stroke='currentColor'
//                                   >
//                                     <path
//                                       strokeLinecap='round'
//                                       strokeLinejoin='round'
//                                       strokeWidth={2}
//                                       d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
//                                     />
//                                     <path
//                                       strokeLinecap='round'
//                                       strokeLinejoin='round'
//                                       strokeWidth={2}
//                                       d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
//                                     />
//                                   </svg>
//                                 </div>
//                                 <span className='text-sm font-medium tracking-wide'>
//                                   Ver más
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Información del vehículo */}
//                           <div className='relative group'>
//                             {/* Gradiente base */}
//                             <div className='absolute inset-0 bg-gradient-to-b from-transparent to-color-primary/20 rounded-lg'></div>
//                             {/* Gradiente hover */}
//                             <div className='absolute inset-0 bg-gradient-to-b from-transparent to-color-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out'></div>
//                             {/* Contenido */}
//                             <div className='relative z-10 p-4'>
//                               <h3
//                                 className={`${
//                                   company.dark
//                                     ? 'group-hover:text-color-primary'
//                                     : 'group-hover:text-color-primary'
//                                 } text-color-title-light text-lg md:text-xl font-semibold tracking-tight truncate md:mb-1 transition-colors duration-300`}
//                               >
//                                 {car.mlTitle || 'Sin título'}
//                               </h3>

//                               <div
//                                 className={`${
//                                   company.price ? '' : 'hidden'
//                                 } text-color-primary text-lg md:text-xl font-medium tracking-tight truncate md:mb-1 transition-colors duration-300`}
//                               >
//                                 {car.price && car.price > 0 ? (
//                                   <>
//                                     {car.currency === 'ARS' ? '$' : 'US$'}
//                                     {car.price.toLocaleString('es-ES')}
//                                   </>
//                                 ) : (
//                                   'Consultar precio'
//                                 )}
//                               </div>

//                               {/* Diseño minimalista con separadores tipo | */}
//                               <div className='flex flex-wrap items-center text-color-text-light font-medium'>
//                                 <span className=''>
//                                   {car.brand || 'Sin marca'}
//                                 </span>
//                                 <span
//                                   className={`${
//                                     company.dark
//                                       ? 'text-color-primary'
//                                       : 'text-color-primary'
//                                   } mx-2`}
//                                 >
//                                   |
//                                 </span>
//                                 <span>{car.year || 'Sin año'}</span>
//                               </div>

//                               {/* Precio o etiqueta destacada */}
//                               <div className='flex justify-between items-center text-color-text-light mt-0.5'>
//                                 {car.mileage === 0 ? (
//                                   <span className='text-sm font-semibold uppercase tracking-wider text-color-primary'>
//                                     Nuevo{' '}
//                                     <span className='text-color-primary'>
//                                       •
//                                     </span>{' '}
//                                     {car.mileage.toLocaleString('es-ES')} km
//                                   </span>
//                                 ) : (
//                                   <span className='text-sm text-color-text-light font-medium uppercase tracking-wider'>
//                                     Usado{' '}
//                                     <span className='text-color-primary'>
//                                       •
//                                     </span>{' '}
//                                     {(car.mileage || 0).toLocaleString('es-ES')}{' '}
//                                     km
//                                   </span>
//                                 )}
//                               </div>

//                               <div className='md:mt-1'>
//                                 <span
//                                   className={`${
//                                     company.dark
//                                       ? 'text-color-primary-light'
//                                       : 'text-color-primary-light'
//                                   } inline-flex items-center  transition-colors font-medium`}
//                                 >
//                                   Ver más
//                                   <span className='inline-block transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300 ml-1'>
//                                     →
//                                   </span>
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </Link>
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               </AnimatePresence>

//               {/* Paginación */}
//               {totalPages > 1 && (
//                 <div className='flex justify-center items-center gap-4 mt-8 mb-8'>
//                   <button
//                     onClick={() =>
//                       handlePageChange(Math.max(1, currentPage - 1))
//                     }
//                     disabled={currentPage === 1}
//                     className={`px-4 py-2 rounded relative overflow-hidden transition-all duration-300 ease-in-out ${
//                       currentPage === 1
//                         ? 'bg-color-primary/50 text-color-title-light cursor-not-allowed opacity-50'
//                         : 'bg-gradient-to-l from-neutral-800 to-neutral-700 text-color-title-light'
//                     }`}
//                   >
//                     {/* Overlay para hover */}
//                     {currentPage !== 1 && (
//                       <div className='absolute inset-0 bg-gradient-to-l from-neutral-600 to-neutral-500 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out'></div>
//                     )}
//                     <ArrowIcon
//                       className={`w-4 h-4 rotate-180 text-color-title-light transition-opacity duration-300 relative z-10 ${
//                         currentPage === 1 ? 'opacity-50' : 'opacity-100'
//                       }`}
//                     />
//                   </button>
//                   <span className='text-color-text-light'>
//                     Página {currentPage} de {totalPages}
//                   </span>
//                   <button
//                     onClick={() =>
//                       handlePageChange(Math.min(totalPages, currentPage + 1))
//                     }
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-2 rounded relative overflow-hidden transition-all duration-300 ease-in-out ${
//                       currentPage === totalPages
//                         ? 'bg-color-primary/50 text-color-title-light cursor-not-allowed opacity-50'
//                         : 'bg-gradient-to-l from-neutral-800 to-neutral-700 text-color-title-light'
//                     }`}
//                   >
//                     {/* Overlay para hover */}
//                     {currentPage !== totalPages && (
//                       <div className='absolute inset-0 bg-gradient-to-l from-neutral-600 to-neutral-500 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out'></div>
//                     )}
//                     <ArrowIcon
//                       className={`w-4 h-4 text-color-title-light transition-opacity duration-300 relative z-10 ${
//                         currentPage === totalPages
//                           ? 'opacity-50'
//                           : 'opacity-100'
//                       }`}
//                     />
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className='flex flex-col items-center min-h-[600px] my-8 md:my-16'>
//               <div className='col-span-2 md:col-span-3 lg:col-span-4 text-center text-lg text-color-text-light'>
//                 {searchFilter ? (
//                   <>
//                     No se encontraron resultados para la búsqueda{' '}
//                     <span className='text-color-title-light font-semibold'>
//                       &quot;{searchFilter}&quot;
//                     </span>
//                     {(marcaFilter || categoriaFilter) &&
//                       ' con los filtros seleccionados'}
//                     .
//                   </>
//                 ) : marcaFilter && categoriaFilter ? (
//                   <>
//                     No hay vehículos de la marca{' '}
//                     <span className='text-color-title-light font-semibold'>
//                       {marcaFilter}
//                     </span>{' '}
//                     en la categoría{' '}
//                     <span className='text-color-title-light font-semibold'>
//                       {categoriaFilter}
//                     </span>
//                     .
//                   </>
//                 ) : marcaFilter ? (
//                   <>
//                     No hay vehículos disponibles de la marca{' '}
//                     <span className='text-color-title-light font-semibold'>
//                       {marcaFilter}
//                     </span>
//                     .
//                   </>
//                 ) : categoriaFilter ? (
//                   <>
//                     No hay vehículos disponibles en la categoría{' '}
//                     <span className='text-color-title-light font-semibold'>
//                       {categoriaFilter}
//                     </span>
//                     .
//                   </>
//                 ) : (
//                   'No hay vehículos disponibles.'
//                 )}
//               </div>
//               <Link
//                 className='mt-5 border-2 border-transparent bg-color-primary hover:bg-color-primary/80 transition-colors px-4 md:px-6 py-3 text-color-title font-semibold rounded'
//                 href='/catalogo'
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setSearchValue('');
//                   updateFilters('search', '');
//                   updateFilters('marca', '');
//                   updateFilters('categoria', '');
//                   router.push('/catalogo');
//                   window.scrollTo({ top: 0, behavior: 'smooth' });
//                 }}
//               >
//                 Ver catálogo completo
//               </Link>
//             </div>
//           )}
//         </>
//       </section>
//     </div>
//   );
// };

// const CatalogoPageWithSuspense = () => {
//   return (
//     <div className='relative min-h-screen w-full'>
//       {/* Contenido principal */}
//       <Header />
//       <Suspense fallback={<div>Cargando...</div>}>
//         <CatalogoPage />
//       </Suspense>
//       <Footer />
//     </div>
//   );
// };

// export default CatalogoPageWithSuspense;
