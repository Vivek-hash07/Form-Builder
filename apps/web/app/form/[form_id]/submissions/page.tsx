"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetFormByFormId, useListSubmissionsByForm } from "~/hooks/api/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import {
    ArrowLeft,
    AlertCircle,
    FileText,
    Clock,
    ClipboardList,
    ShieldAlert,
    LogIn,
    ExternalLink,
    Table,
    CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function FormSubmissionsDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params.form_id as string;

    const {
        data: form,
        isLoading: formLoading,
        isError: formError,
    } = useGetFormByFormId(formId);

    const {
        data: submissions,
        isLoading: submissionsLoading,
        isError: submissionsError,
        error: submissionsErrorObj,
    } = useListSubmissionsByForm(formId);

    // Client-side date formatting state to prevent hydration mismatches
    const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

    useEffect(() => {
        if (submissions) {
            const dates: Record<string, string> = {};
            submissions.forEach((sub) => {
                if (sub.createdAt) {
                    dates[sub.id] = new Date(sub.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                    });
                }
            });
            setFormattedDates(dates);
        }
    }, [submissions]);

    const isLoading = formLoading || submissionsLoading;

    // Handle Loading State
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <Spinner className="h-8 w-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Loading secure submissions dashboard...</p>
                </div>
            </div>
        );
    }

    // Handle Unauthorized / Access Denied or General Error State
    const isUnauthorized =
        submissionsError ||
        (submissionsErrorObj?.message &&
            (submissionsErrorObj.message.includes("authorized") ||
                submissionsErrorObj.message.includes("authenticated")));

    if (isUnauthorized || !submissions) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 p-4">
                <Card className="w-full max-w-md border-slate-200/80 shadow-xl bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
                    <CardHeader className="text-center pt-8 pb-4">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                            <ShieldAlert className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">Access Denied</CardTitle>
                        <CardDescription className="mt-2 text-slate-500 text-sm leading-relaxed">
                            {submissionsErrorObj?.message ||
                                "You are not authorized to view submissions for this form. Only the authenticated creator of the form can view this dashboard."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 p-6 pt-2">
                        <Button
                            onClick={() => router.push("/login")}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 gap-2 shrink-0 transition-colors"
                        >
                            <LogIn className="h-4 w-4" /> Sign In as Creator
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard")}
                            className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-11 gap-2 shrink-0 transition-colors"
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Handle Form Error / Form Not Found
    if (formError || !form) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50/50 p-4 text-center">
                <div className="rounded-full bg-rose-50 p-3 text-rose-500">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Form Workspace Not Found</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                    The form you are looking for might have been deleted, or does not exist.
                </p>
                <Button
                    onClick={() => router.push("/dashboard")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const sortedFields = [...(form.fields || [])].sort((a, b) => a.index - b.index);

    // Helper to extract a field value from a submission
    const getFieldValue = (subValue: any[], fieldId: string) => {
        if (!Array.isArray(subValue)) return "—";
        const found = subValue.find((item) => item.formField === fieldId);
        if (!found) return "—";

        // Handle stringified JSON structures safely
        try {
            if (found.value.startsWith("{") || found.value.startsWith("[")) {
                const parsed = JSON.parse(found.value);
                return typeof parsed === "object" ? JSON.stringify(parsed) : String(parsed);
            }
        } catch {
            // Ignore and treat as regular string
        }

        return found.value || "—";
    };

    // Metrics calculations
    const totalSubmissions = submissions.length;
    const latestSubmissionDate =
        submissions.length > 0 && submissions[0]?.createdAt
            ? new Date(
                Math.max(
                    ...submissions.map((s) => new Date(s.createdAt || 0).getTime())
                )
            ).toLocaleDateString(undefined, { dateStyle: "medium" })
            : "No submissions yet";

    return (
        <div className="flex min-h-screen flex-col bg-slate-50/40 p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* Navigation & Actions Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/form/${formId}`)}
                            className="h-10 w-10 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight md:text-2xl flex items-center gap-2">
                                <FileText className="h-6 w-6 text-indigo-600 shrink-0" />
                                {form.title}
                            </h1>
                            <p className="text-xs font-medium text-slate-500 mt-1 max-w-xl line-clamp-1">
                                {form.description || "Submissions management and analytics board"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.open(`/form/${formId}`, "_blank")}
                            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-10 gap-1.5 transition-colors text-xs"
                        >
                            View Public Form <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                Total Submissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900">{totalSubmissions}</span>
                                <Badge className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border-indigo-100 shadow-none text-[10px] py-0 px-2 rounded-full">
                                    Live
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                Latest Response
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-slate-800">
                                <Clock className="h-5 w-5 text-purple-500 shrink-0" />
                                <span className="text-sm font-bold truncate">{latestSubmissionDate}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden relative sm:col-span-2 lg:col-span-1">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                Status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-emerald-800">
                                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold">Authorized (Owner View)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions Table / Empty State Card */}
                <Card className="border-slate-200/60 shadow-md bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center gap-2">
                        <Table className="h-4.5 w-4.5 text-slate-500" />
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-800">Response Database</CardTitle>
                            <CardDescription className="text-[10px]">
                                Showing all secure responses submitted by users
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {totalSubmissions === 0 ? (
                            <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3 bg-white px-4">
                                <div className="rounded-full bg-slate-50 p-4 border border-dashed border-slate-200/80 text-slate-400">
                                    <ClipboardList className="h-10 w-10 opacity-60" />
                                </div>
                                <h3 className="text-base font-bold text-slate-700">No Submissions Yet</h3>
                                <p className="text-xs max-w-xs leading-relaxed text-slate-400">
                                    Share this form with your audience to begin receiving secure form submissions.
                                </p>
                                <Button
                                    onClick={() => window.open(`/form/${formId}`, "_blank")}
                                    className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 gap-1.5 text-xs shadow-md shrink-0 transition-all"
                                >
                                    Open Live Form <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs text-slate-600">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                            <th className="py-4 px-6 font-bold">#</th>
                                            {sortedFields.map((field) => (
                                                <th key={field.id} className="py-4 px-6 font-bold min-w-[150px]">
                                                    {field.label}
                                                </th>
                                            ))}
                                            <th className="py-4 px-6 font-bold text-right min-w-[180px]">Submitted At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {submissions.map((sub, rowIndex) => (
                                            <tr
                                                key={sub.id}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="py-4 px-6 font-medium text-slate-400">
                                                    {totalSubmissions - rowIndex}
                                                </td>
                                                {sortedFields.map((field) => {
                                                    const val = getFieldValue(sub.value as any[], field.id);
                                                    return (
                                                        <td key={field.id} className="py-4 px-6 font-medium text-slate-800 break-words">
                                                            {field.type === "YES_NO" ? (
                                                                <Badge
                                                                    className={`shadow-none font-bold text-[10px] rounded-full py-0 px-2.5 ${val === "YES"
                                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                                        : val === "NO"
                                                                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                                                                            : "bg-slate-50 text-slate-500 border border-slate-100"
                                                                        }`}
                                                                >
                                                                    {val}
                                                                </Badge>
                                                            ) : (
                                                                <span className="line-clamp-2">{val}</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="py-4 px-6 font-medium text-slate-500 text-right font-mono">
                                                    {formattedDates[sub.id] || "Loading Date..."}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
