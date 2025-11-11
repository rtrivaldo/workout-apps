/*
  Warnings:

  - You are about to drop the column `totalSets` on the `exercise` table. All the data in the column will be lost.
  - You are about to drop the column `workoutPlanId` on the `exercise` table. All the data in the column will be lost.
  - Added the required column `order` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workoutId` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `exercise` DROP FOREIGN KEY `Exercise_workoutPlanId_fkey`;

-- DropIndex
DROP INDEX `Exercise_workoutPlanId_fkey` ON `exercise`;

-- AlterTable
ALTER TABLE `exercise` DROP COLUMN `totalSets`,
    DROP COLUMN `workoutPlanId`,
    ADD COLUMN `order` INTEGER NOT NULL,
    ADD COLUMN `workoutId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `ExercisePlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `totalSets` INTEGER NOT NULL,
    `workoutPlanId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Set` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exerciseId` INTEGER NOT NULL,
    `reps` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `order` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExercisePlan` ADD CONSTRAINT `ExercisePlan_workoutPlanId_fkey` FOREIGN KEY (`workoutPlanId`) REFERENCES `WorkoutPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workout` ADD CONSTRAINT `Workout_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Set` ADD CONSTRAINT `Set_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
