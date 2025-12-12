import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { User } from "~/gen/api-client/models";

const currentUserState = atom<User | null | undefined>(undefined);
export const useCurrentUserState = () => {
  const [state] = useAtom(currentUserState);
  return state;
};

export const useCurrentUserMutators = () => {
  const [, setState] = useAtom(currentUserState);

  const setCurrentUserState = useCallback((user: User | null) => setState(user), [setState]);

  return { setCurrentUserState };
};
