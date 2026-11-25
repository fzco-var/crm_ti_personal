-- AlterTable
ALTER TABLE "client" RENAME COLUMN "prefixnumber" TO "prefix_number";

-- AlterTable
ALTER TABLE "client" ALTER COLUMN "office" DROP NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL;

-- AlterTable
ALTER TABLE "rol" ALTER COLUMN "rol" SET DATA TYPE VARCHAR(20);
