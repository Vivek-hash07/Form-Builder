import { router } from "./trpc";

import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/forms/route";
import { formFieldsRouter } from "./routes/form-fields/route";
import { formSubmissionsRouter } from "./routes/form-submissions/route";

export const serverRouter = router({
  auth: authRouter,
  forms: formsRouter,
  formFields: formFieldsRouter,
  formSubmissions: formSubmissionsRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
