/*
  Warnings:

  - You are about to drop the column `gst` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `hallmarkCharges` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `labourCharge` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `purityFactor` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `gst`,
    DROP COLUMN `hallmarkCharges`,
    DROP COLUMN `labourCharge`,
    DROP COLUMN `purityFactor`,
    DROP COLUMN `weight`;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `purity` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NULL,
    `gst` DOUBLE NOT NULL,
    `labourCharge` DOUBLE NOT NULL,
    `hallmarkCharges` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_product_variants_product_id`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
