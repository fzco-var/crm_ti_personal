-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."client" (
    "id_client" SERIAL NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(25) NOT NULL,
    "company" VARCHAR(40) NOT NULL,
    "number" VARCHAR(20),
    "email" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255),
    "id_rol" INTEGER,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "public"."project" (
    "id_project" SERIAL NOT NULL,
    "name_project" VARCHAR(40) NOT NULL,
    "id_client" INTEGER,
    "description" VARCHAR(255),
    "state" VARCHAR(20),
    "initial_date" DATE NOT NULL,
    "deadline" DATE NOT NULL,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "project_pkey" PRIMARY KEY ("id_project")
);

-- CreateTable
CREATE TABLE "public"."rol" (
    "id_rol" SERIAL NOT NULL,
    "rol" VARCHAR(10) NOT NULL,
    "intern_key" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id_services" SERIAL NOT NULL,
    "name_services" VARCHAR(100) NOT NULL,
    "id_client" INTEGER,
    "id_project" INTEGER,
    "charge_client" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "date_renovation" DATE NOT NULL,
    "expiration_days" VARCHAR NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id_services")
);

-- CreateTable
CREATE TABLE "public"."tickets" (
    "id_ticket" SERIAL NOT NULL,
    "name_ticket" VARCHAR(20) NOT NULL,
    "id_project" INTEGER,
    "assignee_id" INTEGER,
    "priority" VARCHAR(20),
    "state_ticket" VARCHAR(20),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id_ticket")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id_user" SERIAL NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(25) NOT NULL,
    "user_name" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_name_project_key" ON "public"."project"("name_project" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "public"."users"("user_name" ASC);

-- AddForeignKey
ALTER TABLE "public"."client" ADD CONSTRAINT "client_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."rol"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "public"."client"("id_client") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "public"."client"("id_client") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "public"."project"("id_project") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "public"."project"("id_project") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."rol"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;
