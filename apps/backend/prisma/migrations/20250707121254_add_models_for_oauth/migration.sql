/*
  Warnings:

  - You are about to drop the column `discordId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_discordId_key` ON `User`;

-- DropIndex
DROP INDEX `User_githubId_key` ON `User`;

-- DropIndex
DROP INDEX `User_googleId_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `discordId`,
    DROP COLUMN `githubId`,
    DROP COLUMN `googleId`;

-- CreateTable
CREATE TABLE `GithubOAuth` (
    `id` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(33) NOT NULL,

    UNIQUE INDEX `GithubOAuth_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscordOAuth` (
    `id` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `refreshToken` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(33) NOT NULL,

    UNIQUE INDEX `DiscordOAuth_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GithubOAuth` ADD CONSTRAINT `GithubOAuth_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscordOAuth` ADD CONSTRAINT `DiscordOAuth_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
