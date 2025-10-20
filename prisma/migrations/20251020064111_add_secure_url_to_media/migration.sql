/*
  Warnings:

  - Added the required column `secure_url` to the `medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medias` ADD COLUMN `secure_url` VARCHAR(191) NOT NULL;
