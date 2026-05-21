"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useGetFormByFormId } from "~/hooks/api/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import { AlertCircle, CheckCircle2, FileText, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.form_id as string;

  const { data: form, isLoading, isError } = useGetFormByFormId(formId);

  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Shared Form...</p>
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50/50 p-4 text-center">
        <div className="rounded-full bg-rose-50 p-3 text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Form Not Found</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          The public form link may be invalid, expired, or it is no longer shared publicly.
        </p>
      </div>
    );
  }

  const sortedFields = [...(form.fields || [])].sort((a, b) => a.index - b.index);

  const handleChange = (fieldId: string, val: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    sortedFields.forEach((field) => {
      const val = values[field.id];
      if (field.isRequired && (val === undefined || val === null || val === "")) {
        newErrors[field.id] = "This field is required";
      } else if (field.type === "EMAIL" && val && !/\S+@\S+\.\S+/.test(val)) {
        newErrors[field.id] = "Please enter a valid email address";
      } else if (field.type === "NUMBER" && val && isNaN(Number(val))) {
        newErrors[field.id] = "Please enter a valid number";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields correctly.");
    } else {
      setErrors({});
      setSubmitted(true);
      toast.success("Response submitted successfully!");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md border-slate-100 shadow-xl bg-white text-center p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Submission Received!</CardTitle>
          <CardDescription className="mt-2 text-slate-500">
            Thank you for your response to <strong>{form.title}</strong>.
          </CardDescription>
          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100 text-left font-mono text-xs text-slate-600 overflow-x-auto max-h-48">
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </div>
          <Button
            onClick={() => {
              setValues({});
              setSubmitted(false);
            }}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11"
          >
            Submit Another Response
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4 md:p-8">
      <Card className="w-full max-w-xl border-slate-100 shadow-xl bg-white relative overflow-hidden">
        {/* Decorative Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <CardHeader className="pt-8 pb-6 border-b border-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-700 font-semibold text-[10px] tracking-wide rounded-full px-2.5 py-0.5">
              <Sparkles className="h-3 w-3 mr-1" /> Public Shareable Form
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 md:text-3xl flex items-center gap-2">
            <FileText className="h-7 w-7 text-indigo-600 shrink-0" />
            {form.title}
          </CardTitle>
          {form.description && (
            <CardDescription className="text-slate-500 text-sm mt-2 leading-relaxed">
              {form.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {sortedFields.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-45" />
                <p className="text-xs">This form has no interactive fields yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {sortedFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>
                        {field.label}
                        {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
                      </span>
                    </label>

                    {field.type === "YES_NO" ? (
                      <div className="flex items-center gap-6 p-3 bg-slate-50/50 rounded-md border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                          <input
                            type="radio"
                            name={field.id}
                            checked={values[field.id] === "YES"}
                            onChange={() => handleChange(field.id, "YES")}
                            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                          <input
                            type="radio"
                            name={field.id}
                            checked={values[field.id] === "NO"}
                            onChange={() => handleChange(field.id, "NO")}
                            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
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
                        value={values[field.id] || ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className={`h-11 text-xs shadow-none border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 ${errors[field.id] ? "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/20" : ""
                          }`}
                      />
                    )}

                    {field.description && (
                      <p className="text-[10px] text-slate-400 italic font-medium">{field.description}</p>
                    )}

                    {errors[field.id] && (
                      <p className="text-[10px] text-rose-500 flex items-center gap-1 font-semibold animate-pulse">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors[field.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={sortedFields.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 gap-2 shadow-md mt-4 transition-colors shrink-0"
            >
              Submit Form Response
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
