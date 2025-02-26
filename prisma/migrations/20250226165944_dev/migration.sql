-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "salary" REAL,
    "publisher" TEXT NOT NULL,
    "subjects" TEXT,
    "tutoringTime" TEXT,
    "daysInWeek" TEXT,
    "studentGender" TEXT NOT NULL,
    "tutorGenderNeed" TEXT NOT NULL,
    "tutorUniversityNeed" TEXT NOT NULL,
    "tutorUniversityTypeNeed" TEXT NOT NULL,
    "tutorDepartmentNeed" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "postedById" INTEGER NOT NULL,
    "managedById" INTEGER,
    "managedAt" DATETIME,
    CONSTRAINT "Job_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_managedById_fkey" FOREIGN KEY ("managedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("createdAt", "daysInWeek", "description", "id", "location", "managedAt", "managedById", "postedById", "publisher", "salary", "status", "studentGender", "subjects", "title", "tutorDepartmentNeed", "tutorGenderNeed", "tutorUniversityNeed", "tutorUniversityTypeNeed", "tutoringTime", "updatedAt") SELECT "createdAt", "daysInWeek", "description", "id", "location", "managedAt", "managedById", "postedById", "publisher", "salary", "status", "studentGender", "subjects", "title", "tutorDepartmentNeed", "tutorGenderNeed", "tutorUniversityNeed", "tutorUniversityTypeNeed", "tutoringTime", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
