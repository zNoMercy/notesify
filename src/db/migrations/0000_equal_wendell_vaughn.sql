CREATE TABLE `annotations` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`path` text NOT NULL,
	`color` text NOT NULL,
	`size` integer NOT NULL,
	`page` integer NOT NULL,
	`pdf_id` text NOT NULL,
	FOREIGN KEY (`pdf_id`) REFERENCES `pdfs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `annotations_pdf_id_idx` ON `annotations` (`pdf_id`);--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chats_updated_at_idx` ON `chats` (`updated_at`);--> statement-breakpoint
CREATE INDEX `chats_created_at_idx` ON `chats` (`created_at`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`parent_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `files_parent_id_idx` ON `files` (`parent_id`);--> statement-breakpoint
CREATE INDEX `files_type_idx` ON `files` (`type`);--> statement-breakpoint
CREATE INDEX `files_created_at_idx` ON `files` (`created_at`);--> statement-breakpoint
CREATE INDEX `files_updated_at_idx` ON `files` (`updated_at`);--> statement-breakpoint
CREATE TABLE `highlights` (
	`id` text PRIMARY KEY NOT NULL,
	`rects` text NOT NULL,
	`color` text NOT NULL,
	`text` text NOT NULL,
	`page_number` integer NOT NULL,
	`pdf_id` text NOT NULL,
	FOREIGN KEY (`pdf_id`) REFERENCES `pdfs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `highlights_pdf_id_idx` ON `highlights` (`pdf_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`data` text,
	`annotations` text,
	`parts` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`pdf_id` text,
	`title` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pdf_id`) REFERENCES `pdfs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notes_pdf_id_idx` ON `notes` (`pdf_id`);--> statement-breakpoint
CREATE TABLE `pdf_parsing` (
	`id` text PRIMARY KEY NOT NULL,
	`pdf_id` text NOT NULL,
	`model` text NOT NULL,
	`text` text NOT NULL,
	`images` text NOT NULL,
	`page` integer NOT NULL,
	FOREIGN KEY (`pdf_id`) REFERENCES `pdfs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pdfs` (
	`id` text PRIMARY KEY NOT NULL,
	`page_count` integer NOT NULL,
	`scroll` text DEFAULT '{"x":0,"y":0}',
	`zoom` integer DEFAULT 1,
	FOREIGN KEY (`id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);
