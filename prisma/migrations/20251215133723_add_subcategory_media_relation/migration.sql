-- AlterTable
ALTER TABLE `medias` ADD COLUMN `subCategoryId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `idx_medias_subcategory_id` ON `medias`(`subCategoryId`);

-- AddForeignKey
ALTER TABLE `medias` ADD CONSTRAINT `medias_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
