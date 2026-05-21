import UserService from "@repo/services/user";
import FormService from "@repo/services/forms";
import { formFieldService as formFieldsService } from "@repo/services/form-field";
import FormSubmissionService from "@repo/services/form-submission";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = formFieldsService;
export const formSubmissionService = new FormSubmissionService();
