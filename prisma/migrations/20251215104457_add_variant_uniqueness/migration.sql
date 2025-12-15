/*
  Warnings:

  - A unique constraint covering the columns `[productId,weight,purity,size]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `idx_product_variants_unique` ON `product_variants`(`productId`, `weight`, `purity`, `size`);
