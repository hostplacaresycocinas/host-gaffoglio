const FacebookIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1em'
      height='1em'
      viewBox='0 0 39 39'
      fill='currentColor'
      className={` ${className}`}
    >
      <path
        d='M19.5 0C8.73 0 0 8.77455 0 19.5995C0 29.4264 7.2015 37.5391 16.5855 38.9563V24.7934H11.76V19.6417H16.5855V16.2133C16.5855 10.537 19.3365 8.04635 24.03 8.04635C26.277 8.04635 27.4665 8.2137 28.029 8.29059V12.7879H24.828C22.836 12.7879 22.14 14.6861 22.14 16.8269V19.6432H27.9795L27.1875 24.7949H22.14V39C31.6575 37.7004 39 29.5214 39 19.5995C39 8.77455 30.27 0 19.5 0Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default FacebookIcon;
