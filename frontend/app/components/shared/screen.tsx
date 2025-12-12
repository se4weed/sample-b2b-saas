import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Screen = ({ children, className }: Props) => {
  return <div className={`w-screen h-screen ${className}`}>{children}</div>;
};

export default Screen;
