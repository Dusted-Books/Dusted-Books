import { apiFetch } from "./apiClient";

export const getMe = async () => {
  return apiFetch("/me");
};

export const logoutRequest = async () => {
  return apiFetch("/users/logout", { method: "POST" });
};
