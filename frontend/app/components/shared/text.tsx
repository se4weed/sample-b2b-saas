import React from "react";

type TextType = "title" | "subTitle" | "blockTitle" | "standard" | "description";
type TextSize = "sm" | "md" | "lg";
type TextWeight = "normal" | "semibold" | "bold";

type Props = {
  children: React.ReactNode | string;
  type?: TextType;
  size?: TextSize;
  weight?: TextWeight;
  className?: string;
};

const Text = ({ type = "standard", children, size = "md", weight, className }: Props) => {
  const sizeClass = size === "sm" ? "text-sm" : size === "md" ? "text-md" : "text-lg";
  const weightClass = weight === "semibold" ? "font-semibold" : weight === "bold" ? "font-bold" : "font-normal";
  const classes = `${sizeClass} ${weightClass} ${className}`;

  switch (type) {
    case "title":
      return <h1 className={classes}>{children}</h1>;
    case "subTitle":
      return <h2 className={classes}>{children}</h2>;
    case "blockTitle":
      return <h3 className={classes}>{children}</h3>;
    case "standard":
      return <p className={classes}>{children}</p>;
    case "description":
      return <p className={`text-sm text-muted-foreground ${classes}`}>{children}</p>;
  }
};

export default Text;
