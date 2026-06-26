import bcrypt from "bcryptjs";

export async function hashPassword(input: string) {
  return bcrypt.hash(input, 12);
}

export async function verifyPassword(input: string, passwordHash: string) {
  return bcrypt.compare(input, passwordHash);
}
