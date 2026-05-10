CREATE TABLE `namecard_designs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`centerCode` varchar(32) NOT NULL,
	`centerName` varchar(128) NOT NULL,
	`deptCode` varchar(32) NOT NULL,
	`deptName` varchar(64) NOT NULL,
	`frontImageUrl` text,
	`backImageUrl` text,
	`description` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`uploadedBy` varchar(64),
	`rejectReason` text,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `namecard_designs_id` PRIMARY KEY(`id`)
);
