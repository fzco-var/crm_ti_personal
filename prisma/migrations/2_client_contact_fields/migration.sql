-- AlterTable
ALTER TABLE "client" ADD COLUMN     "city" VARCHAR(50),
ADD COLUMN     "notes" VARCHAR(255) NOT NULL,
ADD COLUMN     "office" VARCHAR(20) NOT NULL,
ADD COLUMN     "prefixnumber" VARCHAR(5),
ADD COLUMN     "region" VARCHAR(50);
