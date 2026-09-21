CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`direction` text NOT NULL,
	`description` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`due_on` text NOT NULL,
	`category` text NOT NULL,
	`counterparty` text,
	`origin` text NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_accounts_user_due` ON `accounts` (`user_id`,`due_on`);--> statement-breakpoint
CREATE INDEX `idx_accounts_user_direction` ON `accounts` (`user_id`,`direction`);--> statement-breakpoint
CREATE TABLE `barbers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`commission_percent` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_barbers_user_status` ON `barbers` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`origin` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_categories_user_origin` ON `categories` (`user_id`,`origin`);--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`barber_id` text NOT NULL,
	`service` text NOT NULL,
	`gross_cents` integer NOT NULL,
	`commission_cents` integer NOT NULL,
	`occurred_on` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_commissions_user_date` ON `commissions` (`user_id`,`occurred_on`);--> statement-breakpoint
CREATE INDEX `idx_commissions_barber` ON `commissions` (`barber_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`read_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_read` ON `notifications` (`user_id`,`read_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`business_name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`status` text NOT NULL,
	`parsed_json` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receipts_object_key_unique` ON `receipts` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_receipts_user_status` ON `receipts` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`origin` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`occurred_on` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`payment_method` text NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	`receipt_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_user_date` ON `transactions` (`user_id`,`occurred_on`);--> statement-breakpoint
CREATE INDEX `idx_transactions_user_origin` ON `transactions` (`user_id`,`origin`);--> statement-breakpoint
CREATE INDEX `idx_transactions_user_type` ON `transactions` (`user_id`,`type`);
--> statement-breakpoint
PRAGMA optimize;
