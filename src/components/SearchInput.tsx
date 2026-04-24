'use client';

import { useState, useEffect } from 'react'; // Importar Suspense
import { useSearchParams } from 'next/navigation'; // Importar useSearchParams

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const searchParams = useSearchParams(); // Obtener los parámetros de búsqueda

  // Efecto para establecer el término de búsqueda desde los query params
  useEffect(() => {
    const term = searchParams.get('search') || ''; // Leer el término de búsqueda
    setSearchTerm(term); // Establecer el término de búsqueda en el estado
  }, [searchParams]);

  const handleSearch = () => {
    if (searchTerm) {
      // Redirigir a la página de productos con el término de búsqueda como query param
      window.location.href = `/productos?search=${encodeURIComponent(
        searchTerm
      )}`;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        // Agregar un formulario y manejar el evento onSubmit
        e.preventDefault(); // Prevenir el comportamiento por defecto
        handleSearch(); // Ejecutar búsqueda al enviar el formulario
      }}
    >
      <input
        type='text'
        placeholder='Buscar...'
        className='py-2 px-3 outline-none rounded-sm w-full'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el estado al escribir
      />
    </form>
  );
};

export default SearchInput;
