-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `lastGoalCalories` DOUBLE NULL COMMENT 'Cache rekomendasi kalori harian (hasil hitung otomatis dari TDEE & goal)';

-- AlterTable
ALTER TABLE `DailyLog`
  ADD COLUMN `goalCalorieTarget` DOUBLE NULL COMMENT 'Target kalori otomatis untuk hari ini (sesuai goal user)';
