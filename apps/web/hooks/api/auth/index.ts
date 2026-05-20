import { trpc } from "~/trpc/client";

export const useSignup = () => {
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation();

  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
  };
};
