import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "game_sounds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"volume" numeric DEFAULT 0.7,
  	"correct_sound_id" integer,
  	"incorrect_sound_id" integer,
  	"timeout_sound_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "supabase_user_id" varchar;
  ALTER TABLE "game_sounds" ADD CONSTRAINT "game_sounds_correct_sound_id_media_id_fk" FOREIGN KEY ("correct_sound_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "game_sounds" ADD CONSTRAINT "game_sounds_incorrect_sound_id_media_id_fk" FOREIGN KEY ("incorrect_sound_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "game_sounds" ADD CONSTRAINT "game_sounds_timeout_sound_id_media_id_fk" FOREIGN KEY ("timeout_sound_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "game_sounds_correct_sound_idx" ON "game_sounds" USING btree ("correct_sound_id");
  CREATE INDEX "game_sounds_incorrect_sound_idx" ON "game_sounds" USING btree ("incorrect_sound_id");
  CREATE INDEX "game_sounds_timeout_sound_idx" ON "game_sounds" USING btree ("timeout_sound_id");
  CREATE INDEX "users_supabase_user_id_idx" ON "users" USING btree ("supabase_user_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "game_sounds" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "game_sounds" CASCADE;
  DROP INDEX "users_supabase_user_id_idx";
  ALTER TABLE "users" DROP COLUMN "supabase_user_id";`)
}
