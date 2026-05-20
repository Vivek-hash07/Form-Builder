import { util } from "zod";
import { trpc } from "~/trpc/client";

export const useSignup = () => {

  const utils = trpc.useUtils()

  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate()
    }
  });

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

  const utils = trpc.useUtils()

  const {
    mutateAsync: signInUserwithEmailAndPasswordAsync,
    mutate: signInUserwithEmailAndPassword,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
  } = trpc.auth.signInUserwithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate() // cache invalidation to update the logged in user info after successful sign in
    }
  });

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

export const useUser = () => {
  const { data, isError, error, isSuccess, status} = trpc.auth.getLoggedInUserInfo.useMutation();
  return { data, isError, error, isSuccess, status };
}