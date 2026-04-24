const CopyIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      stroke='currentColor'
      fill='none'
      strokeWidth='2'
      viewBox='0 0 24 24'
      strokeLinecap='round'
      strokeLinejoin='round'
      height='1em'
      width='1em'
    >
      <rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect>
      <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
    </svg>
  );
};

export default CopyIcon;
