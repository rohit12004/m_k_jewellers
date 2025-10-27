/*
  Warnings:

  - Added the required column `description` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medias` ADD COLUMN `productId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `description` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `idx_medias_product_id` ON `medias`(`productId`);

-- AddForeignKey
ALTER TABLE `medias` ADD CONSTRAINT `medias_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
