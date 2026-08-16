import { apiFetch } from "./apiClient";

export const getMe = async () => {
  return apiFetch("/me");
};

export const logoutRequest = async () => {
  return apiFetch("/users/logout", { method: "POST" });
};

export const verifyEmail = async (token: string) => {
  return apiFetch(`/verify-email?token=${token}`);
};

export const resendVerificationEmail = async (email: string) => {
  return apiFetch("/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
};
