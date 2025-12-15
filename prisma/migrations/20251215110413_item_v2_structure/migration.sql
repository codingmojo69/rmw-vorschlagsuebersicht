/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ItemTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `title` on the `Item` table. All the data in the column will be lost.
  - Added the required column `area` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `furnitureType` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelKey` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tag_name_key";

-- DropIndex
DROP INDEX "_ItemTags_B_index";

-- DropIndex
DROP INDEX "_ItemTags_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ItemTags";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "StyleTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ItemStyleTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ItemStyleTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ItemStyleTags_B_fkey" FOREIGN KEY ("B") REFERENCES "StyleTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelKey" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "furnitureType" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "suggestionNumbers" TEXT NOT NULL,
    "raster" TEXT,
    "baseType" TEXT,
    "depthCategory" TEXT,
    "headline" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Item" ("createdAt", "id", "imageUrl", "suggestionNumbers", "updatedAt") SELECT "createdAt", "id", "imageUrl", "suggestionNumbers", "updatedAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StyleTag_name_key" ON "StyleTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ItemStyleTags_AB_unique" ON "_ItemStyleTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemStyleTags_B_index" ON "_ItemStyleTags"("B");
