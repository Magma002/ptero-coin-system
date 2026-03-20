import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getToken() {
  let token = localStorage.getItem("coinreward_token");
  // For development, set a default mock token if none exists
  if (!token) {
    token = "mock-jwt-token-for-development";
    localStorage.setItem("coinreward_token", token);
  }
  return token;
}

export function setToken(token: string) {
  localStorage.setItem("coinreward_token", token);
}

export function removeToken() {
  localStorage.removeItem("coinreward_token");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
