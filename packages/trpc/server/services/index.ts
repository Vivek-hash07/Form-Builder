import UserService from "@repo/services/user";
import FormService from "@repo/services/forms";
import { formFieldService as formFieldsService } from "@repo/services/form-field";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = formFieldsService;
