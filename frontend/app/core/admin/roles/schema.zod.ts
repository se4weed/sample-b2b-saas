import z from "zod";
import { PermissionType } from "~/gen/api-client/models";

export const Schema = z.object({
  name: z.string().min(1, "ロール名は必須です"),
  permissionType: z.enum(PermissionType),
});
