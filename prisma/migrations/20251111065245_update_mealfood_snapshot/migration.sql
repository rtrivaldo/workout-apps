/*
  Warnings:

  - Added the required column `caloriesSnapshot` to the `MealFood` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foodNameSnapshot` to the `MealFood` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `mealfood` DROP FOREIGN KEY `MealFood_foodId_fkey`;

-- DropIndex
DROP INDEX `MealFood_foodId_fkey` ON `mealfood`;

-- AlterTable
ALTER TABLE `mealfood`
  ADD COLUMN `caloriesSnapshot` DOUBLE NOT NULL COMMENT 'Kalori total makanan saat dimasukkan ke meal (snapshot)',
  ADD COLUMN `carbsSnapshot` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Karbohidrat snapshot (gram)',
  ADD COLUMN `fatSnapshot` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Lemak snapshot (gram)',
  ADD COLUMN `foodNameSnapshot` VARCHAR(191) NOT NULL COMMENT 'Nama makanan pada saat input (snapshot)',
  ADD COLUMN `proteinSnapshot` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Protein snapshot (gram)',
  ADD COLUMN `servingSnapshot` VARCHAR(191) NOT NULL DEFAULT '1 serving' COMMENT 'Deskripsi porsi makanan saat input',
  MODIFY COLUMN `foodId` INTEGER NULL COMMENT 'Relasi opsional ke Food, null jika makanan custom',
  COMMENT='Relasi makanan user per meal dengan data snapshot nutrisi agar riwayat tetap konsisten.';


-- AddForeignKey
ALTER TABLE `MealFood` ADD CONSTRAINT `MealFood_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
