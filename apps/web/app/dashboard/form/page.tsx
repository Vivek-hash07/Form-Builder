"use client";

import { AppSidebar } from "~/components/app-sidebar"
import { SiteHeader } from "~/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar"
import { CreateFormModal } from "~/components/create-form-modal"
import { useListUserForms } from "~/hooks/api/forms"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Spinner } from "~/components/ui/spinner"

export default function FormPage() {
  const { data: forms, isLoading, isError } = useListUserForms()

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
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Forms</h1>
                  <CreateFormModal />
                </div>
              </div>
              
              <div className="px-4 lg:px-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : isError ? (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-red-700">Failed to load forms</p>
                    </CardContent>
                  </Card>
                ) : !forms || forms.length === 0 ? (
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle>No forms yet</CardTitle>
                      <CardDescription>
                        Create your first form to get started
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {forms.map((form) => (
                      <Card key={form.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{form.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {form.description || "No description"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-gray-500">
                            Created {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
