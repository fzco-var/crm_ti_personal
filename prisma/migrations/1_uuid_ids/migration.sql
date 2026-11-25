-- DropForeignKey
ALTER TABLE "client" DROP CONSTRAINT "client_id_rol_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_id_client_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_id_client_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_id_project_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_assignee_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_id_project_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_rol_fkey";

-- AlterTable
ALTER TABLE "client" DROP CONSTRAINT "client_pkey",
DROP COLUMN "id_client",
ADD COLUMN     "id_client" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "id_rol",
ADD COLUMN     "id_rol" UUID,
ADD CONSTRAINT "client_pkey" PRIMARY KEY ("id_client");

-- AlterTable
ALTER TABLE "project" DROP CONSTRAINT "project_pkey",
DROP COLUMN "id_project",
ADD COLUMN     "id_project" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "id_client",
ADD COLUMN     "id_client" UUID,
ADD CONSTRAINT "project_pkey" PRIMARY KEY ("id_project");

-- AlterTable
ALTER TABLE "rol" DROP CONSTRAINT "rol_pkey",
DROP COLUMN "id_rol",
ADD COLUMN     "id_rol" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol");

-- AlterTable
ALTER TABLE "services" DROP CONSTRAINT "services_pkey",
DROP COLUMN "id_services",
ADD COLUMN     "id_services" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "id_client",
ADD COLUMN     "id_client" UUID,
DROP COLUMN "id_project",
ADD COLUMN     "id_project" UUID,
ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id_services");

-- AlterTable
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_pkey",
DROP COLUMN "id_ticket",
ADD COLUMN     "id_ticket" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "id_project",
ADD COLUMN     "id_project" UUID,
DROP COLUMN "assignee_id",
ADD COLUMN     "assignee_id" UUID,
ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id_ticket");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id_user",
ADD COLUMN     "id_user" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "id_rol",
ADD COLUMN     "id_rol" UUID,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id_user");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "project"("id_project") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "project"("id_project") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;
