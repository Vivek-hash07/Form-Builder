"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "~/components/ui/spinner";

export default function RedirectToSubmissions() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/form/${id}/submissions`);
    }
  }, [router, id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Redirecting to submissions...</p>
      </div>
    </div>
  );
}
