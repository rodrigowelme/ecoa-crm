-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "LostReason" AS ENUM ('PRICE', 'COMPETITOR', 'NO_RESPONSE', 'OTHER');

-- CreateTable
CREATE TABLE "stages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "StageType" NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "contactName" TEXT NOT NULL,
    "expectedCloseDate" DATE NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "closedAt" DATE,
    "lostReason" "LostReason",
    "sellerId" INTEGER NOT NULL,
    "stageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stages_order_key" ON "stages"("order");

-- CreateIndex
CREATE INDEX "deals_stageId_position_idx" ON "deals"("stageId", "position");

-- CreateIndex
CREATE INDEX "deals_sellerId_idx" ON "deals"("sellerId");

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
