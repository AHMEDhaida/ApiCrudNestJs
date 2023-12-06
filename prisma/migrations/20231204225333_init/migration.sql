/*
  Warnings:

  - You are about to drop the column `tilte` on the `post` table. All the data in the column will be lost.
  - Added the required column `title` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `post` DROP COLUMN `tilte`,
    ADD COLUMN `title` VARCHAR(65) NOT NULL;
