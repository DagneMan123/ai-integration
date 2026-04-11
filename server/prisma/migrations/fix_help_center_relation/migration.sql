-- AlterTable: Add categoryId foreign key to help_center_articles
ALTER TABLE "help_center_articles" ADD COLUMN "category_id" INTEGER;

-- Update existing records to have a valid category_id (default to 1 if it exists)
UPDATE "help_center_articles" SET "category_id" = 1 WHERE "category_id" IS NULL;

-- Make category_id NOT NULL
ALTER TABLE "help_center_articles" ALTER COLUMN "category_id" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "help_center_articles" ADD CONSTRAINT "help_center_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "help_center_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old category column if it exists
ALTER TABLE "help_center_articles" DROP COLUMN IF EXISTS "category";

-- Create index on category_id
CREATE INDEX "help_center_articles_category_id_idx" ON "help_center_articles"("category_id");
