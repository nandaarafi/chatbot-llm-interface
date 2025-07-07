CREATE TABLE "app"."chat_session_documents" (
	"chat_session_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public"."token_usage" SET SCHEMA "app";
--> statement-breakpoint
ALTER TABLE "app"."sessions" RENAME TO "chat_session";--> statement-breakpoint
ALTER TABLE "app"."files" RENAME TO "documents";--> statement-breakpoint
ALTER TABLE "app"."documents" DROP CONSTRAINT "files_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "app"."documents" DROP CONSTRAINT "files_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "app"."messages" DROP CONSTRAINT "messages_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "app"."chat_session" DROP CONSTRAINT "sessions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "app"."chat_session" DROP CONSTRAINT "sessions_folder_id_folders_id_fk";
--> statement-breakpoint
ALTER TABLE "app"."chat_session_documents" ADD CONSTRAINT "chat_session_documents_chat_session_id_chat_session_id_fk" FOREIGN KEY ("chat_session_id") REFERENCES "app"."chat_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."chat_session_documents" ADD CONSTRAINT "chat_session_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "app"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."documents" ADD CONSTRAINT "documents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."messages" ADD CONSTRAINT "messages_session_id_chat_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "app"."chat_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."chat_session" ADD CONSTRAINT "chat_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."chat_session" ADD CONSTRAINT "chat_session_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "app"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."documents" DROP COLUMN "session_id";