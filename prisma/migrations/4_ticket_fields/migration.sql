-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "due_date" DATE,
ADD COLUMN     "id_client" UUID,
ADD COLUMN     "number_ticket" SERIAL NOT NULL,
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "type_ticket" VARCHAR(20),
ADD COLUMN     "waiting_for" VARCHAR(255),
ALTER COLUMN "name_ticket" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "ticket_activity" (
    "id_activity" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_ticket" UUID NOT NULL,
    "id_user" UUID,
    "action" VARCHAR(50) NOT NULL,
    "text" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_activity_pkey" PRIMARY KEY ("id_activity")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_number_ticket_key" ON "tickets"("number_ticket");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_id_ticket_fkey" FOREIGN KEY ("id_ticket") REFERENCES "tickets"("id_ticket") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

