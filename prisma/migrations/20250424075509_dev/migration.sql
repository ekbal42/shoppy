/*
  Warnings:

  - You are about to drop the column `urlName` on the `Shop` table. All the data in the column will be lost.
  - Added the required column `handle` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Shop" ("address", "createdAt", "description", "id", "name", "ownerId", "phone") SELECT "address", "createdAt", "description", "id", "name", "ownerId", "phone" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_handle_key" ON "Shop"("handle");
CREATE UNIQUE INDEX "Shop_phone_key" ON "Shop"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
