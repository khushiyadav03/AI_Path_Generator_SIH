import { User, findUserByEmail, findUserByUsername, findUserByUsernameOrEmail, createUser, updateUser, hashPassword, verifyPassword } from "./database.js";
import { generateTokenPair, JWTPayload } from "./jwt.js";

export function isGmail(email: string): boolean {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return gmailRegex.test(email);
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function signUp(
  username: string,
  email: string,
  password: string,
  academicYear: number,
  displayName?: string,
  photoURL?: string
): Promise<{ user: User; access: string; refresh: string }> {
  // Validate academic year (1-4)
  if (![1, 2, 3, 4].includes(academicYear)) {
    throw new Error("Academic year must be between 1 and 4");
  }

  // Validate username
  if (!username || username.trim().length === 0) {
    throw new Error("Username is required");
  }

  // Validate email
  if (!email || !email.includes("@")) {
    throw new Error("A valid email address is required.");
  }

  // Check if user exists by email
  if (findUserByEmail(email)) {
    throw new Error("A user with this email already exists.");
  }

  // Check if username exists
  if (findUserByUsername(username)) {
    throw new Error("A user with this username already exists.");
  }

  // Create user
  const hashedPassword = hashPassword(password);
  const defaultDisplayName = displayName || username;
  
  // Use name field (database schema uses 'name', not 'username')
  const user = createUser({
    name: defaultDisplayName,
    email,
    password: hashedPassword,
    role: "mentee",
  });

  // Generate JWT tokens
  const tokenPayload: JWTPayload = {
    userId: user.id,
    username: user.name, // Use name as username (database schema uses 'name')
    email: user.email,
  };
  const tokens = generateTokenPair(tokenPayload);

  // Return user without password
  const { password: _, ...userWithoutSensitive } = user;
  return {
    user: userWithoutSensitive as User,
    ...tokens,
  };
}

export async function signIn(usernameOrEmail: string, password: string): Promise<{ user: User; access: string; refresh: string }> {
  const user = findUserByUsernameOrEmail(usernameOrEmail);
  
  if (!user || !user.password) {
    throw new Error("Unable to log in with provided credentials.");
  }

  if (!verifyPassword(password, user.password)) {
    throw new Error("Unable to log in with provided credentials.");
  }

  // Generate JWT tokens
  const tokenPayload: JWTPayload = {
    userId: user.id,
    username: user.name, // Use name as username (database schema uses 'name')
    email: user.email,
  };
  const tokens = generateTokenPair(tokenPayload);

  // Return user without password
  const { password: _, ...userWithoutSensitive } = user;
  return {
    user: userWithoutSensitive as User,
    ...tokens,
  };
}

export async function requestPasswordReset(email: string): Promise<{ resetToken: string }> {
  const user = findUserByEmail(email);
  
  if (!user) {
    // Don't reveal if user exists for security
    return { resetToken: "dummy" };
  }

  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  updateUser(user.id, { resetToken, resetTokenExpiry });

  return { resetToken };
}

export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<void> {
  const { readUsers } = await import("./database.js");
  const users = readUsers();
  const user = users.find(
    (u: User) =>
      u.resetToken === resetToken &&
      u.resetTokenExpiry &&
      new Date(u.resetTokenExpiry) > new Date()
  );

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = hashPassword(newPassword);
  updateUser(user.id, {
    password: hashedPassword,
    resetToken: undefined,
    resetTokenExpiry: undefined,
  });
}

