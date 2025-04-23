/*
  Warnings:

  - Added the required column `urlName` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "urlName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Shop" ("address", "createdAt", "id", "name", "ownerId", "phone") SELECT "address", "createdAt", "id", "name", "ownerId", "phone" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_urlName_key" ON "Shop"("urlName");
CREATE UNIQUE INDEX "Shop_phone_key" ON "Shop"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
