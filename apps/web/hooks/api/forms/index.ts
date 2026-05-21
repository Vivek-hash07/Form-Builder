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
  } = trpc.forms.listUserForms.useQuery();

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
    refetch,
  } = trpc.forms.getFormById.useQuery({ id });

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

export const useListFieldsByForm = (formId: string) => {
  const {
    data,
    isError,
    error,
    isSuccess,
    status,
    isLoading,
    refetch,
  } = trpc.formFields.listFieldsByForm.useQuery({ formId });

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

export const useGetFieldById = (id: string) => {
  const {
    data,
    isError,
    error,
    isSuccess,
    status,
    isLoading,
  } = trpc.formFields.getFieldById.useQuery({ id });

  return {
    data,
    isError,
    error,
    isSuccess,
    status,
    isLoading,
  };
};

export const useCreateField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFieldAsync,
    mutate: createField,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  } = trpc.formFields.createField.useMutation({
    onSuccess: async () => {
      // Invalidate list fields by form query
      await utils.formFields.listFieldsByForm.invalidate();
    },
  });

  return {
    createFieldAsync,
    createField,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  };
};

export const useUpdateField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFieldAsync,
    mutate: updateField,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  } = trpc.formFields.updateField.useMutation({
    onSuccess: async () => {
      // Invalidate list fields by form query
      await utils.formFields.listFieldsByForm.invalidate();
    },
  });

  return {
    updateFieldAsync,
    updateField,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  };
};

export const useDeleteField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  } = trpc.formFields.deleteField.useMutation({
    onSuccess: async () => {
      // Invalidate list fields by form query
      await utils.formFields.listFieldsByForm.invalidate();
    },
  });

  return {
    deleteFieldAsync,
    deleteField,
    failureCount,
    error,
    isError,
    isSuccess,
    status,
    isPending,
  };
};
