-- CreateEnum
CREATE TYPE "ModelKey" AS ENUM ('HARMONY', 'DEVISO', 'CONCETTO', 'SIENA', 'LAVITA', 'ENJOY', 'MANHATTAN', 'BRISTOL', 'ALLEGRO', 'DACAPO', 'CENTO', 'OPUS');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('BUERO', 'WOHNEN', 'SPEISEN', 'GARDEROBE', 'SCHLAFEN');

-- CreateEnum
CREATE TYPE "FurnitureType" AS ENUM ('SIDEBOARD', 'LOWBOARD', 'HIGHBOARD', 'VITRINE', 'KORPUSELEMENT', 'SCHRANK', 'REGAL');

-- CreateEnum
CREATE TYPE "Raster" AS ENUM ('RASTER_1_5', 'RASTER_2', 'RASTER_2_5', 'RASTER_3', 'RASTER_4', 'RASTER_5');

-- CreateEnum
CREATE TYPE "BaseType" AS ENUM ('FEET', 'FRAME');

-- CreateEnum
CREATE TYPE "DepthCategory" AS ENUM ('SLIM', 'STANDARD', 'DEEP');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "furnitureType" TEXT NOT NULL,
    "widthCm" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "depthCm" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "suggestionNumbers" JSONB NOT NULL,
    "headline" TEXT,
    "raster" TEXT,
    "baseType" TEXT,
    "styleTags" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DimensionDefinition" (
    "id" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "minCm" DOUBLE PRECISION,
    "maxCm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DimensionDefinition_pkey" PRIMARY KEY ("id")
);
