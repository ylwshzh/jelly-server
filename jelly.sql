/*
Source Host           : 127.0.0.1
Source Database       : jelly
Target Server Type    : MYSQL
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `session`
-- ----------------------------
DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(10),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of session
-- ----------------------------

-- ----------------------------
-- Table structure for `original_layout`
-- ----------------------------
DROP TABLE IF EXISTS `original_layout`;
CREATE TABLE `original_layout` (
  `level` int(11) NOT NULL,
  `layout` varchar(2048) NOT NULL,
  PRIMARY KEY (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of original_layout
-- ----------------------------

-- ----------------------------
-- Table structure for `cur_layout`
-- ----------------------------
DROP TABLE IF EXISTS `cur_layout`;
CREATE TABLE `cur_layout` (
  `session_id` varchar(10) NOT NULL,
  `level` int(11) NOT NULL,
  `layout` varchar(2048) NOT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of cur_layout
-- ----------------------------
