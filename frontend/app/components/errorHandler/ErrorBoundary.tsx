import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router";
import ErrorFallback from "./ErrorFallback";
import { SWRConfig } from "swr";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

// SWRConfigの内部コンポーネント
const SWRWrapper = ({ children }: Props) => {
  const { showBoundary, resetBoundary } = useErrorBoundary();
  const location = useLocation();

  useEffect(() => {
    resetBoundary();
  }, [location.pathname, resetBoundary]);

  return (
    <SWRConfig
      value={{
        onError: (error: Error) => {
          showBoundary(error);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

const CustomErrorBoundary = ({ children }: Props) => {
  const location = useLocation();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} key={location.pathname}>
      <SWRWrapper>{children}</SWRWrapper>
    </ErrorBoundary>
  );
};

export default CustomErrorBoundary;
