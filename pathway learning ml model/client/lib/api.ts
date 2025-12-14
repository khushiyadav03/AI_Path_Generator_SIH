export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthResponse {
  user: User;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  photoURL?: string
): Promise<User> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName, photoURL }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Handle different error response formats
    const errorMessage = error.error || error.detail || error.message || JSON.stringify(error);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // Server returns { access, refresh, user }
  return data.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Handle different error response formats
    const errorMessage = error.error || error.detail || error.message || JSON.stringify(error);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // Server returns { access, refresh, user }
  return data.user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch("/api/auth/reset-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to request password reset");
  }
}

export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<void> {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reset password");
  }
}

export async function initiateGoogleAuth(): Promise<{ authUrl: string }> {
  const response = await fetch("/api/auth/google");
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to initiate Google authentication");
  }

  return await response.json();
}

