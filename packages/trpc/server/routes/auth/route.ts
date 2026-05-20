import { set } from "zod";
import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInWithEmailAndPasswordInputModel,
  signInWithEmailAndPasswordOutputModel,
} from "./model";
import { setAuthenticationCookie } from "../../utils/cookie";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullname, email, password } = input;
      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName: fullname,
        email,
        password,
      });
      if (!id) throw new Error("Failed to create user");

      setAuthenticationCookie(ctx, token);

      return { id, token };
    }),

    signInUserwithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInUserwithEmailAndPassword"),
        tags: TAGS,
      }
    })
    .input(signInWithEmailAndPasswordInputModel)
    .output(signInWithEmailAndPasswordOutputModel)
    .mutation( async ({input, ctx}) => {
      const { email, password } = input;
      const { id, token } = await userService.signInUserwithEmailAndPassword({
        email,
        password,
      })
      setAuthenticationCookie(ctx, token)
      return { id, token }
    })
});
