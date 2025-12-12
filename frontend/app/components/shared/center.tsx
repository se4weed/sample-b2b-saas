import React from "react";

const Center = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`flex h-full w-full items-center justify-center flex-col ${className}`}>{children}</div>;
};

export default Center;
