import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";
import type {
  AdminProfile,
  CreateAdminRequest,
  ApiResponse,
} from "../../lib/api-types";

/**
 * Get admin profile
 * GET /v1/admin/profile
 */
export const useAdminProfile = () => {
  return useQuery<AdminProfile>({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const response = await client.get<ApiResponse<AdminProfile>>("/admin/profile");
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export interface CreateAdminResponse {
  email: string;
  password: string;
}

/**
 * Create new admin
 * POST /v1/admin/create
 */
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateAdminResponse, any, CreateAdminRequest>({
    mutationFn: async (data: CreateAdminRequest) => {
      const response = await client.post<ApiResponse<CreateAdminResponse>>("/admin/create", data);
      return response.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create admin"
      );
    },
  });
};
