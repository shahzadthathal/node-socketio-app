-- Adminer 3.5.1 MySQL dump

SET NAMES utf8;
SET foreign_key_checks = 0;
SET time_zone = 'SYSTEM';
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

CREATE DATABASE `ob_support_system` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `ob_support_system`;

DROP TABLE IF EXISTS `support_message`;
CREATE TABLE `support_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `support_message` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`) VALUES
(4,	11,	0,	'My issue',	0),
(5,	11,	0,	'sadf asdf as asdf',	0),
(6,	11,	0,	'asdfas asdf',	0),
(7,	11,	0,	'sdfsdf',	0),
(8,	11,	0,	'sadfadsf',	0),
(9,	11,	0,	'1@1.comsdf asdf',	0),
(10,	11,	0,	'asdfasd',	0),
(11,	12,	0,	'user 2 is here',	0),
(12,	11,	0,	'asdfasdf',	0),
(13,	12,	0,	'sdf asdf asdf',	0),
(14,	13,	0,	'Hello I\'m jack',	0);

DROP TABLE IF EXISTS `support_user`;
CREATE TABLE `support_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(150) NOT NULL,
  `type` enum('Admin','Visitor','Memeber') NOT NULL DEFAULT 'Visitor',
  `is_login` tinyint(1) NOT NULL DEFAULT '0',
  `socketid` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `support_user` (`id`, `first_name`, `last_name`, `email`, `password`, `type`, `is_login`, `socketid`) VALUES
(1,	'Shahzad',	'Ssss',	'shahzad@app.com',	'123456',	'Admin',	0,	''),
(11,	'User 1',	'',	'1@1.com',	'',	'Visitor',	0,	'/#tf1gKfrkF_G9nxGWAAAD'),
(12,	'user 2',	'',	'2@2.com',	'',	'Visitor',	0,	'/#iCKJZUEVOt3dZUA2AAAE'),
(13,	'user 3',	'',	'3@3.com',	'',	'Visitor',	0,	'/#-9L1Jxtd0ISVkrNSAAAF');

-- 2016-09-02 17:37:30
