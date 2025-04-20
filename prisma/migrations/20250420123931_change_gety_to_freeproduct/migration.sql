/*
  Warnings:

  - You are about to drop the column `get_y` on the `discounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `discounts` DROP COLUMN `get_y`,
    ADD COLUMN `free_product` INTEGER NULL;
