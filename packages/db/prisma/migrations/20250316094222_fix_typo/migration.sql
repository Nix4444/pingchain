/*
  Warnings:

  - You are about to drop the column `disabeld` on the `Website` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Website" DROP COLUMN "disabeld",
ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false;
