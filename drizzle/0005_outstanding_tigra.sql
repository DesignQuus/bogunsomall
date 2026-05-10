CREATE TABLE `business_info` (
	`id` int AUTO_INCREMENT NOT NULL,
	`centerCode` varchar(32) NOT NULL,
	`centerName` varchar(128) NOT NULL,
	`bizNo` varchar(32) NOT NULL,
	`representative` varchar(64),
	`bizAddress` text,
	`bizType` varchar(64),
	`bizItem` varchar(64),
	`taxEmail` varchar(320),
	`registeredBy` varchar(64),
	`isDefault` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_info_id` PRIMARY KEY(`id`)
);
