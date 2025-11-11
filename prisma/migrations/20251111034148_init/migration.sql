-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID user',
    `username` VARCHAR(191) NOT NULL COMMENT 'Username unik untuk login',
    `password` VARCHAR(191) NOT NULL COMMENT 'Password terenkripsi',
    `name` VARCHAR(191) NOT NULL COMMENT 'Nama lengkap user',
    `age` INTEGER NOT NULL COMMENT 'Usia user (tahun)',
    `gender` ENUM('MALE', 'FEMALE') NULL COMMENT 'Jenis kelamin user',
    `bodyWeight` DOUBLE NOT NULL COMMENT 'Berat badan terakhir user (kg)',
    `height` DOUBLE NOT NULL COMMENT 'Tinggi badan user (cm)',
    `fitnessGoal` ENUM('LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT') NOT NULL COMMENT 'Tujuan kebugaran',
    `activityLevel` ENUM('NOT_VERY_ACTIVE', 'LIGHTLY_ACTIVE', 'ACTIVE', 'VERY_ACTIVE') NULL DEFAULT 'LIGHTLY_ACTIVE' COMMENT 'Level aktivitas harian',
    `targetWeight` DOUBLE NULL COMMENT 'Target berat badan user (kg)',
    `lastCalculatedTdee` DOUBLE NULL COMMENT 'Cache hasil perhitungan TDEE terakhir',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pembuatan data',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update terakhir',

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID workout plan',
    `userId` INTEGER NOT NULL COMMENT 'Relasi ke User',
    `title` VARCHAR(191) NOT NULL COMMENT 'Nama rencana workout',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pembuatan plan',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update plan',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exercise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID exercise',
    `name` VARCHAR(191) NOT NULL COMMENT 'Nama latihan',
    `totalSets` INTEGER NOT NULL COMMENT 'Jumlah total set',
    `workoutPlanId` INTEGER NOT NULL COMMENT 'Relasi ke workout plan',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pembuatan exercise',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update exercise',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Food` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID makanan',
    `name` VARCHAR(191) NOT NULL COMMENT 'Nama makanan',
    `calories` DOUBLE NOT NULL COMMENT 'Kalori per porsi (kcal)',
    `protein` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Protein (gram)',
    `fat` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Lemak (gram)',
    `carbs` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Karbohidrat (gram)',
    `serving` VARCHAR(191) NOT NULL DEFAULT '1 serving' COMMENT 'Ukuran porsi standar',
    `createdBy` INTEGER NULL COMMENT 'User pembuat jika custom',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal penambahan',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update makanan',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID daily log',
    `userId` INTEGER NOT NULL COMMENT 'Relasi ke user',
    `date` DATE NOT NULL COMMENT 'Tanggal log',
    `dailyNeedCalories` DOUBLE NULL COMMENT 'Kebutuhan kalori otomatis (TDEE)',
    `manualCalorieTarget` DOUBLE NULL COMMENT 'Target kalori manual',
    `caloriesIn` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Total kalori masuk',
    `caloriesOut` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Total kalori keluar',
    `netCalories` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Selisih kalori (in-out)',
    `currentWeight` DOUBLE NULL COMMENT 'Berat badan pada tanggal log',
    `targetWeight` DOUBLE NULL COMMENT 'Snapshot target berat',
    `lastRecalculatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Waktu terakhir kalkulasi ulang',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pembuatan log',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update log',

    UNIQUE INDEX `DailyLog_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID meal',
    `dailyLogId` INTEGER NOT NULL COMMENT 'Relasi ke daily log',
    `type` ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK') NOT NULL COMMENT 'Jenis waktu makan',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pembuatan meal',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update meal',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealFood` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID meal food',
    `mealId` INTEGER NOT NULL COMMENT 'Relasi ke meal',
    `foodId` INTEGER NOT NULL COMMENT 'Relasi ke food',
    `portion` DOUBLE NOT NULL DEFAULT 1 COMMENT 'Jumlah porsi dikonsumsi',
    `totalCal` DOUBLE NOT NULL DEFAULT 0 COMMENT 'Total kalori item (calories × portion)',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pembuatan data',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update data',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeightLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Primary ID weight log',
    `userId` INTEGER NOT NULL COMMENT 'Relasi ke user',
    `weight` DOUBLE NOT NULL COMMENT 'Berat badan yang dicatat (kg)',
    `loggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pencatatan berat',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Tanggal pembuatan baris',
    `updatedAt` DATETIME(3) NOT NULL COMMENT 'Tanggal update baris',

    UNIQUE INDEX `WeightLog_userId_loggedAt_key`(`userId`, `loggedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkoutPlan` ADD CONSTRAINT `WorkoutPlan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_workoutPlanId_fkey` FOREIGN KEY (`workoutPlanId`) REFERENCES `WorkoutPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Food` ADD CONSTRAINT `Food_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyLog` ADD CONSTRAINT `DailyLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meal` ADD CONSTRAINT `Meal_dailyLogId_fkey` FOREIGN KEY (`dailyLogId`) REFERENCES `DailyLog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealFood` ADD CONSTRAINT `MealFood_mealId_fkey` FOREIGN KEY (`mealId`) REFERENCES `Meal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealFood` ADD CONSTRAINT `MealFood_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeightLog` ADD CONSTRAINT `WeightLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
