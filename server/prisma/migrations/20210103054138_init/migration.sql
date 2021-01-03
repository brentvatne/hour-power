-- CreateTable
CREATE TABLE "User" (
"id" SERIAL,
    "spotifyUserId" TEXT NOT NULL,
    "spotifyToken" TEXT NOT NULL,
    "spotifyRefreshToken" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.spotifyUserId_unique" ON "User"("spotifyUserId");
