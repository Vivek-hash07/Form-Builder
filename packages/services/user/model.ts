import { email, z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().describe("Full name of the User"),
  email: z.email().describe("Email of the User"),
  password: z.string().describe("Password of the User"),
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const generateUserTokenPayload = z.object({
  id: z.string().describe("uuid of the user"),
});

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;
