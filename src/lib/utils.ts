import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem("auth_token", token);
}

export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("auth_token");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
