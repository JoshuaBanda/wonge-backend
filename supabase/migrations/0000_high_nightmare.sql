CREATE TABLE IF NOT EXISTS "comments" (
	"comment_id" serial PRIMARY KEY NOT NULL,
	"comment" text NOT NULL,
	"inventory_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inboxparticipants" (
	"userid" integer NOT NULL,
	"currentuser" integer NOT NULL,
	"inboxid" integer NOT NULL,
	CONSTRAINT "inboxparticipants_userid_currentuser_pk" PRIMARY KEY("userid","currentuser")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inbox" (
	"inboxid" serial PRIMARY KEY NOT NULL,
	"blocker" text NOT NULL,
	"block" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"photo_url" text NOT NULL,
	"photo_publlic_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "likes" (
	"like_id" serial PRIMARY KEY NOT NULL,
	"iventory_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"inboxid" integer NOT NULL,
	"userid" integer NOT NULL,
	"message" text NOT NULL,
	"createdat" timestamp DEFAULT now(),
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notificatios" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipientId" integer NOT NULL,
	"notification" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"userid" serial PRIMARY KEY NOT NULL,
	"firstname" text NOT NULL,
	"lastname" text NOT NULL,
	"profilepicture" text NOT NULL,
	"email" text,
	"password" text NOT NULL,
	"activationstatus" boolean NOT NULL,
	"sex" text NOT NULL,
	"dateofbirth" date NOT NULL,
	"phonenumber" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inboxparticipants" ADD CONSTRAINT "inboxparticipants_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inboxparticipants" ADD CONSTRAINT "inboxparticipants_currentuser_users_userid_fk" FOREIGN KEY ("currentuser") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inboxparticipants" ADD CONSTRAINT "inboxparticipants_inboxid_inbox_inboxid_fk" FOREIGN KEY ("inboxid") REFERENCES "public"."inbox"("inboxid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes" ADD CONSTRAINT "likes_iventory_id_inventory_id_fk" FOREIGN KEY ("iventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_inboxid_inbox_inboxid_fk" FOREIGN KEY ("inboxid") REFERENCES "public"."inbox"("inboxid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notificatios" ADD CONSTRAINT "notificatios_recipientId_users_userid_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "title_search_index" ON "users" USING gin (to_tsvector('english', "firstname"));