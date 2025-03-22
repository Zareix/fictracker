CREATE TABLE `fanfics_to_shelves` (
	`fanfic_id` integer NOT NULL,
	`shelf_id` integer NOT NULL,
	PRIMARY KEY(`fanfic_id`, `shelf_id`),
	FOREIGN KEY (`fanfic_id`) REFERENCES `fanfic`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shelf_id`) REFERENCES `shelve`(`id`) ON UPDATE no action ON DELETE no action
);
