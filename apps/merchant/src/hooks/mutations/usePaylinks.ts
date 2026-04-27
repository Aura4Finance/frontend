import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import client from "../../store/client";
import type { MarkdownDraftInput } from "../../lib/descriptionAssistant";

// Types
export type PaylinkMode = "live" | "test";

export interface Paylink {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  mode: PaylinkMode;
  images: {
    id: string;
    blobId: string;
    blobObjectId: string;
  }[];
  profileId: string;
}

export interface PaylinkResponse {
  message: string;
  data: Paylink;
}

export interface PaylinkListResponse {
  message: string;
  data: Paylink[];
}

export interface PaylinkAIDescriptionResponse {
  success: boolean;
  data: string;
  message?: string;
}

export interface CreatePaylinkPayload {
  title: string;
  description: string;
  amount: number;
  currency: string;
}

export interface EditPaylinkPayload {
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
}

export const useGeneratePaylinkDescription = () => {
  return useMutation({
    mutationFn: async (payload: MarkdownDraftInput) => {
      const response = await client.post("/v1/paylink/ai-description", payload);
      return response.data as PaylinkAIDescriptionResponse;
    },
  });
};

// Get all paylinks
export const useGetPaylinks = (mode: string) => {
  return useQuery({
    queryKey: ["paylinks", mode],
    queryFn: async () => {
      const response = await client.get("/user/paylink");
      return response.data.data as Paylink[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get single paylink details
export const useGetPaylink = (paylinkId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["paylink", paylinkId],
    queryFn: async () => {
      const response = await client.get(`/user/paylink/${paylinkId}`);
      return response.data.data as Paylink;
    },
    enabled: enabled && !!paylinkId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// Create paylink with images
export const useCreatePaylink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      images,
    }: {
      payload: CreatePaylinkPayload;
      images: File[];
    }) => {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await client.post("/user/paylink", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data as Paylink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paylinks"] });
      toast.success("Paylink created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create paylink"
      );
    },
  });
};

// Edit paylink with optional images
export const useEditPaylink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paylinkId,
      payload,
      images,
    }: {
      paylinkId: string;
      payload: EditPaylinkPayload;
      images?: File[];
    }) => {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await client.patch(`/user/paylink/${paylinkId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data as Paylink;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["paylinks"] });
      queryClient.invalidateQueries({ queryKey: ["paylink", variables.paylinkId] });
      toast.success("Paylink updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update paylink"
      );
    },
  });
};

// Delete paylink
export const useDeletePaylink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paylinkId: string) => {
      const response = await client.delete(`/user/paylink/${paylinkId}`);
      toast.info("Deleting image from payment link", { duration: 3000 });
      return response.data.data;
    },
    onSuccess: (_, paylinkId) => {
      queryClient.invalidateQueries({ queryKey: ["paylinks"] });
      queryClient.removeQueries({ queryKey: ["paylink", paylinkId] });
      toast.success("Paylink deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete paylink"
      );
    },
  });
};

export const deleteImageFromPaylink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ imageId }: { imageId: string }) => {
      const response = await client.delete(`/user/paylink/images/${imageId}`);
      return response.data.data;
    },
    onSuccess: (_, paylinkId) => {
      queryClient.removeQueries({ queryKey: ["paylink", paylinkId] });
      toast.success("Image removed from payment link successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete image from payment link."
      );
    },
  })
}
