import { fetchApi } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "CITIZEN" | "GOVERNMENT" | "UNIVERSITY" | "INDUSTRY" | "ADMIN";
  organization_name?: string;
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("solvesphere_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("solvesphere_token");
    localStorage.removeItem("solvesphere_user");
    window.location.href = "/login";
  }
}

export async function demoLogin(role: string): Promise<UserProfile> {
  const data = await fetchApi(`/auth/demo-login?role=${role}`, { method: "POST" });
  localStorage.setItem("solvesphere_token", data.access_token);
  localStorage.setItem("solvesphere_user", JSON.stringify(data.user));
  return data.user;
}
