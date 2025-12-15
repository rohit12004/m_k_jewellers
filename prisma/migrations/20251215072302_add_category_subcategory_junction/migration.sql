/*
  Warnings:

  - You are about to drop the column `categoryId` on the `sub_categories` table. All the data in the column will be lost.

*/

-- CreateTable (create junction table first)
CREATE TABLE `category_subcategory` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subCategoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_cat_subcat_category_id`(`categoryId`),
    INDEX `idx_cat_subcat_subcategory_id`(`subCategoryId`),
    UNIQUE INDEX `category_subcategory_categoryId_subCategoryId_key`(`categoryId`, `subCategoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey (add foreign keys to junction table)
ALTER TABLE `category_subcategory` ADD CONSTRAINT `category_subcategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `category_subcategory` ADD CONSTRAINT `category_subcategory_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: Copy all existing category-subcategory relationships to the junction table
INSERT INTO `category_subcategory` (`id`, `categoryId`, `subCategoryId`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as id,
    `categoryId`,
    `id` as subCategoryId,
    NOW() as createdAt,
    NOW() as updatedAt
FROM `sub_categories`
WHERE `categoryId` IS NOT NULL;

-- DropForeignKey (now safe to drop the old foreign key)
ALTER TABLE `sub_categories` DROP FOREIGN KEY `sub_categories_categoryId_fkey`;

-- DropIndex
DROP INDEX `idx_subcategories_category_id` ON `sub_categories`;

-- AlterTable (drop the old categoryId column)
ALTER TABLE `sub_categories` DROP COLUMN `categoryId`;


