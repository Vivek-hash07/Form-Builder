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

export const useSignIn = () => {
  const {
    mutateAsync: signInUserwithEmailAndPasswordAsync,
    mutate: signInUserwithEmailAndPassword,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
  } = trpc.auth.signInUserwithEmailAndPassword.useMutation();

  return {
    signInUserwithEmailAndPasswordAsync,
    signInUserwithEmailAndPassword,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
  };
}