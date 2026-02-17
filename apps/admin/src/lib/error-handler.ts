/**
 * API Error Handler
 * Centralized error handling for API requests
 */

import { toast } from "sonner";
import type { ApiError } from "./api-types";
import { AxiosError } from "axios";

export class ApiErrorHandler {
  static handle(error: unknown): never {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError | undefined;
      
      const message = apiError?.message || error.message || "An unexpected error occurred";
      const statusCode = error.response?.status;

      // Handle specific status codes
      switch (statusCode) {
        case 401:
          toast.error("Unauthorized. Please login again.");
          // Clear token and redirect to login
          window.location.href = "/login";
          break;
        case 403:
          toast.error("You don't have permission to perform this action.");
          break;
        case 404:
          toast.error("Resource not found.");
          break;
        case 422:
          toast.error(message || "Validation error. Please check your input.");
          break;
        case 429:
          toast.error("Too many requests. Please try again later.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(message);
      }

      throw new Error(message);
    }

    // Handle non-Axios errors
    if (error instanceof Error) {
      toast.error(error.message);
      throw error;
    }

    toast.error("An unexpected error occurred");
    throw new Error("An unexpected error occurred");
  }

  static handleSilent(error: unknown): string {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError | undefined;
      return apiError?.message || error.message || "An unexpected error occurred";
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred";
  }

  static isUnauthorized(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 401;
    }
    return false;
  }

  static isForbidden(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 403;
    }
    return false;
  }

  static isNotFound(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 404;
    }
    return false;
  }

  static isValidationError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 422;
    }
    return false;
  }
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  return ApiErrorHandler.handleSilent(error);
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && error.code === "ERR_NETWORK";
  }
  return false;
}
