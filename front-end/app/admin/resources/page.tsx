"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  useAdminResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from "@/lib/hooks/useAdminResources";
import { useToast } from "@/components/ui/Toast";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import type { HelpResource, RiskLevel } from "@/lib/types";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Must be a valid URL"),
  minRiskLevel: z.string().min(1, "Risk level is required"),
  isActive: z.boolean().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

export default function AdminResourcesPage() {
  const { toast } = useToast();
  const { data, isLoading } = useAdminResources();
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HelpResource | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
  });

  function openCreate() {
    setEditing(null);
    reset({ title: "", description: "", url: "", minRiskLevel: "", isActive: true });
    setModalOpen(true);
  }

  function openEdit(resource: HelpResource) {
    setEditing(resource);
    reset({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      minRiskLevel: resource.minRiskLevel,
      isActive: resource.isActive ?? true,
    });
    setModalOpen(true);
  }

  async function onSubmit(formData: ResourceFormData) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...formData });
        toast("Resource updated", "success");
      } else {
        await createMutation.mutateAsync(formData);
        toast("Resource created", "success");
      }
      setModalOpen(false);
    } catch {
      toast("Operation failed", "error");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this resource?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast("Resource deleted", "success");
    } catch {
      toast("Delete failed", "error");
    }
  }

  if (isLoading) {
    return (
      <div>
        <TopBar title="Help Resources" />
        <div className="p-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Help Resources"
        action={
          <Button onClick={openCreate}>
            <Plus size={16} />
            New Resource
          </Button>
        }
      />

      <div className="p-8">
        {!data?.resources?.length ? (
          <EmptyState
            icon={<BookOpen size={48} />}
            title="No resources"
            description="Create help resources that employees will see based on their risk level."
            action={
              <Button onClick={openCreate}>
                <Plus size={16} />
                Create First Resource
              </Button>
            }
          />
        ) : (
          <Card>
            <CardTitle className="mb-4">
              All Resources ({data.resources.length})
            </CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Min. Risk</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.resources.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{res.title}</p>
                        <p className="text-xs text-olive mt-0.5 max-w-xs truncate">
                          {res.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge level={res.minRiskLevel as RiskLevel} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium ${
                          res.isActive ? "text-risk-low" : "text-stone"
                        }`}
                      >
                        {res.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-stone">
                      {res.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(res)}
                          className="p-1.5 rounded text-stone hover:text-near-black hover:bg-sand transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="p-1.5 rounded text-stone hover:text-crimson hover:bg-crimson/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Resource" : "New Resource"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="res-title">Title</Label>
            <Input id="res-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-crimson mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="res-desc">Description</Label>
            <Textarea id="res-desc" {...register("description")} />
            {errors.description && (
              <p className="text-xs text-crimson mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="res-url">URL</Label>
            <Input id="res-url" type="url" {...register("url")} />
            {errors.url && (
              <p className="text-xs text-crimson mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="res-risk">Minimum Risk Level</Label>
            <Select id="res-risk" {...register("minRiskLevel")}>
              <option value="">Select</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
            {errors.minRiskLevel && (
              <p className="text-xs text-crimson mt-1">
                {errors.minRiskLevel.message}
              </p>
            )}
          </div>

          {editing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="res-active"
                {...register("isActive")}
                className="accent-terracotta"
              />
              <Label htmlFor="res-active" className="mb-0">
                Active
              </Label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
