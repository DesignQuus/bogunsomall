CREATE TABLE `admin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(64) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `registered_centers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`centerCode` varchar(32) NOT NULL,
	`centerName` varchar(128) NOT NULL,
	`bizNo` varchar(32),
	`address` text,
	`phone` varchar(32),
	`region` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registered_centers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signup_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`centerCode` varchar(32) NOT NULL,
	`centerName` varchar(128) NOT NULL,
	`deptName` varchar(64) NOT NULL,
	`managerName` varchar(64) NOT NULL,
	`deptCode` varchar(32),
	`phone` varchar(32),
	`email` varchar(320),
	`bizNo` varchar(32),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`issuedCode` varchar(64),
	`rejectReason` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `signup_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
