CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chapter` (
	`number` integer,
	`fanfic_id` integer NOT NULL,
	`words_count` integer DEFAULT 0 NOT NULL,
	`url` text(256) DEFAULT '' NOT NULL,
	`title` text(256) DEFAULT '' NOT NULL,
	PRIMARY KEY(`number`, `fanfic_id`),
	FOREIGN KEY (`fanfic_id`) REFERENCES `fanfic`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chapter_number_fanfic_id_idx` ON `chapter` (`number`,`fanfic_id`);--> statement-breakpoint
CREATE TABLE `fanfic` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(256) NOT NULL,
	`url` text(256) NOT NULL,
	`author` text(256) NOT NULL,
	`website` text(256) NOT NULL,
	`summary` text(256) NOT NULL,
	`likes_count` integer NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`is_completed` integer NOT NULL,
	`fandom` text DEFAULT '[]' NOT NULL,
	`ships` text DEFAULT '[]' NOT NULL,
	`language` text(256) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE INDEX `fanfic_title_idx` ON `fanfic` (`title`);--> statement-breakpoint
CREATE TABLE `fanfics_to_shelves` (
	`fanfic_id` integer NOT NULL,
	`shelf_id` integer NOT NULL,
	PRIMARY KEY(`fanfic_id`, `shelf_id`),
	FOREIGN KEY (`fanfic_id`) REFERENCES `fanfic`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shelf_id`) REFERENCES `shelve`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `passkey` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`public_key` text NOT NULL,
	`user_id` text NOT NULL,
	`credential_i_d` text NOT NULL,
	`counter` integer NOT NULL,
	`device_type` text NOT NULL,
	`backed_up` integer NOT NULL,
	`transports` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`fanfic_id` integer NOT NULL,
	`chapter_number` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`chapter_number`, `fanfic_id`),
	FOREIGN KEY (`fanfic_id`) REFERENCES `fanfic`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `progress_fanfic_id_idx` ON `progress` (`fanfic_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `shelve` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`icon` text(256)
);
--> statement-breakpoint
CREATE INDEX `shelve_name_idx` ON `shelve` (`name`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`email` text NOT NULL,
	`role` text(255) DEFAULT 'user' NOT NULL,
	`image` text(255),
	`email_verified` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_name_idx` ON `user` (`name`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
