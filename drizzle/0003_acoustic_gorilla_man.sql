PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chapter` (
	`number` integer,
	`fanfic_id` integer NOT NULL,
	`words_count` integer NOT NULL,
	PRIMARY KEY(`number`, `fanfic_id`),
	FOREIGN KEY (`fanfic_id`) REFERENCES `fanfic`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_chapter`("number", "fanfic_id", "words_count") SELECT "number", "fanfic_id", "words_count" FROM `chapter`;--> statement-breakpoint
DROP TABLE `chapter`;--> statement-breakpoint
ALTER TABLE `__new_chapter` RENAME TO `chapter`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `chapter_number_fanfic_id_idx` ON `chapter` (`number`,`fanfic_id`);