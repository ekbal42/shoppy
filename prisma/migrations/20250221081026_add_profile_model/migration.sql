-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "userId" INTEGER NOT NULL,
    "livingLocation" TEXT,
    "preferredLocations" TEXT,
    "gender" TEXT,
    "sscSchool" TEXT,
    "sscGroup" TEXT,
    "sscResult" REAL,
    "sscMedium" TEXT,
    "hscCollege" TEXT,
    "hscGroup" TEXT,
    "hscResult" REAL,
    "hscMedium" TEXT,
    "currentUniversity" TEXT,
    "currentDepartment" TEXT,
    "currentYearInUniversity" INTEGER,
    "lastSemesterResult" REAL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
