-- CreateTable CreditBundle
CREATE TABLE "credit_bundles" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "creditAmount" INTEGER NOT NULL,
    "priceETB" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Insert default credit bundles
INSERT INTO "credit_bundles" ("name", "creditAmount", "priceETB", "is_active", "created_at", "updated_at") VALUES
('1 Credit', 1, 5.00, true, NOW(), NOW()),
('5 Credits', 5, 20.00, true, NOW(), NOW()),
('10 Credits', 10, 35.00, true, NOW(), NOW()),
('25 Credits', 25, 75.00, true, NOW(), NOW());
