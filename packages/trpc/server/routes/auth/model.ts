import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullname: z.string().describe("Fullname of the user"),
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user"),
});

export const signInWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export const signInWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user"),
});

export const verifyAndDecodeUserTokenInputModel = z.undefined();

export const verifyAndDecodeUserTokenOutputModel = z.object({
  id: z.string().describe('Id of the user'),
  email: z.string().describe('Email of the user'),
  fullname: z.string().describe('Full Name of the user'),
  profileURL: z.string().describe('Profile URL of the user').optional()
})
