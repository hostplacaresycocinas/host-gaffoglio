const CheckIcon = ({ className }: { className: string }) => {
  return (
    <svg
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
      className={` ${className}`}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={3}
        d='M5 13l4 4L19 7'
      />
    </svg>
  );
};

export default CheckIcon;
