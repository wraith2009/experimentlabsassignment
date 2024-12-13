type ContainerProp = {
  children: JSX.Element;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProp) {
  return (
    <div className={`max-w-[1136px] m-auto ${className} md:max-lg:px-4`}>
      {children}
    </div>
  );
}
