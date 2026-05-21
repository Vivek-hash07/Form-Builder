"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  Eye, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Info,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";

import { 
  useGetFormById, 
  useUpdateForm, 
  useListFieldsByForm, 
  useCreateField, 
  useUpdateField, 
  useDeleteField 
} from "~/hooks/api/forms";

// Validation Schema for Form Details
const updateFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
});
type UpdateFormValues = z.infer<typeof updateFormSchema>;

// Validation Schema for Form Fields
const fieldSchema = z.object({
  label: z.string().min(1, "Label is required").max(255),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional().default(false),
  index: z.coerce.number().min(0, "Index must be at least 0"),
  type: z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]),
});
type FieldValues = z.infer<typeof fieldSchema>;

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  // Modals state
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);

  // Preview form test state
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // Queries
  const { data: form, isLoading: formLoading, isError: formError, refetch: refetchForm } = useGetFormById(formId);
  const { data: fields = [], isLoading: fieldsLoading, isError: fieldsError } = useListFieldsByForm(formId);

  // Mutations
  const { updateFormAsync, isPending: updateFormPending } = useUpdateForm();
  const { createFieldAsync, isPending: createFieldPending } = useCreateField();
  const { updateFieldAsync, isPending: updateFieldPending } = useUpdateField();
  const { deleteFieldAsync, isPending: deleteFieldPending } = useDeleteField();

  // Sort fields by their index
  const sortedFields = [...fields].sort((a, b) => a.index - b.index);

  // Forms hook-form setup for Form details
  const formDetailsForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Populate form details modal on load or form data change
  useEffect(() => {
    if (form) {
      formDetailsForm.reset({
        title: form.title,
        description: form.description || "",
      });
    }
  }, [form, formDetailsForm]);

  // Field modal hook-form setup
  const lastField = sortedFields.length > 0 ? sortedFields[sortedFields.length - 1] : undefined;
  const nextIndex = lastField ? Math.ceil(Number(lastField.index)) + 1 : 1;

  // Field modal hook-form setup
  const fieldForm = useForm<any>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: "",
      description: "",
      placeholder: "",
      isRequired: false,
      index: nextIndex,
      type: "TEXT",
    },
  });

  // Set field modal default values when opening for create vs edit
  useEffect(() => {
    if (fieldModalOpen) {
      if (editingField) {
        fieldForm.reset({
          label: editingField.label,
          description: editingField.description || "",
          placeholder: editingField.placeholder || "",
          isRequired: editingField.isRequired,
          index: editingField.index,
          type: editingField.type,
        });
      } else {
        fieldForm.reset({
          label: "",
          description: "",
          placeholder: "",
          isRequired: false,
          index: nextIndex,
          type: "TEXT",
        });
      }
    }
  }, [fieldModalOpen, editingField, fieldForm, nextIndex]);

  // Clear preview states when fields list changes
  useEffect(() => {
    setPreviewValues({});
    setPreviewErrors({});
    setPreviewSubmitted(false);
  }, [fields]);

  // Form Details Submission handler
  const onUpdateDetails = async (values: UpdateFormValues) => {
    try {
      await updateFormAsync({
        id: formId,
        ...values,
      });
      setEditDetailsOpen(false);
      refetchForm();
      toast.success("Form details updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update form details");
    }
  };

  // Field Add/Edit Submission handler
  const onSaveField = async (values: FieldValues) => {
    try {
      if (editingField) {
        await updateFieldAsync({
          id: editingField.id,
          ...values,
        });
        toast.success("Field updated successfully");
      } else {
        await createFieldAsync({
          formId,
          ...values,
        });
        toast.success("Field added successfully");
      }
      setFieldModalOpen(false);
      setEditingField(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save field");
    }
  };

  // Field deletion handler
  const onDeleteField = async (fieldId: string, label: string) => {
    if (confirm(`Are you sure you want to delete the field "${label}"?`)) {
      try {
        await deleteFieldAsync({ id: fieldId });
        toast.success("Field deleted successfully");
        // Quick trigger cache invalidation refresh
        refetchForm();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete field");
      }
    }
  };

  // Mock Form Submit validation
  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    sortedFields.forEach((field) => {
      const value = previewValues[field.id];
      if (field.isRequired && (value === undefined || value === null || value === "")) {
        errors[field.id] = "This field is required";
      } else if (field.type === "EMAIL" && value && !/\S+@\S+\.\S+/.test(value)) {
        errors[field.id] = "Must be a valid email address";
      } else if (field.type === "NUMBER" && value && isNaN(Number(value))) {
        errors[field.id] = "Must be a valid number";
      }
    });

    if (Object.keys(errors).length > 0) {
      setPreviewErrors(errors);
      setPreviewSubmitted(false);
      toast.error("Please fix the validation errors in the preview form");
    } else {
      setPreviewErrors({});
      setPreviewSubmitted(true);
      toast.success("Mock form validation passed successfully!");
    }
  };

  const handlePreviewChange = (fieldId: string, val: any) => {
    setPreviewValues((prev) => ({ ...prev, [fieldId]: val }));
    if (previewErrors[fieldId]) {
      setPreviewErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TEXT": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "NUMBER": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "EMAIL": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "YES_NO": return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800";
      case "PASSWORD": return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800";
      default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800";
    }
  };

  if (formLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="text-sm font-medium text-slate-500">Loading your Form Workspace...</p>
        </div>
      </div>
    );
  }

  if (formError || !form) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-slate-50/50">
        <AlertCircle className="h-12 w-12 text-red-500 animate-pulse" />
        <h3 className="text-xl font-bold">Form Workspace Not Found</h3>
        <p className="text-sm text-slate-500 max-w-sm text-center">
          The form you are looking for might have been deleted, or does not exist.
        </p>
        <Link href="/dashboard/form" passHref>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-slate-50/40">
        <SiteHeader />
        
        {/* Core Workspace Layout */}
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
          
          {/* Breadcrumbs & Navigation Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Link href="/dashboard/form" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Forms
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold truncate max-w-[200px] md:max-w-[400px]">{form.title}</span>
            </div>

            <div className="flex gap-2">
              <Dialog open={editDetailsOpen} onOpenChange={setEditDetailsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 shadow-xs border-slate-200">
                    <Settings className="h-3.5 w-3.5" />
                    Configure Form
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configure Form</DialogTitle>
                    <DialogDescription>Update metadata and configurations of your form</DialogDescription>
                  </DialogHeader>
                  <Form {...formDetailsForm}>
                    <form onSubmit={formDetailsForm.handleSubmit(onUpdateDetails)} className="space-y-4 pt-2">
                      <FormField
                        control={formDetailsForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Form title" {...field} disabled={updateFormPending} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formDetailsForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Form description" {...field} disabled={updateFormPending} rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setEditDetailsOpen(false)} disabled={updateFormPending}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateFormPending}>
                          {updateFormPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Large Title Bar Card */}
          <Card className="border-slate-100 shadow-xs bg-white/70 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl flex items-center gap-2">
                    {form.title}
                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 font-medium">
                      <Sparkles className="h-3 w-3 mr-1" /> Active Workspace
                    </Badge>
                  </h1>
                  <p className="text-slate-500 text-sm md:text-base max-w-3xl leading-relaxed">
                    {form.description || "Customize your form. Add inputs, set parameters, and preview structural validation instantly."}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Created: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Builder Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Fields Manager (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Card className="border-slate-100 shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-50">
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      Form Fields
                    </CardTitle>
                    <CardDescription>Add, update, or rearrange form layout inputs</CardDescription>
                  </div>
                  
                  {/* Field Modal Creator */}
                  <Dialog open={fieldModalOpen} onOpenChange={setFieldModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-9 gap-1.5 shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setEditingField(null)}>
                        <Plus className="h-4 w-4" />
                        Add Input
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingField ? "Edit Field Input" : "Add Form Input"}</DialogTitle>
                        <DialogDescription>
                          Configure standard validation parameters for this input
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...fieldForm}>
                        <form onSubmit={fieldForm.handleSubmit(onSaveField)} className="space-y-4 pt-2">
                          <FormField
                            control={fieldForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Input Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an input type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="TEXT">Plain Text Input</SelectItem>
                                    <SelectItem value="NUMBER">Number Input</SelectItem>
                                    <SelectItem value="EMAIL">Email Address Input</SelectItem>
                                    <SelectItem value="PASSWORD">Password Input</SelectItem>
                                    <SelectItem value="YES_NO">Yes/No Radio</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={fieldForm.control}
                            name="label"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Email Address, Full Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={fieldForm.control}
                            name="placeholder"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Placeholder Hint (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. enter your text here" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={fieldForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Helper Text / Description (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Small subtitle showing under input" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={fieldForm.control}
                              name="index"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sort index</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormDescription>Determines element order</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={fieldForm.control}
                              name="isRequired"
                              render={({ field }) => (
                                <FormItem className="flex flex-col justify-end pb-3.5">
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} id="is-required-switch" />
                                    </FormControl>
                                    <FormLabel htmlFor="is-required-switch" className="cursor-pointer font-medium">Is Required</FormLabel>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setFieldModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createFieldPending || updateFieldPending}>
                              {createFieldPending || updateFieldPending ? "Saving..." : "Save Input"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  {fieldsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Spinner />
                    </div>
                  ) : fieldsError ? (
                    <div className="p-6 text-center text-sm text-red-600 bg-red-50/50 rounded-b-lg flex flex-col items-center gap-2">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                      <span>Failed to load fields. Make sure API is running.</span>
                    </div>
                  ) : sortedFields.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800">Your Form is Empty</h4>
                        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                          This form has no interactive elements yet. Add input fields of different types (text, email, password) to construct your schema.
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="border-indigo-200 hover:border-indigo-600 hover:text-indigo-600" onClick={() => setFieldModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add your first input
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {sortedFields.map((field) => (
                        <div key={field.id} className="p-4 md:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors group">
                          <div className="space-y-1 pr-4 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold border border-slate-200" title="Element Sort Weight">
                                #{Number(field.index).toFixed(2)}
                              </span>
                              <span className="text-sm font-bold text-slate-800 truncate">{field.label}</span>
                              <Badge variant="outline" className={`text-[10px] font-semibold tracking-wide py-0 px-2 rounded-full border ${getTypeColor(field.type)}`}>
                                {field.type}
                              </Badge>
                              {field.isRequired && (
                                <Badge variant="secondary" className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                                  Required
                                </Badge>
                              )}
                            </div>
                            {field.placeholder && (
                              <p className="text-xs text-slate-400 truncate">
                                <span className="font-semibold text-slate-500">Placeholder: </span>
                                &ldquo;{field.placeholder}&rdquo;
                              </p>
                            )}
                            {field.description && (
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Info className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="italic">{field.description}</span>
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                              onClick={() => {
                                setEditingField(field);
                                setFieldModalOpen(true);
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                              onClick={() => onDeleteField(field.id, field.label)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Live Form Preview (5 cols) */}
            <div className="lg:col-span-5">
              <Card className="border-slate-200/80 shadow-md bg-white ring-1 ring-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 flex flex-row items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-slate-500" />
                      Interactive Live Preview
                    </CardTitle>
                    <CardDescription className="text-[11px]">Real-time rendering & structural validation simulation</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {sortedFields.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      <Eye className="h-8 w-8 opacity-40" />
                      <p className="text-xs max-w-xs leading-relaxed px-4">
                        Add interactive input components in the builder panel to view live rendered elements here.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePreviewSubmit} className="space-y-5">
                      <div className="space-y-4">
                        {sortedFields.map((field) => (
                          <div key={field.id} className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>
                                {field.label}
                                {field.isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal font-mono">
                                key: {field.labelKey}
                              </span>
                            </label>

                            {field.type === "YES_NO" ? (
                              <div className="flex items-center gap-6 p-3 bg-slate-50/50 rounded-md border border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                                  <input
                                    type="radio"
                                    name={field.id}
                                    checked={previewValues[field.id] === "YES"}
                                    onChange={() => handlePreviewChange(field.id, "YES")}
                                    className="h-3.5 w-3.5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                                  <input
                                    type="radio"
                                    name={field.id}
                                    checked={previewValues[field.id] === "NO"}
                                    onChange={() => handlePreviewChange(field.id, "NO")}
                                    className="h-3.5 w-3.5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                  />
                                  No
                                </label>
                              </div>
                            ) : (
                              <Input
                                type={
                                  field.type === "PASSWORD"
                                    ? "password"
                                    : field.type === "NUMBER"
                                    ? "number"
                                    : field.type === "EMAIL"
                                    ? "email"
                                    : "text"
                                }
                                placeholder={field.placeholder || ""}
                                value={previewValues[field.id] || ""}
                                onChange={(e) => handlePreviewChange(field.id, e.target.value)}
                                className={`h-10 text-xs shadow-none border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 ${
                                  previewErrors[field.id] ? "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20" : ""
                                }`}
                              />
                            )}

                            {field.description && (
                              <p className="text-[10px] text-slate-400">{field.description}</p>
                            )}

                            {previewErrors[field.id] && (
                              <p className="text-[10px] text-rose-500 flex items-center gap-1 font-semibold">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                {previewErrors[field.id]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {previewSubmitted && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800 flex items-start gap-2.5 shadow-xs">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Form Submission Passed!</p>
                            <p className="text-emerald-700 mt-0.5 leading-relaxed font-mono text-[10px]">
                              {JSON.stringify(previewValues, null, 2)}
                            </p>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 gap-1.5 shadow-sm">
                        Submit Preview Form
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
