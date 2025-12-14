-- AlterTable
ALTER TABLE `medias` ADD COLUMN `categoryId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `idx_medias_category_id` ON `medias`(`categoryId`);

-- AddForeignKey
ALTER TABLE `medias` ADD CONSTRAINT `medias_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
