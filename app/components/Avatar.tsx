const sizes = {
  xs: "h-8 w-8",
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-32 w-32",
};

function Avatar({
  src,
  alt,
  size = "sm",
  border = false,
  ...rest
}: {
  src?: string;
  size?: "sm" | "md" | "lg" | "xs";
  border?: boolean;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <>
      {src ? (
        <img
          className={`inline-block ${
            sizes[size]
          } h- rounded-full object-cover ${
            border ? "border-4 dark:border-zinc-800 border-white shadow-md" : ""
          }`}
          src={src}
          alt={alt}
          {...rest}
        />
      ) : (
        <span
          className={`inline-block ${
            sizes[size]
          } overflow-hidden rounded-full bg-gray-100 ${
            border ? "border-4 dark:border-zinc-800 border-white shadow-md" : ""
          }`}
        >
          <svg
            className="h-full w-full text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
      )}
    </>
  );
}

export default Avatar;
