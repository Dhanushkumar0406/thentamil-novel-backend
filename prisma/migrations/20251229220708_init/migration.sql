-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "NovelStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChapterStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "reset_token" VARCHAR(255),
    "reset_token_expiry" TIMESTAMP(6),
    "last_login" TIMESTAMP(6),
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novels" (
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(500) NOT NULL,
    "author_name" VARCHAR(255) NOT NULL,
    "novel_summary" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "cover_image" VARCHAR(500),
    "status" "NovelStatus" NOT NULL DEFAULT 'DRAFT',
    "chapters_count" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,

    CONSTRAINT "novels_pkey" PRIMARY KEY ("public_id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" SERIAL NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "chapter_type" VARCHAR(100) NOT NULL,
    "thumbnail" VARCHAR(500),
    "content" TEXT NOT NULL,
    "status" "ChapterStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "novel_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novel_subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "novel_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novel_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "novel_id" UUID NOT NULL,
    "novel_title" VARCHAR(500) NOT NULL,
    "cover_image" VARCHAR(500),
    "author" VARCHAR(255) NOT NULL,
    "last_chapter" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novel_likes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "novel_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novel_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novel_bookmarks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "novel_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novel_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_novels_author_name" ON "novels"("author_name");

-- CreateIndex
CREATE INDEX "idx_novels_created_at" ON "novels"("created_at");

-- CreateIndex
CREATE INDEX "idx_novels_created_by" ON "novels"("created_by");

-- CreateIndex
CREATE INDEX "idx_novels_title" ON "novels"("title");

-- CreateIndex
CREATE INDEX "idx_novels_views" ON "novels"("views");

-- CreateIndex
CREATE INDEX "idx_novels_status" ON "novels"("status");

-- CreateIndex
CREATE INDEX "idx_chapters_novel_id" ON "chapters"("novel_id");

-- CreateIndex
CREATE INDEX "idx_chapters_title" ON "chapters"("title");

-- CreateIndex
CREATE INDEX "idx_chapters_created_by" ON "chapters"("created_by");

-- CreateIndex
CREATE INDEX "idx_chapters_chapter_number" ON "chapters"("chapter_number");

-- CreateIndex
CREATE INDEX "idx_chapters_status" ON "chapters"("status");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_novel_id_chapter_number_key" ON "chapters"("novel_id", "chapter_number");

-- CreateIndex
CREATE INDEX "idx_subscriptions_user_id" ON "novel_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_novel_id" ON "novel_subscriptions"("novel_id");

-- CreateIndex
CREATE UNIQUE INDEX "novel_subscriptions_user_id_novel_id_key" ON "novel_subscriptions"("user_id", "novel_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "idx_reading_progress_user_id" ON "reading_progress"("user_id");

-- CreateIndex
CREATE INDEX "idx_reading_progress_novel_id" ON "reading_progress"("novel_id");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_user_id_novel_id_key" ON "reading_progress"("user_id", "novel_id");

-- CreateIndex
CREATE INDEX "idx_novel_likes_user_id" ON "novel_likes"("user_id");

-- CreateIndex
CREATE INDEX "idx_novel_likes_novel_id" ON "novel_likes"("novel_id");

-- CreateIndex
CREATE UNIQUE INDEX "novel_likes_user_id_novel_id_key" ON "novel_likes"("user_id", "novel_id");

-- CreateIndex
CREATE INDEX "idx_novel_bookmarks_user_id" ON "novel_bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "idx_novel_bookmarks_novel_id" ON "novel_bookmarks"("novel_id");

-- CreateIndex
CREATE UNIQUE INDEX "novel_bookmarks_user_id_novel_id_key" ON "novel_bookmarks"("user_id", "novel_id");

-- AddForeignKey
ALTER TABLE "novels" ADD CONSTRAINT "novels_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novels" ADD CONSTRAINT "novels_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_subscriptions" ADD CONSTRAINT "novel_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_subscriptions" ADD CONSTRAINT "novel_subscriptions_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_likes" ADD CONSTRAINT "novel_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_likes" ADD CONSTRAINT "novel_likes_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_bookmarks" ADD CONSTRAINT "novel_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_bookmarks" ADD CONSTRAINT "novel_bookmarks_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;
