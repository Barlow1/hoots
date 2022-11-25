import { DOMAttributes } from "react";

function Avatar({
  src,
  alt,
  ...rest
}: { src?: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className="inline-block h-32 w-32 rounded-full object-cover"
      src={src}
      alt={alt}
      {...rest}
    />
  );
}

export default Avatar;
