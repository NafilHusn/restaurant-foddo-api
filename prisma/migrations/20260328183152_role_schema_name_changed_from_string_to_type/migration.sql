-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER');

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "name" TYPE "RoleType" USING "name"::text::"RoleType";
