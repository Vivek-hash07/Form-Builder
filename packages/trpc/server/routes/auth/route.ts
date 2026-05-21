import { set } from "zod";
import { userService } from "../../services";
import { authenticationProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  signInWithEmailAndPasswordInputModel,
  signInWithEmailAndPasswordOutputModel,
  verifyAndDecodeUserTokenInputModel,
  verifyAndDecodeUserTokenOutputModel,
} from "./model";
import { getAuthenticationCookie, setAuthenticationCookie } from "../../utils/cookie";

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
    }),

    getLoggedInUserInfo: authenticationProcedure
    .meta({openapi: {
        method: "GET",
        path: getPath("/getLoggedInUserInfo"),
        tags: TAGS,
      }})
      .input(verifyAndDecodeUserTokenInputModel)
      .output(verifyAndDecodeUserTokenOutputModel)
      .query(async ({ ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new Error("No user id available");

        const user = await userService.getUserInfoByID(userId);
        if (!user) throw new Error("User not found");

        const { id, email, fullname, profileURL: rawProfileURL } = user;
        if (!id || !email || !fullname) throw new Error("Invalid user data");

        const profileURL = rawProfileURL ?? undefined;
        return { id, email, fullname, profileURL };
      })
});
