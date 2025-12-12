import React from "react";
import Text from "~/components/shared/text";

type Props = {
  padding?: string;
  children: React.ReactNode;
};
export const Caution = ({ padding = "8px", children }: Props) => {
  return (
    <div style={{ padding }} className="rounded-sm bg-gray-100">
      <Text weight="bold" className="mb-2">
        ⚠️注意
      </Text>
      {children}
    </div>
  );
};
