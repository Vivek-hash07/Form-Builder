import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext, TRPCContext } from "./context";
import { getAuthenticationCookie } from "./utils/cookie";
import { userService } from "./services";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<TRPCContext>()
  .create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const authenticationProcedure = tRPCContext.procedure.use(async option => {
  const { ctx } = option

  const userToken = getAuthenticationCookie(ctx);
  if (!userToken) throw new Error("User is not LoggedIn");

  const { id } = await userService.verifyAndDecodeUserToken(userToken);

  return option.next({
    ctx: { ...ctx, user: { id } }
  })
})
