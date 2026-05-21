import { trpc } from "~/trpc/client";

export const useListUserForms = () => {
  const utils = trpc.useUtils();

  const {
    data,
    isError,
    error,
    isSuccess,
    status,
    isLoading,
    refetch,
  } = trpc.forms.listUserForms.useQuery(undefined, {
    onSuccess: () => {
      // Cache is automatically managed by tRPC
    },
  });

  return {
    data,
    isError,
    error,
    isSuccess,
    status,
    isLoading,
    refetch,
  };
};

export const useGetFormById = (id: string) => {
  const {
    data,
    isError,
    error,
    isSuccess,
    status,
    isLoading,
  } = trpc.forms.getFormById.useQuery({ id });

  return {
    data,
    isError,
    error,
    isSuccess,
    status,
    isLoading,
  };
};

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  } = trpc.forms.createForm.useMutation({
    onSuccess: async () => {
      // Invalidate the list to refetch after creating a new form
      await utils.forms.listUserForms.invalidate();
    },
  });

  return {
    createFormAsync,
    createForm,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  };
};

export const useUpdateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFormAsync,
    mutate: updateForm,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  } = trpc.forms.updateForm.useMutation({
    onSuccess: async () => {
      // Invalidate both list and individual form queries
      await utils.forms.listUserForms.invalidate();
      await utils.forms.getFormById.invalidate();
    },
  });

  return {
    updateFormAsync,
    updateForm,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  };
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFormAsync,
    mutate: deleteForm,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  } = trpc.forms.deleteForm.useMutation({
    onSuccess: async () => {
      // Invalidate the list to refetch after deleting
      await utils.forms.listUserForms.invalidate();
      await utils.forms.getFormById.invalidate();
    },
  });

  return {
    deleteFormAsync,
    deleteForm,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  };
};
