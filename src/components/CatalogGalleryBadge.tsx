'use client';

interface CatalogGalleryBadgeProps {
  current?: number;
  total: number;
}

const CatalogGalleryBadge = ({ current = 1, total }: CatalogGalleryBadgeProps) => {
  if (!total || total < 1) return null;

  return (
    <div
      role='status'
      aria-label={`Imagen ${current} de ${total}`}
      className='pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-sm'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='currentColor'
        className='h-3 w-3 shrink-0 text-white/80'
        aria-hidden='true'
      >
        <path
          fillRule='evenodd'
          d='M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.83.83a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z'
          clipRule='evenodd'
        />
      </svg>
      <span>
        {current} / {total}
      </span>
    </div>
  );
};

export default CatalogGalleryBadge;
