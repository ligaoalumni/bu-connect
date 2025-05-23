/*
  Warnings:

  - The values [LIKE_COMMENT] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('EVENT', 'ANNOUNCEMENT', 'LIKE_ANNOUNCEMENT', 'ANNOUNCEMENT_COMMENT', 'POST', 'LIKE_POST', 'POST_COMMENT', 'NEW_JOB', 'JOB', 'NEW_RECRUITMENT', 'RECRUITMENT', 'NEW_POLL', 'POLL', 'RECRUITMENT_APPLICATION');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;
