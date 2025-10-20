-- CreateTable
CREATE TABLE `medias` (
    `id` VARCHAR(191) NOT NULL,
    `asset_id` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `thumbnail_url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `deletedAt` TIMESTAMP(6) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_medias_deleted_at`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
