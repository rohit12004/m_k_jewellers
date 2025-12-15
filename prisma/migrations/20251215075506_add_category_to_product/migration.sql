/*
  Warnings:

  - Added the required column `categoryId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `categoryId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `idx_products_category_id` ON `products`(`categoryId`);

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
