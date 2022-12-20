export interface InputErrorProps {
  id: string;
  children?: string | null;
}

export default function InputError({
  children,
  id,
}: InputErrorProps): JSX.Element | null {
  if (!children) {
    return null;
  }
  return (
    <p role="alert" id={id} className="text-red-500 text-sm">
      {children}
    </p>
  );
}
