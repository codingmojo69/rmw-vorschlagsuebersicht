/*
  Warnings:

  - You are about to drop the `StyleTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ItemStyleTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `depthCategory` on the `Item` table. All the data in the column will be lost.
  - You are about to alter the column `suggestionNumbers` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - Added the required column `depthCm` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heightCm` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `styleTags` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `widthCm` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StyleTag_name_key";

-- DropIndex
DROP INDEX "_ItemStyleTags_B_index";

-- DropIndex
DROP INDEX "_ItemStyleTags_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StyleTag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ItemStyleTags";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "DimensionDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "minCm" REAL,
    "maxCm" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelKey" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "furnitureType" TEXT NOT NULL,
    "widthCm" REAL NOT NULL,
    "heightCm" REAL NOT NULL,
    "depthCm" REAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "suggestionNumbers" JSONB NOT NULL,
    "headline" TEXT,
    "raster" TEXT,
    "baseType" TEXT,
    "styleTags" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Item" ("area", "baseType", "createdAt", "furnitureType", "headline", "id", "imageUrl", "modelKey", "raster", "suggestionNumbers", "updatedAt") SELECT "area", "baseType", "createdAt", "furnitureType", "headline", "id", "imageUrl", "modelKey", "raster", "suggestionNumbers", "updatedAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
