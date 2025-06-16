PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_fanfic` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(256) NOT NULL,
	`url` text(256),
	`author` text(256) NOT NULL,
	`website` text(256) NOT NULL,
	`summary` text(256) NOT NULL,
	`likes_count` integer NOT NULL,
	`rating` text(256),
	`tags` text DEFAULT '[]' NOT NULL,
	`is_completed` integer NOT NULL,
	`fandom` text DEFAULT '[]' NOT NULL,
	`ships` text DEFAULT '[]' NOT NULL,
	`language` text(256) NOT NULL,
	`grade` integer,
	`user_id` text(255) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_fanfic`("id", "title", "url", "author", "website", "summary", "likes_count", "rating", "tags", "is_completed", "fandom", "ships", "language", "grade", "user_id", "created_at", "updatedAt") SELECT "id", "title", "url", "author", "website", "summary", "likes_count", "rating", "tags", "is_completed", "fandom", "ships", "language", "grade", "user_id", "created_at", "updatedAt" FROM `fanfic`;--> statement-breakpoint
DROP TABLE `fanfic`;--> statement-breakpoint
ALTER TABLE `__new_fanfic` RENAME TO `fanfic`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `fanfic_title_idx` ON `fanfic` (`title`);