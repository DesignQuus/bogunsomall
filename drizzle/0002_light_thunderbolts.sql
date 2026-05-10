CREATE TABLE `saved_design_combos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deptCode` varchar(32) NOT NULL,
	`centerCode` varchar(32) NOT NULL,
	`label` varchar(128) NOT NULL,
	`frontType` varchar(16) NOT NULL,
	`backType` varchar(16),
	`doubleSided` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_design_combos_id` PRIMARY KEY(`id`)
);
