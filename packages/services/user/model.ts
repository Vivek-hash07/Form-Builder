import { email, z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().describe("Full name of the User"),
  email: z.email().describe("Email of the User"),
  password: z.string().describe("Password of the User"),
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;
