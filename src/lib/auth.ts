import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username, admin, organization } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    username({
      usernameValidator: (username) => username !== "admin",
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
    admin({
      adminRoles: ["admin", "superadmin"],
      // adminUserIds: ["user_id_1", "user_id_2"],
      defaultRole: "user",
    }),
    organization(),
  ],
});