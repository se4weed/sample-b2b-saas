import React from "react";
import Text from "~/components/shared/text";

type Props = {
  title: string;
  children: React.ReactNode;
};
export const FieldSet = ({ title, children }: Props) => {
  return (
    <div className="space-y-0">
      <Text size="sm" weight="bold">
        {title}
      </Text>
      {children}
    </div>
  );
};
