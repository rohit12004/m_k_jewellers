/*
  Warnings:

  - You are about to drop the column `subtotal` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `subtotal`,
    MODIFY `address` VARCHAR(191) NOT NULL,
    MODIFY `total` DECIMAL(10, 2) NOT NULL,
    MODIFY `paymentId` VARCHAR(191) NULL;
