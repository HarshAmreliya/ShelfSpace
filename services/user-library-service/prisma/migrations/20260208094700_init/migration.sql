-- CreateTable
CREATE TABLE "ReadingList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingListBook" (
    "id" TEXT NOT NULL,
    "readingListId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReadingListBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingList_userId_idx" ON "ReadingList"("userId");

-- CreateIndex
CREATE INDEX "ReadingList_userId_isDefault_idx" ON "ReadingList"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "ReadingListBook_readingListId_idx" ON "ReadingListBook"("readingListId");

-- CreateIndex
CREATE INDEX "ReadingListBook_bookId_idx" ON "ReadingListBook"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingListBook_readingListId_bookId_key" ON "ReadingListBook"("readingListId", "bookId");

-- AddForeignKey
ALTER TABLE "ReadingListBook" ADD CONSTRAINT "ReadingListBook_readingListId_fkey" FOREIGN KEY ("readingListId") REFERENCES "ReadingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
