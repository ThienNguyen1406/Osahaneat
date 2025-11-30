-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: osahaneat
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total` bigint DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK867x3yysb1f3jk41cv3vsoejj` (`customer_id`),
  CONSTRAINT `FKrynrwuqbpdheocivcmp9itsxi` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (2,515000,3);
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `total_price` bigint DEFAULT NULL,
  `cart_id` int DEFAULT NULL,
  `food_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1uobyhgl1wvgt1jpccia8xxs3` (`cart_id`),
  KEY `FKcro8349ry4i72h81en8iw202g` (`food_id`),
  CONSTRAINT `FK1uobyhgl1wvgt1jpccia8xxs3` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`),
  CONSTRAINT `FKcro8349ry4i72h81en8iw202g` FOREIGN KEY (`food_id`) REFERENCES `food` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (21,1,181000,2,1697),(22,1,154000,2,1688),(23,1,180000,2,1337);
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `name_cate` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (11,'2025-11-26 22:55:17.000000','Cơm'),(12,'2025-11-26 22:55:17.000000','Pizza - Burger'),(13,'2025-11-26 22:55:17.000000','Gà - Vịt'),(14,'2025-11-26 22:55:17.000000','Tráng miệng'),(15,'2025-11-26 22:55:17.000000','Bún - Phở');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food`
--

DROP TABLE IF EXISTS `food`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_freeship` bit(1) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `time_ship` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `cate_id` int DEFAULT NULL,
  `is_available` bit(1) DEFAULT b'1' COMMENT 'Món có sẵn hay không',
  `shipping_fee` double DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FKo59k1adhw2ir457ukks6u5ok8` (`cate_id`),
  KEY `IDX_food_available` (`is_available`),
  CONSTRAINT `FKo59k1adhw2ir457ukks6u5ok8` FOREIGN KEY (`cate_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1765 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food`
--

LOCK TABLES `food` WRITE;
/*!40000 ALTER TABLE `food` DISABLE KEYS */;
INSERT INTO `food` VALUES (1006,'Món cơm thơm ngon số 1 với hương vị đậm đà','rice1.jpg',_binary '\0',52000,'30-45 phút','Rice 1',11,_binary '',0),(1007,'Món cơm thơm ngon số 2 với hương vị đậm đà','rice2.jpg',_binary '\0',54000,'30-45 phút','Rice 2',11,_binary '',0),(1008,'Món cơm thơm ngon số 3 với hương vị đậm đà','rice3.jpg',_binary '\0',56000,'30-45 phút','Rice 3',11,_binary '',0),(1009,'Món cơm thơm ngon số 4 với hương vị đậm đà','rice4.jpg',_binary '\0',58000,'30-45 phút','Rice 4',11,_binary '',0),(1010,'Món cơm thơm ngon số 5 với hương vị đậm đà','rice5.jpg',_binary '\0',60000,'30-45 phút','Rice 5',11,_binary '',0),(1011,'Món cơm thơm ngon số 6 với hương vị đậm đà','rice6.jpg',_binary '\0',62000,'30-45 phút','Rice 6',11,_binary '',0),(1012,'Món cơm thơm ngon số 7 với hương vị đậm đà','rice7.jpg',_binary '\0',64000,'30-45 phút','Rice 7',11,_binary '',0),(1013,'Món cơm thơm ngon số 8 với hương vị đậm đà','rice8.jpg',_binary '\0',66000,'30-45 phút','Rice 8',11,_binary '',0),(1014,'Món cơm thơm ngon số 9 với hương vị đậm đà','rice9.jpg',_binary '\0',68000,'30-45 phút','Rice 9',11,_binary '',0),(1015,'Món cơm thơm ngon số 10 với hương vị đậm đà','rice10.jpg',_binary '\0',70000,'30-45 phút','Rice 10',11,_binary '',0),(1016,'Món cơm thơm ngon số 11 với hương vị đậm đà','rice11.jpg',_binary '\0',72000,'30-45 phút','Rice 11',11,_binary '',0),(1017,'Món cơm thơm ngon số 12 với hương vị đậm đà','rice12.jpg',_binary '\0',74000,'30-45 phút','Rice 12',11,_binary '',0),(1018,'Món cơm thơm ngon số 13 với hương vị đậm đà','rice13.jpg',_binary '\0',76000,'30-45 phút','Rice 13',11,_binary '',0),(1019,'Món cơm thơm ngon số 14 với hương vị đậm đà','rice14.jpg',_binary '\0',78000,'30-45 phút','Rice 14',11,_binary '',0),(1020,'Món cơm thơm ngon số 15 với hương vị đậm đà','rice15.jpg',_binary '\0',80000,'30-45 phút','Rice 15',11,_binary '',0),(1021,'Món cơm thơm ngon số 16 với hương vị đậm đà','rice16.jpg',_binary '\0',82000,'30-45 phút','Rice 16',11,_binary '',0),(1022,'Món cơm thơm ngon số 17 với hương vị đậm đà','rice17.jpg',_binary '\0',84000,'30-45 phút','Rice 17',11,_binary '',0),(1023,'Món cơm thơm ngon số 18 với hương vị đậm đà','rice18.jpg',_binary '\0',86000,'30-45 phút','Rice 18',11,_binary '',0),(1024,'Món cơm thơm ngon số 19 với hương vị đậm đà','rice19.jpg',_binary '\0',88000,'30-45 phút','Rice 19',11,_binary '',0),(1025,'Món cơm thơm ngon số 20 với hương vị đậm đà','rice20.jpg',_binary '\0',90000,'30-45 phút','Rice 20',11,_binary '',0),(1026,'Món cơm thơm ngon số 21 với hương vị đậm đà','rice21.jpg',_binary '\0',92000,'30-45 phút','Rice 21',11,_binary '',0),(1027,'Món cơm thơm ngon số 22 với hương vị đậm đà','rice22.jpg',_binary '\0',94000,'30-45 phút','Rice 22',11,_binary '',0),(1028,'Món cơm thơm ngon số 23 với hương vị đậm đà','rice23.jpg',_binary '\0',96000,'30-45 phút','Rice 23',11,_binary '',0),(1029,'Món cơm thơm ngon số 24 với hương vị đậm đà','rice24.jpg',_binary '\0',98000,'30-45 phút','Rice 24',11,_binary '',0),(1030,'Món cơm thơm ngon số 25 với hương vị đậm đà','rice25.jpg',_binary '\0',100000,'30-45 phút','Rice 25',11,_binary '',0),(1031,'Món cơm thơm ngon số 26 với hương vị đậm đà','rice26.jpg',_binary '\0',102000,'30-45 phút','Rice 26',11,_binary '',0),(1032,'Món cơm thơm ngon số 27 với hương vị đậm đà','rice27.jpg',_binary '\0',104000,'30-45 phút','Rice 27',11,_binary '',0),(1033,'Món cơm thơm ngon số 28 với hương vị đậm đà','rice28.jpg',_binary '\0',106000,'30-45 phút','Rice 28',11,_binary '',0),(1034,'Món cơm thơm ngon số 29 với hương vị đậm đà','rice29.jpg',_binary '\0',108000,'30-45 phút','Rice 29',11,_binary '',0),(1035,'Món cơm thơm ngon số 30 với hương vị đậm đà','rice30.jpg',_binary '\0',110000,'30-45 phút','Rice 30',11,_binary '',0),(1036,'Món cơm thơm ngon số 31 với hương vị đậm đà','rice31.jpg',_binary '\0',112000,'30-45 phút','Rice 31',11,_binary '',0),(1037,'Món cơm thơm ngon số 32 với hương vị đậm đà','rice32.jpg',_binary '\0',114000,'30-45 phút','Rice 32',11,_binary '',0),(1038,'Món cơm thơm ngon số 33 với hương vị đậm đà','rice33.jpg',_binary '\0',116000,'30-45 phút','Rice 33',11,_binary '',0),(1039,'Món cơm thơm ngon số 34 với hương vị đậm đà','rice34.jpg',_binary '\0',118000,'30-45 phút','Rice 34',11,_binary '',0),(1040,'Món cơm thơm ngon số 35 với hương vị đậm đà','rice35.jpg',_binary '\0',120000,'30-45 phút','Rice 35',11,_binary '',0),(1069,'Pizza thơm ngon số 1 với nhiều topping hấp dẫn','pizza1.jpg',_binary '\0',155000,'25-40 phút','Pizza 1',12,_binary '',0),(1070,'Pizza thơm ngon số 2 với nhiều topping hấp dẫn','pizza2.jpg',_binary '\0',160000,'25-40 phút','Pizza 2',12,_binary '',0),(1071,'Pizza thơm ngon số 3 với nhiều topping hấp dẫn','pizza3.jpg',_binary '\0',165000,'25-40 phút','Pizza 3',12,_binary '',0),(1072,'Pizza thơm ngon số 4 với nhiều topping hấp dẫn','pizza4.jpg',_binary '\0',170000,'25-40 phút','Pizza 4',12,_binary '',0),(1073,'Pizza thơm ngon số 5 với nhiều topping hấp dẫn','pizza5.jpg',_binary '\0',175000,'25-40 phút','Pizza 5',12,_binary '',0),(1074,'Pizza thơm ngon số 6 với nhiều topping hấp dẫn','pizza6.jpg',_binary '\0',180000,'25-40 phút','Pizza 6',12,_binary '',0),(1075,'Pizza thơm ngon số 7 với nhiều topping hấp dẫn','pizza7.jpg',_binary '\0',185000,'25-40 phút','Pizza 7',12,_binary '',0),(1076,'Pizza thơm ngon số 8 với nhiều topping hấp dẫn','pizza8.jpg',_binary '\0',190000,'25-40 phút','Pizza 8',12,_binary '',0),(1077,'Pizza thơm ngon số 9 với nhiều topping hấp dẫn','pizza9.jpg',_binary '\0',195000,'25-40 phút','Pizza 9',12,_binary '',0),(1078,'Pizza thơm ngon số 10 với nhiều topping hấp dẫn','pizza10.jpg',_binary '\0',200000,'25-40 phút','Pizza 10',12,_binary '',0),(1079,'Pizza thơm ngon số 11 với nhiều topping hấp dẫn','pizza11.jpg',_binary '\0',205000,'25-40 phút','Pizza 11',12,_binary '',0),(1080,'Pizza thơm ngon số 12 với nhiều topping hấp dẫn','pizza12.jpg',_binary '\0',210000,'25-40 phút','Pizza 12',12,_binary '',0),(1081,'Pizza thơm ngon số 13 với nhiều topping hấp dẫn','pizza13.jpg',_binary '\0',215000,'25-40 phút','Pizza 13',12,_binary '',0),(1082,'Pizza thơm ngon số 14 với nhiều topping hấp dẫn','pizza14.jpg',_binary '\0',220000,'25-40 phút','Pizza 14',12,_binary '',0),(1083,'Pizza thơm ngon số 15 với nhiều topping hấp dẫn','pizza15.jpg',_binary '\0',225000,'25-40 phút','Pizza 15',12,_binary '',0),(1084,'Pizza thơm ngon số 16 với nhiều topping hấp dẫn','pizza16.jpg',_binary '\0',230000,'25-40 phút','Pizza 16',12,_binary '',0),(1085,'Pizza thơm ngon số 17 với nhiều topping hấp dẫn','pizza17.jpg',_binary '\0',235000,'25-40 phút','Pizza 17',12,_binary '',0),(1086,'Pizza thơm ngon số 18 với nhiều topping hấp dẫn','pizza18.jpg',_binary '\0',240000,'25-40 phút','Pizza 18',12,_binary '',0),(1087,'Pizza thơm ngon số 19 với nhiều topping hấp dẫn','pizza19.jpg',_binary '\0',245000,'25-40 phút','Pizza 19',12,_binary '',0),(1088,'Pizza thơm ngon số 20 với nhiều topping hấp dẫn','pizza20.jpg',_binary '\0',250000,'25-40 phút','Pizza 20',12,_binary '',0),(1089,'Pizza thơm ngon số 21 với nhiều topping hấp dẫn','pizza21.jpg',_binary '\0',255000,'25-40 phút','Pizza 21',12,_binary '',0),(1090,'Pizza thơm ngon số 22 với nhiều topping hấp dẫn','pizza22.jpg',_binary '\0',260000,'25-40 phút','Pizza 22',12,_binary '',0),(1091,'Pizza thơm ngon số 23 với nhiều topping hấp dẫn','pizza23.jpg',_binary '\0',265000,'25-40 phút','Pizza 23',12,_binary '',0),(1092,'Pizza thơm ngon số 24 với nhiều topping hấp dẫn','pizza24.jpg',_binary '\0',270000,'25-40 phút','Pizza 24',12,_binary '',0),(1093,'Pizza thơm ngon số 25 với nhiều topping hấp dẫn','pizza25.jpg',_binary '\0',275000,'25-40 phút','Pizza 25',12,_binary '',0),(1094,'Pizza thơm ngon số 26 với nhiều topping hấp dẫn','pizza26.jpg',_binary '\0',280000,'25-40 phút','Pizza 26',12,_binary '',0),(1095,'Pizza thơm ngon số 27 với nhiều topping hấp dẫn','pizza27.jpg',_binary '\0',285000,'25-40 phút','Pizza 27',12,_binary '',0),(1096,'Pizza thơm ngon số 28 với nhiều topping hấp dẫn','pizza28.jpg',_binary '\0',290000,'25-40 phút','Pizza 28',12,_binary '',0),(1097,'Pizza thơm ngon số 29 với nhiều topping hấp dẫn','pizza29.jpg',_binary '\0',295000,'25-40 phút','Pizza 29',12,_binary '',0),(1098,'Pizza thơm ngon số 30 với nhiều topping hấp dẫn','pizza30.jpg',_binary '\0',300000,'25-40 phút','Pizza 30',12,_binary '',0),(1099,'Pizza thơm ngon số 31 với nhiều topping hấp dẫn','pizza31.jpg',_binary '\0',305000,'25-40 phút','Pizza 31',12,_binary '',0),(1100,'Pizza thơm ngon số 32 với nhiều topping hấp dẫn','pizza32.jpg',_binary '\0',310000,'25-40 phút','Pizza 32',12,_binary '',0),(1101,'Pizza thơm ngon số 33 với nhiều topping hấp dẫn','pizza33.jpg',_binary '\0',315000,'25-40 phút','Pizza 33',12,_binary '',0),(1102,'Pizza thơm ngon số 34 với nhiều topping hấp dẫn','pizza34.jpg',_binary '\0',320000,'25-40 phút','Pizza 34',12,_binary '',0),(1103,'Pizza thơm ngon số 35 với nhiều topping hấp dẫn','pizza35.jpg',_binary '\0',325000,'25-40 phút','Pizza 35',12,_binary '',0),(1104,'Pizza thơm ngon số 36 với nhiều topping hấp dẫn','pizza36.jpg',_binary '\0',330000,'25-40 phút','Pizza 36',12,_binary '',0),(1105,'Pizza thơm ngon số 37 với nhiều topping hấp dẫn','pizza37.jpg',_binary '\0',335000,'25-40 phút','Pizza 37',12,_binary '',0),(1106,'Pizza thơm ngon số 38 với nhiều topping hấp dẫn','pizza38.jpg',_binary '\0',340000,'25-40 phút','Pizza 38',12,_binary '',0),(1107,'Pizza thơm ngon số 39 với nhiều topping hấp dẫn','pizza39.jpg',_binary '\0',345000,'25-40 phút','Pizza 39',12,_binary '',0),(1108,'Pizza thơm ngon số 40 với nhiều topping hấp dẫn','pizza40.jpg',_binary '\0',350000,'25-40 phút','Pizza 40',12,_binary '',0),(1109,'Pizza thơm ngon số 41 với nhiều topping hấp dẫn','pizza41.jpg',_binary '\0',355000,'25-40 phút','Pizza 41',12,_binary '',0),(1110,'Pizza thơm ngon số 42 với nhiều topping hấp dẫn','pizza42.jpg',_binary '\0',360000,'25-40 phút','Pizza 42',12,_binary '',0),(1111,'Pizza thơm ngon số 43 với nhiều topping hấp dẫn','pizza43.jpg',_binary '\0',365000,'25-40 phút','Pizza 43',12,_binary '',0),(1112,'Pizza thơm ngon số 44 với nhiều topping hấp dẫn','pizza44.jpg',_binary '\0',370000,'25-40 phút','Pizza 44',12,_binary '',0),(1113,'Pizza thơm ngon số 45 với nhiều topping hấp dẫn','pizza45.jpg',_binary '\0',375000,'25-40 phút','Pizza 45',12,_binary '',0),(1114,'Pizza thơm ngon số 46 với nhiều topping hấp dẫn','pizza46.jpg',_binary '\0',380000,'25-40 phút','Pizza 46',12,_binary '',0),(1115,'Pizza thơm ngon số 47 với nhiều topping hấp dẫn','pizza47.jpg',_binary '\0',385000,'25-40 phút','Pizza 47',12,_binary '',0),(1116,'Pizza thơm ngon số 48 với nhiều topping hấp dẫn','pizza48.jpg',_binary '\0',390000,'25-40 phút','Pizza 48',12,_binary '',0),(1117,'Pizza thơm ngon số 49 với nhiều topping hấp dẫn','pizza49.jpg',_binary '\0',395000,'25-40 phút','Pizza 49',12,_binary '',0),(1118,'Pizza thơm ngon số 50 với nhiều topping hấp dẫn','pizza50.jpg',_binary '\0',400000,'25-40 phút','Pizza 50',12,_binary '',0),(1119,'Pizza thơm ngon số 51 với nhiều topping hấp dẫn','pizza51.jpg',_binary '\0',405000,'25-40 phút','Pizza 51',12,_binary '',0),(1120,'Pizza thơm ngon số 52 với nhiều topping hấp dẫn','pizza52.jpg',_binary '\0',410000,'25-40 phút','Pizza 52',12,_binary '',0),(1121,'Pizza thơm ngon số 53 với nhiều topping hấp dẫn','pizza53.jpg',_binary '\0',415000,'25-40 phút','Pizza 53',12,_binary '',0),(1122,'Pizza thơm ngon số 54 với nhiều topping hấp dẫn','pizza54.jpg',_binary '\0',420000,'25-40 phút','Pizza 54',12,_binary '',0),(1123,'Pizza thơm ngon số 55 với nhiều topping hấp dẫn','pizza55.jpg',_binary '\0',425000,'25-40 phút','Pizza 55',12,_binary '',0),(1124,'Pizza thơm ngon số 56 với nhiều topping hấp dẫn','pizza56.jpg',_binary '\0',430000,'25-40 phút','Pizza 56',12,_binary '',0),(1125,'Pizza thơm ngon số 57 với nhiều topping hấp dẫn','pizza57.jpg',_binary '\0',435000,'25-40 phút','Pizza 57',12,_binary '',0),(1126,'Pizza thơm ngon số 58 với nhiều topping hấp dẫn','pizza58.jpg',_binary '\0',440000,'25-40 phút','Pizza 58',12,_binary '',0),(1127,'Pizza thơm ngon số 59 với nhiều topping hấp dẫn','pizza59.jpg',_binary '\0',445000,'25-40 phút','Pizza 59',12,_binary '',0),(1128,'Pizza thơm ngon số 60 với nhiều topping hấp dẫn','pizza60.jpg',_binary '\0',450000,'25-40 phút','Pizza 60',12,_binary '',0),(1129,'Pizza thơm ngon số 61 với nhiều topping hấp dẫn','pizza61.jpg',_binary '\0',455000,'25-40 phút','Pizza 61',12,_binary '',0),(1130,'Pizza thơm ngon số 62 với nhiều topping hấp dẫn','pizza62.jpg',_binary '\0',460000,'25-40 phút','Pizza 62',12,_binary '',0),(1131,'Pizza thơm ngon số 63 với nhiều topping hấp dẫn','pizza63.jpg',_binary '\0',465000,'25-40 phút','Pizza 63',12,_binary '',0),(1132,'Pizza thơm ngon số 64 với nhiều topping hấp dẫn','pizza64.jpg',_binary '\0',470000,'25-40 phút','Pizza 64',12,_binary '',0),(1133,'Pizza thơm ngon số 65 với nhiều topping hấp dẫn','pizza65.jpg',_binary '\0',475000,'25-40 phút','Pizza 65',12,_binary '',0),(1134,'Pizza thơm ngon số 66 với nhiều topping hấp dẫn','pizza66.jpg',_binary '\0',480000,'25-40 phút','Pizza 66',12,_binary '',0),(1135,'Pizza thơm ngon số 67 với nhiều topping hấp dẫn','pizza67.jpg',_binary '\0',485000,'25-40 phút','Pizza 67',12,_binary '',0),(1136,'Pizza thơm ngon số 68 với nhiều topping hấp dẫn','pizza68.jpg',_binary '\0',490000,'25-40 phút','Pizza 68',12,_binary '',0),(1137,'Pizza thơm ngon số 69 với nhiều topping hấp dẫn','pizza69.jpg',_binary '\0',495000,'25-40 phút','Pizza 69',12,_binary '',0),(1138,'Pizza thơm ngon số 70 với nhiều topping hấp dẫn','pizza70.jpg',_binary '\0',500000,'25-40 phút','Pizza 70',12,_binary '',0),(1139,'Pizza thơm ngon số 71 với nhiều topping hấp dẫn','pizza71.jpg',_binary '\0',505000,'25-40 phút','Pizza 71',12,_binary '',0),(1140,'Pizza thơm ngon số 72 với nhiều topping hấp dẫn','pizza72.jpg',_binary '\0',510000,'25-40 phút','Pizza 72',12,_binary '',0),(1141,'Pizza thơm ngon số 73 với nhiều topping hấp dẫn','pizza73.jpg',_binary '\0',515000,'25-40 phút','Pizza 73',12,_binary '',0),(1142,'Pizza thơm ngon số 74 với nhiều topping hấp dẫn','pizza74.jpg',_binary '\0',520000,'25-40 phút','Pizza 74',12,_binary '',0),(1143,'Pizza thơm ngon số 75 với nhiều topping hấp dẫn','pizza75.jpg',_binary '\0',525000,'25-40 phút','Pizza 75',12,_binary '',0),(1144,'Pizza thơm ngon số 76 với nhiều topping hấp dẫn','pizza76.jpg',_binary '\0',530000,'25-40 phút','Pizza 76',12,_binary '',0),(1145,'Pizza thơm ngon số 77 với nhiều topping hấp dẫn','pizza77.jpg',_binary '\0',535000,'25-40 phút','Pizza 77',12,_binary '',0),(1146,'Pizza thơm ngon số 78 với nhiều topping hấp dẫn','pizza78.jpg',_binary '\0',540000,'25-40 phút','Pizza 78',12,_binary '',0),(1147,'Pizza thơm ngon số 79 với nhiều topping hấp dẫn','pizza79.jpg',_binary '\0',545000,'25-40 phút','Pizza 79',12,_binary '',0),(1148,'Pizza thơm ngon số 80 với nhiều topping hấp dẫn','pizza80.jpg',_binary '\0',550000,'25-40 phút','Pizza 80',12,_binary '',0),(1149,'Pizza thơm ngon số 81 với nhiều topping hấp dẫn','pizza81.jpg',_binary '\0',555000,'25-40 phút','Pizza 81',12,_binary '',0),(1150,'Pizza thơm ngon số 82 với nhiều topping hấp dẫn','pizza82.jpg',_binary '\0',560000,'25-40 phút','Pizza 82',12,_binary '',0),(1151,'Pizza thơm ngon số 83 với nhiều topping hấp dẫn','pizza83.jpg',_binary '\0',565000,'25-40 phút','Pizza 83',12,_binary '',0),(1152,'Pizza thơm ngon số 84 với nhiều topping hấp dẫn','pizza84.jpg',_binary '\0',570000,'25-40 phút','Pizza 84',12,_binary '',0),(1153,'Pizza thơm ngon số 85 với nhiều topping hấp dẫn','pizza85.jpg',_binary '\0',575000,'25-40 phút','Pizza 85',12,_binary '',0),(1154,'Pizza thơm ngon số 86 với nhiều topping hấp dẫn','pizza86.jpg',_binary '\0',580000,'25-40 phút','Pizza 86',12,_binary '',0),(1155,'Pizza thơm ngon số 87 với nhiều topping hấp dẫn','pizza87.jpg',_binary '\0',585000,'25-40 phút','Pizza 87',12,_binary '',0),(1156,'Pizza thơm ngon số 88 với nhiều topping hấp dẫn','pizza88.jpg',_binary '\0',590000,'25-40 phút','Pizza 88',12,_binary '',0),(1157,'Pizza thơm ngon số 89 với nhiều topping hấp dẫn','pizza89.jpg',_binary '\0',595000,'25-40 phút','Pizza 89',12,_binary '',0),(1158,'Pizza thơm ngon số 90 với nhiều topping hấp dẫn','pizza90.jpg',_binary '\0',600000,'25-40 phút','Pizza 90',12,_binary '',0),(1159,'Pizza thơm ngon số 91 với nhiều topping hấp dẫn','pizza91.jpg',_binary '\0',605000,'25-40 phút','Pizza 91',12,_binary '',0),(1160,'Pizza thơm ngon số 92 với nhiều topping hấp dẫn','pizza92.jpg',_binary '\0',610000,'25-40 phút','Pizza 92',12,_binary '',0),(1161,'Pizza thơm ngon số 93 với nhiều topping hấp dẫn','pizza93.jpg',_binary '\0',615000,'25-40 phút','Pizza 93',12,_binary '',0),(1162,'Pizza thơm ngon số 94 với nhiều topping hấp dẫn','pizza94.jpg',_binary '\0',620000,'25-40 phút','Pizza 94',12,_binary '',0),(1163,'Pizza thơm ngon số 95 với nhiều topping hấp dẫn','pizza95.jpg',_binary '\0',625000,'25-40 phút','Pizza 95',12,_binary '',0),(1196,'Burger thơm ngon số 1 với thịt tươi và rau củ','burger1.jpg',_binary '\0',83000,'20-35 phút','Burger 1',12,_binary '',0),(1197,'Burger thơm ngon số 2 với thịt tươi và rau củ','burger2.jpg',_binary '\0',86000,'20-35 phút','Burger 2',12,_binary '',0),(1198,'Burger thơm ngon số 3 với thịt tươi và rau củ','burger3.jpg',_binary '\0',89000,'20-35 phút','Burger 3',12,_binary '',0),(1199,'Burger thơm ngon số 4 với thịt tươi và rau củ','burger4.jpg',_binary '\0',92000,'20-35 phút','Burger 4',12,_binary '',0),(1200,'Burger thơm ngon số 5 với thịt tươi và rau củ','burger5.jpg',_binary '\0',95000,'20-35 phút','Burger 5',12,_binary '',0),(1201,'Burger thơm ngon số 6 với thịt tươi và rau củ','burger6.jpg',_binary '\0',98000,'20-35 phút','Burger 6',12,_binary '',0),(1202,'Burger thơm ngon số 7 với thịt tươi và rau củ','burger7.jpg',_binary '\0',101000,'20-35 phút','Burger 7',12,_binary '',0),(1203,'Burger thơm ngon số 8 với thịt tươi và rau củ','burger8.jpg',_binary '\0',104000,'20-35 phút','Burger 8',12,_binary '',0),(1204,'Burger thơm ngon số 9 với thịt tươi và rau củ','burger9.jpg',_binary '\0',107000,'20-35 phút','Burger 9',12,_binary '',0),(1205,'Burger thơm ngon số 10 với thịt tươi và rau củ','burger10.jpg',_binary '\0',110000,'20-35 phút','Burger 10',12,_binary '',0),(1206,'Burger thơm ngon số 11 với thịt tươi và rau củ','burger11.jpg',_binary '\0',113000,'20-35 phút','Burger 11',12,_binary '',0),(1207,'Burger thơm ngon số 12 với thịt tươi và rau củ','burger12.jpg',_binary '\0',116000,'20-35 phút','Burger 12',12,_binary '',0),(1208,'Burger thơm ngon số 13 với thịt tươi và rau củ','burger13.jpg',_binary '\0',119000,'20-35 phút','Burger 13',12,_binary '',0),(1209,'Burger thơm ngon số 14 với thịt tươi và rau củ','burger14.jpg',_binary '\0',122000,'20-35 phút','Burger 14',12,_binary '',0),(1210,'Burger thơm ngon số 15 với thịt tươi và rau củ','burger15.jpg',_binary '\0',125000,'20-35 phút','Burger 15',12,_binary '',0),(1211,'Burger thơm ngon số 16 với thịt tươi và rau củ','burger16.jpg',_binary '\0',128000,'20-35 phút','Burger 16',12,_binary '',0),(1212,'Burger thơm ngon số 17 với thịt tươi và rau củ','burger17.jpg',_binary '\0',131000,'20-35 phút','Burger 17',12,_binary '',0),(1213,'Burger thơm ngon số 18 với thịt tươi và rau củ','burger18.jpg',_binary '\0',134000,'20-35 phút','Burger 18',12,_binary '',0),(1214,'Burger thơm ngon số 19 với thịt tươi và rau củ','burger19.jpg',_binary '\0',137000,'20-35 phút','Burger 19',12,_binary '',0),(1215,'Burger thơm ngon số 20 với thịt tươi và rau củ','burger20.jpg',_binary '\0',140000,'20-35 phút','Burger 20',12,_binary '',0),(1216,'Burger thơm ngon số 21 với thịt tươi và rau củ','burger21.jpg',_binary '\0',143000,'20-35 phút','Burger 21',12,_binary '',0),(1217,'Burger thơm ngon số 22 với thịt tươi và rau củ','burger22.jpg',_binary '\0',146000,'20-35 phút','Burger 22',12,_binary '',0),(1218,'Burger thơm ngon số 23 với thịt tươi và rau củ','burger23.jpg',_binary '\0',149000,'20-35 phút','Burger 23',12,_binary '',0),(1219,'Burger thơm ngon số 24 với thịt tươi và rau củ','burger24.jpg',_binary '\0',152000,'20-35 phút','Burger 24',12,_binary '',0),(1220,'Burger thơm ngon số 25 với thịt tươi và rau củ','burger25.jpg',_binary '\0',155000,'20-35 phút','Burger 25',12,_binary '',0),(1221,'Burger thơm ngon số 26 với thịt tươi và rau củ','burger26.jpg',_binary '\0',158000,'20-35 phút','Burger 26',12,_binary '',0),(1222,'Burger thơm ngon số 27 với thịt tươi và rau củ','burger27.jpg',_binary '\0',161000,'20-35 phút','Burger 27',12,_binary '',0),(1223,'Burger thơm ngon số 28 với thịt tươi và rau củ','burger28.jpg',_binary '\0',164000,'20-35 phút','Burger 28',12,_binary '',0),(1224,'Burger thơm ngon số 29 với thịt tươi và rau củ','burger29.jpg',_binary '\0',167000,'20-35 phút','Burger 29',12,_binary '',0),(1225,'Burger thơm ngon số 30 với thịt tươi và rau củ','burger30.jpg',_binary '\0',170000,'20-35 phút','Burger 30',12,_binary '',0),(1226,'Burger thơm ngon số 31 với thịt tươi và rau củ','burger31.jpg',_binary '\0',173000,'20-35 phút','Burger 31',12,_binary '',0),(1227,'Burger thơm ngon số 32 với thịt tươi và rau củ','burger32.jpg',_binary '\0',176000,'20-35 phút','Burger 32',12,_binary '',0),(1228,'Burger thơm ngon số 33 với thịt tươi và rau củ','burger33.jpg',_binary '\0',179000,'20-35 phút','Burger 33',12,_binary '',0),(1229,'Burger thơm ngon số 34 với thịt tươi và rau củ','burger34.jpg',_binary '\0',182000,'20-35 phút','Burger 34',12,_binary '',0),(1230,'Burger thơm ngon số 35 với thịt tươi và rau củ','burger35.jpg',_binary '\0',185000,'20-35 phút','Burger 35',12,_binary '',0),(1231,'Burger thơm ngon số 36 với thịt tươi và rau củ','burger36.jpg',_binary '\0',188000,'20-35 phút','Burger 36',12,_binary '',0),(1232,'Burger thơm ngon số 37 với thịt tươi và rau củ','burger37.jpg',_binary '\0',191000,'20-35 phút','Burger 37',12,_binary '',0),(1233,'Burger thơm ngon số 38 với thịt tươi và rau củ','burger38.jpg',_binary '\0',194000,'20-35 phút','Burger 38',12,_binary '',0),(1234,'Burger thơm ngon số 39 với thịt tươi và rau củ','burger39.jpg',_binary '\0',197000,'20-35 phút','Burger 39',12,_binary '',0),(1235,'Burger thơm ngon số 40 với thịt tươi và rau củ','burger40.jpg',_binary '\0',200000,'20-35 phút','Burger 40',12,_binary '',0),(1236,'Burger thơm ngon số 41 với thịt tươi và rau củ','burger41.jpg',_binary '\0',203000,'20-35 phút','Burger 41',12,_binary '',0),(1237,'Burger thơm ngon số 42 với thịt tươi và rau củ','burger42.jpg',_binary '\0',206000,'20-35 phút','Burger 42',12,_binary '',0),(1238,'Burger thơm ngon số 43 với thịt tươi và rau củ','burger43.jpg',_binary '\0',209000,'20-35 phút','Burger 43',12,_binary '',0),(1239,'Burger thơm ngon số 44 với thịt tươi và rau củ','burger44.jpg',_binary '\0',212000,'20-35 phút','Burger 44',12,_binary '',0),(1240,'Burger thơm ngon số 45 với thịt tươi và rau củ','burger45.jpg',_binary '\0',215000,'20-35 phút','Burger 45',12,_binary '',0),(1241,'Burger thơm ngon số 46 với thịt tươi và rau củ','burger46.jpg',_binary '\0',218000,'20-35 phút','Burger 46',12,_binary '',0),(1242,'Burger thơm ngon số 47 với thịt tươi và rau củ','burger47.jpg',_binary '\0',221000,'20-35 phút','Burger 47',12,_binary '',0),(1243,'Burger thơm ngon số 48 với thịt tươi và rau củ','burger48.jpg',_binary '\0',224000,'20-35 phút','Burger 48',12,_binary '',0),(1244,'Burger thơm ngon số 49 với thịt tươi và rau củ','burger49.jpg',_binary '\0',227000,'20-35 phút','Burger 49',12,_binary '',0),(1245,'Burger thơm ngon số 50 với thịt tươi và rau củ','burger50.jpg',_binary '\0',230000,'20-35 phút','Burger 50',12,_binary '',0),(1246,'Burger thơm ngon số 51 với thịt tươi và rau củ','burger51.jpg',_binary '\0',233000,'20-35 phút','Burger 51',12,_binary '',0),(1247,'Burger thơm ngon số 52 với thịt tươi và rau củ','burger52.jpg',_binary '\0',236000,'20-35 phút','Burger 52',12,_binary '',0),(1248,'Burger thơm ngon số 53 với thịt tươi và rau củ','burger53.jpg',_binary '\0',239000,'20-35 phút','Burger 53',12,_binary '',0),(1249,'Burger thơm ngon số 54 với thịt tươi và rau củ','burger54.jpg',_binary '\0',242000,'20-35 phút','Burger 54',12,_binary '',0),(1250,'Burger thơm ngon số 55 với thịt tươi và rau củ','burger55.jpg',_binary '\0',245000,'20-35 phút','Burger 55',12,_binary '',0),(1251,'Burger thơm ngon số 56 với thịt tươi và rau củ','burger56.jpg',_binary '\0',248000,'20-35 phút','Burger 56',12,_binary '',0),(1252,'Burger thơm ngon số 57 với thịt tươi và rau củ','burger57.jpg',_binary '\0',251000,'20-35 phút','Burger 57',12,_binary '',0),(1253,'Burger thơm ngon số 58 với thịt tươi và rau củ','burger58.jpg',_binary '\0',254000,'20-35 phút','Burger 58',12,_binary '',0),(1254,'Burger thơm ngon số 59 với thịt tươi và rau củ','burger59.jpg',_binary '\0',257000,'20-35 phút','Burger 59',12,_binary '',0),(1255,'Burger thơm ngon số 60 với thịt tươi và rau củ','burger60.jpg',_binary '\0',260000,'20-35 phút','Burger 60',12,_binary '',0),(1256,'Burger thơm ngon số 61 với thịt tươi và rau củ','burger61.jpg',_binary '\0',263000,'20-35 phút','Burger 61',12,_binary '',0),(1257,'Burger thơm ngon số 62 với thịt tươi và rau củ','burger62.jpg',_binary '\0',266000,'20-35 phút','Burger 62',12,_binary '',0),(1258,'Burger thơm ngon số 63 với thịt tươi và rau củ','burger63.jpg',_binary '\0',269000,'20-35 phút','Burger 63',12,_binary '',0),(1259,'Burger thơm ngon số 64 với thịt tươi và rau củ','burger64.jpg',_binary '\0',272000,'20-35 phút','Burger 64',12,_binary '',0),(1260,'Burger thơm ngon số 65 với thịt tươi và rau củ','burger65.jpg',_binary '\0',275000,'20-35 phút','Burger 65',12,_binary '',0),(1261,'Burger thơm ngon số 66 với thịt tươi và rau củ','burger66.jpg',_binary '\0',278000,'20-35 phút','Burger 66',12,_binary '',0),(1262,'Burger thơm ngon số 67 với thịt tươi và rau củ','burger67.jpg',_binary '\0',281000,'20-35 phút','Burger 67',12,_binary '',0),(1263,'Burger thơm ngon số 68 với thịt tươi và rau củ','burger68.jpg',_binary '\0',284000,'20-35 phút','Burger 68',12,_binary '',0),(1264,'Burger thơm ngon số 69 với thịt tươi và rau củ','burger69.jpg',_binary '\0',287000,'20-35 phút','Burger 69',12,_binary '',0),(1265,'Burger thơm ngon số 70 với thịt tươi và rau củ','burger70.jpg',_binary '\0',290000,'20-35 phút','Burger 70',12,_binary '',0),(1266,'Burger thơm ngon số 71 với thịt tươi và rau củ','burger71.jpg',_binary '\0',293000,'20-35 phút','Burger 71',12,_binary '',0),(1267,'Burger thơm ngon số 72 với thịt tươi và rau củ','burger72.jpg',_binary '\0',296000,'20-35 phút','Burger 72',12,_binary '',0),(1268,'Burger thơm ngon số 73 với thịt tươi và rau củ','burger73.jpg',_binary '\0',299000,'20-35 phút','Burger 73',12,_binary '',0),(1269,'Burger thơm ngon số 74 với thịt tươi và rau củ','burger74.jpg',_binary '\0',302000,'20-35 phút','Burger 74',12,_binary '',0),(1270,'Burger thơm ngon số 75 với thịt tươi và rau củ','burger75.jpg',_binary '\0',305000,'20-35 phút','Burger 75',12,_binary '',0),(1271,'Burger thơm ngon số 76 với thịt tươi và rau củ','burger76.jpg',_binary '\0',308000,'20-35 phút','Burger 76',12,_binary '',0),(1272,'Burger thơm ngon số 77 với thịt tươi và rau củ','burger77.jpg',_binary '\0',311000,'20-35 phút','Burger 77',12,_binary '',0),(1273,'Burger thơm ngon số 78 với thịt tươi và rau củ','burger78.jpg',_binary '\0',314000,'20-35 phút','Burger 78',12,_binary '',0),(1274,'Burger thơm ngon số 79 với thịt tươi và rau củ','burger79.jpg',_binary '\0',317000,'20-35 phút','Burger 79',12,_binary '',0),(1275,'Burger thơm ngon số 80 với thịt tươi và rau củ','burger80.jpg',_binary '\0',320000,'20-35 phút','Burger 80',12,_binary '',0),(1276,'Burger thơm ngon số 81 với thịt tươi và rau củ','burger81.jpg',_binary '\0',323000,'20-35 phút','Burger 81',12,_binary '',0),(1277,'Burger thơm ngon số 82 với thịt tươi và rau củ','burger82.jpg',_binary '\0',326000,'20-35 phút','Burger 82',12,_binary '',0),(1278,'Burger thơm ngon số 83 với thịt tươi và rau củ','burger83.jpg',_binary '\0',329000,'20-35 phút','Burger 83',12,_binary '',0),(1279,'Burger thơm ngon số 84 với thịt tươi và rau củ','burger84.jpg',_binary '\0',332000,'20-35 phút','Burger 84',12,_binary '',0),(1280,'Burger thơm ngon số 85 với thịt tươi và rau củ','burger85.jpg',_binary '\0',335000,'20-35 phút','Burger 85',12,_binary '',0),(1281,'Burger thơm ngon số 86 với thịt tươi và rau củ','burger86.jpg',_binary '\0',338000,'20-35 phút','Burger 86',12,_binary '',0),(1282,'Burger thơm ngon số 87 với thịt tươi và rau củ','burger87.jpg',_binary '\0',341000,'20-35 phút','Burger 87',12,_binary '',0),(1323,'Butter Chicken thơm ngon số 1 với sốt kem bơ đậm đà','butter-chicken1.jpg',_binary '\0',124000,'30-45 phút','Butter Chicken 1',13,_binary '',0),(1324,'Butter Chicken thơm ngon số 2 với sốt kem bơ đậm đà','butter-chicken2.jpg',_binary '\0',128000,'30-45 phút','Butter Chicken 2',13,_binary '',0),(1325,'Butter Chicken thơm ngon số 3 với sốt kem bơ đậm đà','butter-chicken3.jpg',_binary '\0',132000,'30-45 phút','Butter Chicken 3',13,_binary '',0),(1326,'Butter Chicken thơm ngon số 4 với sốt kem bơ đậm đà','butter-chicken4.jpg',_binary '\0',136000,'30-45 phút','Butter Chicken 4',13,_binary '',0),(1327,'Butter Chicken thơm ngon số 5 với sốt kem bơ đậm đà','butter-chicken5.jpg',_binary '\0',140000,'30-45 phút','Butter Chicken 5',13,_binary '',0),(1328,'Butter Chicken thơm ngon số 6 với sốt kem bơ đậm đà','butter-chicken6.jpg',_binary '\0',144000,'30-45 phút','Butter Chicken 6',13,_binary '',0),(1329,'Butter Chicken thơm ngon số 7 với sốt kem bơ đậm đà','butter-chicken7.jpg',_binary '\0',148000,'30-45 phút','Butter Chicken 7',13,_binary '',0),(1330,'Butter Chicken thơm ngon số 8 với sốt kem bơ đậm đà','butter-chicken8.jpg',_binary '\0',152000,'30-45 phút','Butter Chicken 8',13,_binary '',0),(1331,'Butter Chicken thơm ngon số 9 với sốt kem bơ đậm đà','butter-chicken9.jpg',_binary '\0',156000,'30-45 phút','Butter Chicken 9',13,_binary '',0),(1332,'Butter Chicken thơm ngon số 10 với sốt kem bơ đậm đà','butter-chicken10.jpg',_binary '\0',160000,'30-45 phút','Butter Chicken 10',13,_binary '',0),(1333,'Butter Chicken thơm ngon số 11 với sốt kem bơ đậm đà','butter-chicken11.jpg',_binary '\0',164000,'30-45 phút','Butter Chicken 11',13,_binary '',0),(1334,'Butter Chicken thơm ngon số 12 với sốt kem bơ đậm đà','butter-chicken12.jpg',_binary '\0',168000,'30-45 phút','Butter Chicken 12',13,_binary '',0),(1335,'Butter Chicken thơm ngon số 13 với sốt kem bơ đậm đà','butter-chicken13.jpg',_binary '\0',172000,'30-45 phút','Butter Chicken 13',13,_binary '',0),(1336,'Butter Chicken thơm ngon số 14 với sốt kem bơ đậm đà','butter-chicken14.jpg',_binary '\0',176000,'30-45 phút','Butter Chicken 14',13,_binary '',0),(1337,'Butter Chicken thơm ngon số 15 với sốt kem bơ đậm đà','butter-chicken15.jpg',_binary '\0',180000,'30-45 phút','Butter Chicken 15',13,_binary '',0),(1338,'Butter Chicken thơm ngon số 16 với sốt kem bơ đậm đà','butter-chicken16.jpg',_binary '\0',184000,'30-45 phút','Butter Chicken 16',13,_binary '',0),(1339,'Butter Chicken thơm ngon số 17 với sốt kem bơ đậm đà','butter-chicken17.jpg',_binary '\0',188000,'30-45 phút','Butter Chicken 17',13,_binary '',0),(1340,'Butter Chicken thơm ngon số 18 với sốt kem bơ đậm đà','butter-chicken18.jpg',_binary '\0',192000,'30-45 phút','Butter Chicken 18',13,_binary '',0),(1341,'Butter Chicken thơm ngon số 19 với sốt kem bơ đậm đà','butter-chicken19.jpg',_binary '\0',196000,'30-45 phút','Butter Chicken 19',13,_binary '',0),(1342,'Butter Chicken thơm ngon số 20 với sốt kem bơ đậm đà','butter-chicken20.jpg',_binary '\0',200000,'30-45 phút','Butter Chicken 20',13,_binary '',0),(1343,'Butter Chicken thơm ngon số 21 với sốt kem bơ đậm đà','butter-chicken21.jpg',_binary '\0',204000,'30-45 phút','Butter Chicken 21',13,_binary '',0),(1344,'Butter Chicken thơm ngon số 22 với sốt kem bơ đậm đà','butter-chicken22.jpg',_binary '\0',208000,'30-45 phút','Butter Chicken 22',13,_binary '',0),(1354,'Món tráng miệng ngọt ngào số 1 thơm ngon','dessert1.jpg',_binary '\0',42000,'15-25 phút','Dessert 1',14,_binary '',0),(1355,'Món tráng miệng ngọt ngào số 2 thơm ngon','dessert2.jpg',_binary '\0',44000,'15-25 phút','Dessert 2',14,_binary '',0),(1356,'Món tráng miệng ngọt ngào số 3 thơm ngon','dessert3.jpg',_binary '\0',46000,'15-25 phút','Dessert 3',14,_binary '',0),(1357,'Món tráng miệng ngọt ngào số 4 thơm ngon','dessert4.jpg',_binary '\0',48000,'15-25 phút','Dessert 4',14,_binary '',0),(1358,'Món tráng miệng ngọt ngào số 5 thơm ngon','dessert5.jpg',_binary '\0',50000,'15-25 phút','Dessert 5',14,_binary '',0),(1359,'Món tráng miệng ngọt ngào số 6 thơm ngon','dessert6.jpg',_binary '\0',52000,'15-25 phút','Dessert 6',14,_binary '',0),(1360,'Món tráng miệng ngọt ngào số 7 thơm ngon','dessert7.jpg',_binary '\0',54000,'15-25 phút','Dessert 7',14,_binary '',0),(1361,'Món tráng miệng ngọt ngào số 8 thơm ngon','dessert8.jpg',_binary '\0',56000,'15-25 phút','Dessert 8',14,_binary '',0),(1362,'Món tráng miệng ngọt ngào số 9 thơm ngon','dessert9.jpg',_binary '\0',58000,'15-25 phút','Dessert 9',14,_binary '',0),(1363,'Món tráng miệng ngọt ngào số 10 thơm ngon','dessert10.jpg',_binary '\0',60000,'15-25 phút','Dessert 10',14,_binary '',0),(1364,'Món tráng miệng ngọt ngào số 11 thơm ngon','dessert11.jpg',_binary '\0',62000,'15-25 phút','Dessert 11',14,_binary '',0),(1365,'Món tráng miệng ngọt ngào số 12 thơm ngon','dessert12.jpg',_binary '\0',64000,'15-25 phút','Dessert 12',14,_binary '',0),(1366,'Món tráng miệng ngọt ngào số 13 thơm ngon','dessert13.jpg',_binary '\0',66000,'15-25 phút','Dessert 13',14,_binary '',0),(1367,'Món tráng miệng ngọt ngào số 14 thơm ngon','dessert14.jpg',_binary '\0',68000,'15-25 phút','Dessert 14',14,_binary '',0),(1368,'Món tráng miệng ngọt ngào số 15 thơm ngon','dessert15.jpg',_binary '\0',70000,'15-25 phút','Dessert 15',14,_binary '',0),(1369,'Món tráng miệng ngọt ngào số 16 thơm ngon','dessert16.jpg',_binary '\0',72000,'15-25 phút','Dessert 16',14,_binary '',0),(1370,'Món tráng miệng ngọt ngào số 17 thơm ngon','dessert17.jpg',_binary '\0',74000,'15-25 phút','Dessert 17',14,_binary '',0),(1371,'Món tráng miệng ngọt ngào số 18 thơm ngon','dessert18.jpg',_binary '\0',76000,'15-25 phút','Dessert 18',14,_binary '',0),(1372,'Món tráng miệng ngọt ngào số 19 thơm ngon','dessert19.jpg',_binary '\0',78000,'15-25 phút','Dessert 19',14,_binary '',0),(1373,'Món tráng miệng ngọt ngào số 20 thơm ngon','dessert20.jpg',_binary '\0',80000,'15-25 phút','Dessert 20',14,_binary '',0),(1374,'Món tráng miệng ngọt ngào số 21 thơm ngon','dessert21.jpg',_binary '\0',82000,'15-25 phút','Dessert 21',14,_binary '',0),(1375,'Món tráng miệng ngọt ngào số 22 thơm ngon','dessert22.jpg',_binary '\0',84000,'15-25 phút','Dessert 22',14,_binary '',0),(1376,'Món tráng miệng ngọt ngào số 23 thơm ngon','dessert23.jpg',_binary '\0',86000,'15-25 phút','Dessert 23',14,_binary '',0),(1377,'Món tráng miệng ngọt ngào số 24 thơm ngon','dessert24.jpg',_binary '\0',88000,'15-25 phút','Dessert 24',14,_binary '',0),(1378,'Món tráng miệng ngọt ngào số 25 thơm ngon','dessert25.jpg',_binary '\0',90000,'15-25 phút','Dessert 25',14,_binary '',0),(1379,'Món tráng miệng ngọt ngào số 26 thơm ngon','dessert26.jpg',_binary '\0',92000,'15-25 phút','Dessert 26',14,_binary '',0),(1380,'Món tráng miệng ngọt ngào số 27 thơm ngon','dessert27.jpg',_binary '\0',94000,'15-25 phút','Dessert 27',14,_binary '',0),(1381,'Món tráng miệng ngọt ngào số 28 thơm ngon','dessert28.jpg',_binary '\0',96000,'15-25 phút','Dessert 28',14,_binary '',0),(1382,'Món tráng miệng ngọt ngào số 29 thơm ngon','dessert29.jpg',_binary '\0',98000,'15-25 phút','Dessert 29',14,_binary '',0),(1383,'Món tráng miệng ngọt ngào số 30 thơm ngon','dessert30.jpg',_binary '\0',100000,'15-25 phút','Dessert 30',14,_binary '',0),(1384,'Món tráng miệng ngọt ngào số 31 thơm ngon','dessert31.jpg',_binary '\0',102000,'15-25 phút','Dessert 31',14,_binary '',0),(1385,'Món tráng miệng ngọt ngào số 32 thơm ngon','dessert32.jpg',_binary '\0',104000,'15-25 phút','Dessert 32',14,_binary '',0),(1386,'Món tráng miệng ngọt ngào số 33 thơm ngon','dessert33.jpg',_binary '\0',106000,'15-25 phút','Dessert 33',14,_binary '',0),(1387,'Món tráng miệng ngọt ngào số 34 thơm ngon','dessert34.jpg',_binary '\0',108000,'15-25 phút','Dessert 34',14,_binary '',0),(1388,'Món tráng miệng ngọt ngào số 35 thơm ngon','dessert35.jpg',_binary '\0',110000,'15-25 phút','Dessert 35',14,_binary '',0),(1389,'Món tráng miệng ngọt ngào số 36 thơm ngon','dessert36.jpg',_binary '\0',112000,'15-25 phút','Dessert 36',14,_binary '',0),(1417,'Dosa truyền thống Ấn Độ số 1 thơm ngon','dosa1.jpg',_binary '\0',62500,'25-40 phút','Dosa 1',11,_binary '',0),(1418,'Dosa truyền thống Ấn Độ số 2 thơm ngon','dosa2.jpg',_binary '\0',65000,'25-40 phút','Dosa 2',11,_binary '',0),(1419,'Dosa truyền thống Ấn Độ số 3 thơm ngon','dosa3.jpg',_binary '\0',67500,'25-40 phút','Dosa 3',11,_binary '',0),(1420,'Dosa truyền thống Ấn Độ số 4 thơm ngon','dosa4.jpg',_binary '\0',70000,'25-40 phút','Dosa 4',11,_binary '',0),(1421,'Dosa truyền thống Ấn Độ số 5 thơm ngon','dosa5.jpg',_binary '\0',72500,'25-40 phút','Dosa 5',11,_binary '',0),(1422,'Dosa truyền thống Ấn Độ số 6 thơm ngon','dosa6.jpg',_binary '\0',75000,'25-40 phút','Dosa 6',11,_binary '',0),(1423,'Dosa truyền thống Ấn Độ số 7 thơm ngon','dosa7.jpg',_binary '\0',77500,'25-40 phút','Dosa 7',11,_binary '',0),(1424,'Dosa truyền thống Ấn Độ số 8 thơm ngon','dosa8.jpg',_binary '\0',80000,'25-40 phút','Dosa 8',11,_binary '',0),(1425,'Dosa truyền thống Ấn Độ số 9 thơm ngon','dosa9.jpg',_binary '\0',82500,'25-40 phút','Dosa 9',11,_binary '',0),(1426,'Dosa truyền thống Ấn Độ số 10 thơm ngon','dosa10.jpg',_binary '\0',85000,'25-40 phút','Dosa 10',11,_binary '',0),(1427,'Dosa truyền thống Ấn Độ số 11 thơm ngon','dosa11.jpg',_binary '\0',87500,'25-40 phút','Dosa 11',11,_binary '',0),(1428,'Dosa truyền thống Ấn Độ số 12 thơm ngon','dosa12.jpg',_binary '\0',90000,'25-40 phút','Dosa 12',11,_binary '',0),(1429,'Dosa truyền thống Ấn Độ số 13 thơm ngon','dosa13.jpg',_binary '\0',92500,'25-40 phút','Dosa 13',11,_binary '',0),(1430,'Dosa truyền thống Ấn Độ số 14 thơm ngon','dosa14.jpg',_binary '\0',95000,'25-40 phút','Dosa 14',11,_binary '',0),(1431,'Dosa truyền thống Ấn Độ số 15 thơm ngon','dosa15.jpg',_binary '\0',97500,'25-40 phút','Dosa 15',11,_binary '',0),(1432,'Dosa truyền thống Ấn Độ số 16 thơm ngon','dosa16.jpg',_binary '\0',100000,'25-40 phút','Dosa 16',11,_binary '',0),(1433,'Dosa truyền thống Ấn Độ số 17 thơm ngon','dosa17.jpg',_binary '\0',102500,'25-40 phút','Dosa 17',11,_binary '',0),(1434,'Dosa truyền thống Ấn Độ số 18 thơm ngon','dosa18.jpg',_binary '\0',105000,'25-40 phút','Dosa 18',11,_binary '',0),(1435,'Dosa truyền thống Ấn Độ số 19 thơm ngon','dosa19.jpg',_binary '\0',107500,'25-40 phút','Dosa 19',11,_binary '',0),(1436,'Dosa truyền thống Ấn Độ số 20 thơm ngon','dosa20.jpg',_binary '\0',110000,'25-40 phút','Dosa 20',11,_binary '',0),(1437,'Dosa truyền thống Ấn Độ số 21 thơm ngon','dosa21.jpg',_binary '\0',112500,'25-40 phút','Dosa 21',11,_binary '',0),(1438,'Dosa truyền thống Ấn Độ số 22 thơm ngon','dosa22.jpg',_binary '\0',115000,'25-40 phút','Dosa 22',11,_binary '',0),(1439,'Dosa truyền thống Ấn Độ số 23 thơm ngon','dosa23.jpg',_binary '\0',117500,'25-40 phút','Dosa 23',11,_binary '',0),(1440,'Dosa truyền thống Ấn Độ số 24 thơm ngon','dosa24.jpg',_binary '\0',120000,'25-40 phút','Dosa 24',11,_binary '',0),(1441,'Dosa truyền thống Ấn Độ số 25 thơm ngon','dosa25.jpg',_binary '\0',122500,'25-40 phút','Dosa 25',11,_binary '',0),(1442,'Dosa truyền thống Ấn Độ số 26 thơm ngon','dosa26.jpg',_binary '\0',125000,'25-40 phút','Dosa 26',11,_binary '',0),(1443,'Dosa truyền thống Ấn Độ số 27 thơm ngon','dosa27.jpg',_binary '\0',127500,'25-40 phút','Dosa 27',11,_binary '',0),(1444,'Dosa truyền thống Ấn Độ số 28 thơm ngon','dosa28.jpg',_binary '\0',130000,'25-40 phút','Dosa 28',11,_binary '',0),(1445,'Dosa truyền thống Ấn Độ số 29 thơm ngon','dosa29.jpg',_binary '\0',132500,'25-40 phút','Dosa 29',11,_binary '',0),(1446,'Dosa truyền thống Ấn Độ số 30 thơm ngon','dosa30.jpg',_binary '\0',135000,'25-40 phút','Dosa 30',11,_binary '',0),(1447,'Dosa truyền thống Ấn Độ số 31 thơm ngon','dosa31.jpg',_binary '\0',137500,'25-40 phút','Dosa 31',11,_binary '',0),(1448,'Dosa truyền thống Ấn Độ số 32 thơm ngon','dosa32.jpg',_binary '\0',140000,'25-40 phút','Dosa 32',11,_binary '',0),(1449,'Dosa truyền thống Ấn Độ số 33 thơm ngon','dosa33.jpg',_binary '\0',142500,'25-40 phút','Dosa 33',11,_binary '',0),(1450,'Dosa truyền thống Ấn Độ số 34 thơm ngon','dosa34.jpg',_binary '\0',145000,'25-40 phút','Dosa 34',11,_binary '',0),(1451,'Dosa truyền thống Ấn Độ số 35 thơm ngon','dosa35.jpg',_binary '\0',147500,'25-40 phút','Dosa 35',11,_binary '',0),(1452,'Dosa truyền thống Ấn Độ số 36 thơm ngon','dosa36.jpg',_binary '\0',150000,'25-40 phút','Dosa 36',11,_binary '',0),(1453,'Dosa truyền thống Ấn Độ số 37 thơm ngon','dosa37.jpg',_binary '\0',152500,'25-40 phút','Dosa 37',11,_binary '',0),(1454,'Dosa truyền thống Ấn Độ số 38 thơm ngon','dosa38.jpg',_binary '\0',155000,'25-40 phút','Dosa 38',11,_binary '',0),(1455,'Dosa truyền thống Ấn Độ số 39 thơm ngon','dosa39.jpg',_binary '\0',157500,'25-40 phút','Dosa 39',11,_binary '',0),(1456,'Dosa truyền thống Ấn Độ số 40 thơm ngon','dosa40.jpg',_binary '\0',160000,'25-40 phút','Dosa 40',11,_binary '',0),(1457,'Dosa truyền thống Ấn Độ số 41 thơm ngon','dosa41.jpg',_binary '\0',162500,'25-40 phút','Dosa 41',11,_binary '',0),(1458,'Dosa truyền thống Ấn Độ số 42 thơm ngon','dosa42.jpg',_binary '\0',165000,'25-40 phút','Dosa 42',11,_binary '',0),(1459,'Dosa truyền thống Ấn Độ số 43 thơm ngon','dosa43.jpg',_binary '\0',167500,'25-40 phút','Dosa 43',11,_binary '',0),(1460,'Dosa truyền thống Ấn Độ số 44 thơm ngon','dosa44.jpg',_binary '\0',170000,'25-40 phút','Dosa 44',11,_binary '',0),(1461,'Dosa truyền thống Ấn Độ số 45 thơm ngon','dosa45.jpg',_binary '\0',172500,'25-40 phút','Dosa 45',11,_binary '',0),(1462,'Dosa truyền thống Ấn Độ số 46 thơm ngon','dosa46.jpg',_binary '\0',175000,'25-40 phút','Dosa 46',11,_binary '',0),(1463,'Dosa truyền thống Ấn Độ số 47 thơm ngon','dosa47.jpg',_binary '\0',177500,'25-40 phút','Dosa 47',11,_binary '',0),(1464,'Dosa truyền thống Ấn Độ số 48 thơm ngon','dosa48.jpg',_binary '\0',180000,'25-40 phút','Dosa 48',11,_binary '',0),(1465,'Dosa truyền thống Ấn Độ số 49 thơm ngon','dosa49.jpg',_binary '\0',182500,'25-40 phút','Dosa 49',11,_binary '',0),(1466,'Dosa truyền thống Ấn Độ số 50 thơm ngon','dosa50.jpg',_binary '\0',185000,'25-40 phút','Dosa 50',11,_binary '',0),(1467,'Dosa truyền thống Ấn Độ số 51 thơm ngon','dosa51.jpg',_binary '\0',187500,'25-40 phút','Dosa 51',11,_binary '',0),(1468,'Dosa truyền thống Ấn Độ số 52 thơm ngon','dosa52.jpg',_binary '\0',190000,'25-40 phút','Dosa 52',11,_binary '',0),(1469,'Dosa truyền thống Ấn Độ số 53 thơm ngon','dosa53.jpg',_binary '\0',192500,'25-40 phút','Dosa 53',11,_binary '',0),(1470,'Dosa truyền thống Ấn Độ số 54 thơm ngon','dosa54.jpg',_binary '\0',195000,'25-40 phút','Dosa 54',11,_binary '',0),(1471,'Dosa truyền thống Ấn Độ số 55 thơm ngon','dosa55.jpg',_binary '\0',197500,'25-40 phút','Dosa 55',11,_binary '',0),(1472,'Dosa truyền thống Ấn Độ số 56 thơm ngon','dosa56.jpg',_binary '\0',200000,'25-40 phút','Dosa 56',11,_binary '',0),(1473,'Dosa truyền thống Ấn Độ số 57 thơm ngon','dosa57.jpg',_binary '\0',202500,'25-40 phút','Dosa 57',11,_binary '',0),(1474,'Dosa truyền thống Ấn Độ số 58 thơm ngon','dosa58.jpg',_binary '\0',205000,'25-40 phút','Dosa 58',11,_binary '',0),(1475,'Dosa truyền thống Ấn Độ số 59 thơm ngon','dosa59.jpg',_binary '\0',207500,'25-40 phút','Dosa 59',11,_binary '',0),(1476,'Dosa truyền thống Ấn Độ số 60 thơm ngon','dosa60.jpg',_binary '\0',210000,'25-40 phút','Dosa 60',11,_binary '',0),(1477,'Dosa truyền thống Ấn Độ số 61 thơm ngon','dosa61.jpg',_binary '\0',212500,'25-40 phút','Dosa 61',11,_binary '',0),(1478,'Dosa truyền thống Ấn Độ số 62 thơm ngon','dosa62.jpg',_binary '\0',215000,'25-40 phút','Dosa 62',11,_binary '',0),(1479,'Dosa truyền thống Ấn Độ số 63 thơm ngon','dosa63.jpg',_binary '\0',217500,'25-40 phút','Dosa 63',11,_binary '',0),(1480,'Dosa truyền thống Ấn Độ số 64 thơm ngon','dosa64.jpg',_binary '\0',220000,'25-40 phút','Dosa 64',11,_binary '',0),(1481,'Dosa truyền thống Ấn Độ số 65 thơm ngon','dosa65.jpg',_binary '\0',222500,'25-40 phút','Dosa 65',11,_binary '',0),(1482,'Dosa truyền thống Ấn Độ số 66 thơm ngon','dosa66.jpg',_binary '\0',225000,'25-40 phút','Dosa 66',11,_binary '',0),(1483,'Dosa truyền thống Ấn Độ số 67 thơm ngon','dosa67.jpg',_binary '\0',227500,'25-40 phút','Dosa 67',11,_binary '',0),(1484,'Dosa truyền thống Ấn Độ số 68 thơm ngon','dosa68.jpg',_binary '\0',230000,'25-40 phút','Dosa 68',11,_binary '',0),(1485,'Dosa truyền thống Ấn Độ số 69 thơm ngon','dosa69.jpg',_binary '\0',232500,'25-40 phút','Dosa 69',11,_binary '',0),(1486,'Dosa truyền thống Ấn Độ số 70 thơm ngon','dosa70.jpg',_binary '\0',235000,'25-40 phút','Dosa 70',11,_binary '',0),(1487,'Dosa truyền thống Ấn Độ số 71 thơm ngon','dosa71.jpg',_binary '\0',237500,'25-40 phút','Dosa 71',11,_binary '',0),(1488,'Dosa truyền thống Ấn Độ số 72 thơm ngon','dosa72.jpg',_binary '\0',240000,'25-40 phút','Dosa 72',11,_binary '',0),(1489,'Dosa truyền thống Ấn Độ số 73 thơm ngon','dosa73.jpg',_binary '\0',242500,'25-40 phút','Dosa 73',11,_binary '',0),(1490,'Dosa truyền thống Ấn Độ số 74 thơm ngon','dosa74.jpg',_binary '\0',245000,'25-40 phút','Dosa 74',11,_binary '',0),(1491,'Dosa truyền thống Ấn Độ số 75 thơm ngon','dosa75.jpg',_binary '\0',247500,'25-40 phút','Dosa 75',11,_binary '',0),(1492,'Dosa truyền thống Ấn Độ số 76 thơm ngon','dosa76.jpg',_binary '\0',250000,'25-40 phút','Dosa 76',11,_binary '',0),(1493,'Dosa truyền thống Ấn Độ số 77 thơm ngon','dosa77.jpg',_binary '\0',252500,'25-40 phút','Dosa 77',11,_binary '',0),(1494,'Dosa truyền thống Ấn Độ số 78 thơm ngon','dosa78.jpg',_binary '\0',255000,'25-40 phút','Dosa 78',11,_binary '',0),(1495,'Dosa truyền thống Ấn Độ số 79 thơm ngon','dosa79.jpg',_binary '\0',257500,'25-40 phút','Dosa 79',11,_binary '',0),(1496,'Dosa truyền thống Ấn Độ số 80 thơm ngon','dosa80.jpg',_binary '\0',260000,'25-40 phút','Dosa 80',11,_binary '',0),(1497,'Dosa truyền thống Ấn Độ số 81 thơm ngon','dosa81.jpg',_binary '\0',262500,'25-40 phút','Dosa 81',11,_binary '',0),(1498,'Dosa truyền thống Ấn Độ số 82 thơm ngon','dosa82.jpg',_binary '\0',265000,'25-40 phút','Dosa 82',11,_binary '',0),(1499,'Dosa truyền thống Ấn Độ số 83 thơm ngon','dosa83.jpg',_binary '\0',267500,'25-40 phút','Dosa 83',11,_binary '',0),(1544,'Idly truyền thống Ấn Độ số 1 thơm ngon','idly1.jpg',_binary '\0',52000,'20-35 phút','Idly 1',11,_binary '',0),(1545,'Idly truyền thống Ấn Độ số 2 thơm ngon','idly2.jpg',_binary '\0',54000,'20-35 phút','Idly 2',11,_binary '',0),(1546,'Idly truyền thống Ấn Độ số 3 thơm ngon','idly3.jpg',_binary '\0',56000,'20-35 phút','Idly 3',11,_binary '',0),(1547,'Idly truyền thống Ấn Độ số 4 thơm ngon','idly4.jpg',_binary '\0',58000,'20-35 phút','Idly 4',11,_binary '',0),(1548,'Idly truyền thống Ấn Độ số 5 thơm ngon','idly5.jpg',_binary '\0',60000,'20-35 phút','Idly 5',11,_binary '',0),(1549,'Idly truyền thống Ấn Độ số 6 thơm ngon','idly6.jpg',_binary '\0',62000,'20-35 phút','Idly 6',11,_binary '',0),(1550,'Idly truyền thống Ấn Độ số 7 thơm ngon','idly7.jpg',_binary '\0',64000,'20-35 phút','Idly 7',11,_binary '',0),(1551,'Idly truyền thống Ấn Độ số 8 thơm ngon','idly8.jpg',_binary '\0',66000,'20-35 phút','Idly 8',11,_binary '',0),(1552,'Idly truyền thống Ấn Độ số 9 thơm ngon','idly9.jpg',_binary '\0',68000,'20-35 phút','Idly 9',11,_binary '',0),(1553,'Idly truyền thống Ấn Độ số 10 thơm ngon','idly10.jpg',_binary '\0',70000,'20-35 phút','Idly 10',11,_binary '',0),(1554,'Idly truyền thống Ấn Độ số 11 thơm ngon','idly11.jpg',_binary '\0',72000,'20-35 phút','Idly 11',11,_binary '',0),(1555,'Idly truyền thống Ấn Độ số 12 thơm ngon','idly12.jpg',_binary '\0',74000,'20-35 phút','Idly 12',11,_binary '',0),(1556,'Idly truyền thống Ấn Độ số 13 thơm ngon','idly13.jpg',_binary '\0',76000,'20-35 phút','Idly 13',11,_binary '',0),(1557,'Idly truyền thống Ấn Độ số 14 thơm ngon','idly14.jpg',_binary '\0',78000,'20-35 phút','Idly 14',11,_binary '',0),(1558,'Idly truyền thống Ấn Độ số 15 thơm ngon','idly15.jpg',_binary '\0',80000,'20-35 phút','Idly 15',11,_binary '',0),(1559,'Idly truyền thống Ấn Độ số 16 thơm ngon','idly16.jpg',_binary '\0',82000,'20-35 phút','Idly 16',11,_binary '',0),(1560,'Idly truyền thống Ấn Độ số 17 thơm ngon','idly17.jpg',_binary '\0',84000,'20-35 phút','Idly 17',11,_binary '',0),(1561,'Idly truyền thống Ấn Độ số 18 thơm ngon','idly18.jpg',_binary '\0',86000,'20-35 phút','Idly 18',11,_binary '',0),(1562,'Idly truyền thống Ấn Độ số 19 thơm ngon','idly19.jpg',_binary '\0',88000,'20-35 phút','Idly 19',11,_binary '',0),(1563,'Idly truyền thống Ấn Độ số 20 thơm ngon','idly20.jpg',_binary '\0',90000,'20-35 phút','Idly 20',11,_binary '',0),(1564,'Idly truyền thống Ấn Độ số 21 thơm ngon','idly21.jpg',_binary '\0',92000,'20-35 phút','Idly 21',11,_binary '',0),(1565,'Idly truyền thống Ấn Độ số 22 thơm ngon','idly22.jpg',_binary '\0',94000,'20-35 phút','Idly 22',11,_binary '',0),(1566,'Idly truyền thống Ấn Độ số 23 thơm ngon','idly23.jpg',_binary '\0',96000,'20-35 phút','Idly 23',11,_binary '',0),(1567,'Idly truyền thống Ấn Độ số 24 thơm ngon','idly24.jpg',_binary '\0',98000,'20-35 phút','Idly 24',11,_binary '',0),(1568,'Idly truyền thống Ấn Độ số 25 thơm ngon','idly25.jpg',_binary '\0',100000,'20-35 phút','Idly 25',11,_binary '',0),(1569,'Idly truyền thống Ấn Độ số 26 thơm ngon','idly26.jpg',_binary '\0',102000,'20-35 phút','Idly 26',11,_binary '',0),(1570,'Idly truyền thống Ấn Độ số 27 thơm ngon','idly27.jpg',_binary '\0',104000,'20-35 phút','Idly 27',11,_binary '',0),(1571,'Idly truyền thống Ấn Độ số 28 thơm ngon','idly28.jpg',_binary '\0',106000,'20-35 phút','Idly 28',11,_binary '',0),(1572,'Idly truyền thống Ấn Độ số 29 thơm ngon','idly29.jpg',_binary '\0',108000,'20-35 phút','Idly 29',11,_binary '',0),(1573,'Idly truyền thống Ấn Độ số 30 thơm ngon','idly30.jpg',_binary '\0',110000,'20-35 phút','Idly 30',11,_binary '',0),(1574,'Idly truyền thống Ấn Độ số 31 thơm ngon','idly31.jpg',_binary '\0',112000,'20-35 phút','Idly 31',11,_binary '',0),(1575,'Idly truyền thống Ấn Độ số 32 thơm ngon','idly32.jpg',_binary '\0',114000,'20-35 phút','Idly 32',11,_binary '',0),(1576,'Idly truyền thống Ấn Độ số 33 thơm ngon','idly33.jpg',_binary '\0',116000,'20-35 phút','Idly 33',11,_binary '',0),(1577,'Idly truyền thống Ấn Độ số 34 thơm ngon','idly34.jpg',_binary '\0',118000,'20-35 phút','Idly 34',11,_binary '',0),(1578,'Idly truyền thống Ấn Độ số 35 thơm ngon','idly35.jpg',_binary '\0',120000,'20-35 phút','Idly 35',11,_binary '',0),(1579,'Idly truyền thống Ấn Độ số 36 thơm ngon','idly36.jpg',_binary '\0',122000,'20-35 phút','Idly 36',11,_binary '',0),(1580,'Idly truyền thống Ấn Độ số 37 thơm ngon','idly37.jpg',_binary '\0',124000,'20-35 phút','Idly 37',11,_binary '',0),(1581,'Idly truyền thống Ấn Độ số 38 thơm ngon','idly38.jpg',_binary '\0',126000,'20-35 phút','Idly 38',11,_binary '',0),(1582,'Idly truyền thống Ấn Độ số 39 thơm ngon','idly39.jpg',_binary '\0',128000,'20-35 phút','Idly 39',11,_binary '',0),(1583,'Idly truyền thống Ấn Độ số 40 thơm ngon','idly40.jpg',_binary '\0',130000,'20-35 phút','Idly 40',11,_binary '',0),(1584,'Idly truyền thống Ấn Độ số 41 thơm ngon','idly41.jpg',_binary '\0',132000,'20-35 phút','Idly 41',11,_binary '',0),(1585,'Idly truyền thống Ấn Độ số 42 thơm ngon','idly42.jpg',_binary '\0',134000,'20-35 phút','Idly 42',11,_binary '',0),(1586,'Idly truyền thống Ấn Độ số 43 thơm ngon','idly43.jpg',_binary '\0',136000,'20-35 phút','Idly 43',11,_binary '',0),(1587,'Idly truyền thống Ấn Độ số 44 thơm ngon','idly44.jpg',_binary '\0',138000,'20-35 phút','Idly 44',11,_binary '',0),(1588,'Idly truyền thống Ấn Độ số 45 thơm ngon','idly45.jpg',_binary '\0',140000,'20-35 phút','Idly 45',11,_binary '',0),(1589,'Idly truyền thống Ấn Độ số 46 thơm ngon','idly46.jpg',_binary '\0',142000,'20-35 phút','Idly 46',11,_binary '',0),(1590,'Idly truyền thống Ấn Độ số 47 thơm ngon','idly47.jpg',_binary '\0',144000,'20-35 phút','Idly 47',11,_binary '',0),(1591,'Idly truyền thống Ấn Độ số 48 thơm ngon','idly48.jpg',_binary '\0',146000,'20-35 phút','Idly 48',11,_binary '',0),(1592,'Idly truyền thống Ấn Độ số 49 thơm ngon','idly49.jpg',_binary '\0',148000,'20-35 phút','Idly 49',11,_binary '',0),(1593,'Idly truyền thống Ấn Độ số 50 thơm ngon','idly50.jpg',_binary '\0',150000,'20-35 phút','Idly 50',11,_binary '',0),(1594,'Idly truyền thống Ấn Độ số 51 thơm ngon','idly51.jpg',_binary '\0',152000,'20-35 phút','Idly 51',11,_binary '',0),(1595,'Idly truyền thống Ấn Độ số 52 thơm ngon','idly52.jpg',_binary '\0',154000,'20-35 phút','Idly 52',11,_binary '',0),(1596,'Idly truyền thống Ấn Độ số 53 thơm ngon','idly53.jpg',_binary '\0',156000,'20-35 phút','Idly 53',11,_binary '',0),(1597,'Idly truyền thống Ấn Độ số 54 thơm ngon','idly54.jpg',_binary '\0',158000,'20-35 phút','Idly 54',11,_binary '',0),(1598,'Idly truyền thống Ấn Độ số 55 thơm ngon','idly55.jpg',_binary '\0',160000,'20-35 phút','Idly 55',11,_binary '',0),(1599,'Idly truyền thống Ấn Độ số 56 thơm ngon','idly56.jpg',_binary '\0',162000,'20-35 phút','Idly 56',11,_binary '',0),(1600,'Idly truyền thống Ấn Độ số 57 thơm ngon','idly57.jpg',_binary '\0',164000,'20-35 phút','Idly 57',11,_binary '',0),(1601,'Idly truyền thống Ấn Độ số 58 thơm ngon','idly58.jpg',_binary '\0',166000,'20-35 phút','Idly 58',11,_binary '',0),(1602,'Idly truyền thống Ấn Độ số 59 thơm ngon','idly59.jpg',_binary '\0',168000,'20-35 phút','Idly 59',11,_binary '',0),(1603,'Idly truyền thống Ấn Độ số 60 thơm ngon','idly60.jpg',_binary '\0',170000,'20-35 phút','Idly 60',11,_binary '',0),(1604,'Idly truyền thống Ấn Độ số 61 thơm ngon','idly61.jpg',_binary '\0',172000,'20-35 phút','Idly 61',11,_binary '',0),(1605,'Idly truyền thống Ấn Độ số 62 thơm ngon','idly62.jpg',_binary '\0',174000,'20-35 phút','Idly 62',11,_binary '',0),(1606,'Idly truyền thống Ấn Độ số 63 thơm ngon','idly63.jpg',_binary '\0',176000,'20-35 phút','Idly 63',11,_binary '',0),(1607,'Idly truyền thống Ấn Độ số 64 thơm ngon','idly64.jpg',_binary '\0',178000,'20-35 phút','Idly 64',11,_binary '',0),(1608,'Idly truyền thống Ấn Độ số 65 thơm ngon','idly65.jpg',_binary '\0',180000,'20-35 phút','Idly 65',11,_binary '',0),(1609,'Idly truyền thống Ấn Độ số 66 thơm ngon','idly66.jpg',_binary '\0',182000,'20-35 phút','Idly 66',11,_binary '',0),(1610,'Idly truyền thống Ấn Độ số 67 thơm ngon','idly67.jpg',_binary '\0',184000,'20-35 phút','Idly 67',11,_binary '',0),(1611,'Idly truyền thống Ấn Độ số 68 thơm ngon','idly68.jpg',_binary '\0',186000,'20-35 phút','Idly 68',11,_binary '',0),(1612,'Idly truyền thống Ấn Độ số 69 thơm ngon','idly69.jpg',_binary '\0',188000,'20-35 phút','Idly 69',11,_binary '',0),(1613,'Idly truyền thống Ấn Độ số 70 thơm ngon','idly70.jpg',_binary '\0',190000,'20-35 phút','Idly 70',11,_binary '',0),(1614,'Idly truyền thống Ấn Độ số 71 thơm ngon','idly71.jpg',_binary '\0',192000,'20-35 phút','Idly 71',11,_binary '',0),(1615,'Idly truyền thống Ấn Độ số 72 thơm ngon','idly72.jpg',_binary '\0',194000,'20-35 phút','Idly 72',11,_binary '',0),(1616,'Idly truyền thống Ấn Độ số 73 thơm ngon','idly73.jpg',_binary '\0',196000,'20-35 phút','Idly 73',11,_binary '',0),(1617,'Idly truyền thống Ấn Độ số 74 thơm ngon','idly74.jpg',_binary '\0',198000,'20-35 phút','Idly 74',11,_binary '',0),(1618,'Idly truyền thống Ấn Độ số 75 thơm ngon','idly75.jpg',_binary '\0',200000,'20-35 phút','Idly 75',11,_binary '',0),(1619,'Idly truyền thống Ấn Độ số 76 thơm ngon','idly76.jpg',_binary '\0',202000,'20-35 phút','Idly 76',11,_binary '',0),(1620,'Idly truyền thống Ấn Độ số 77 thơm ngon','idly77.jpg',_binary '\0',204000,'20-35 phút','Idly 77',11,_binary '',0),(1671,'Pasta Ý thơm ngon số 1 với sốt đậm đà','pasta1.jpg',_binary '\0',103000,'25-40 phút','Pasta 1',15,_binary '',0),(1672,'Pasta Ý thơm ngon số 2 với sốt đậm đà','pasta2.jpg',_binary '\0',106000,'25-40 phút','Pasta 2',15,_binary '',0),(1673,'Pasta Ý thơm ngon số 3 với sốt đậm đà','pasta3.jpg',_binary '\0',109000,'25-40 phút','Pasta 3',15,_binary '',0),(1674,'Pasta Ý thơm ngon số 4 với sốt đậm đà','pasta4.jpg',_binary '\0',112000,'25-40 phút','Pasta 4',15,_binary '',0),(1675,'Pasta Ý thơm ngon số 5 với sốt đậm đà','pasta5.jpg',_binary '\0',115000,'25-40 phút','Pasta 5',15,_binary '',0),(1676,'Pasta Ý thơm ngon số 6 với sốt đậm đà','pasta6.jpg',_binary '\0',118000,'25-40 phút','Pasta 6',15,_binary '',0),(1677,'Pasta Ý thơm ngon số 7 với sốt đậm đà','pasta7.jpg',_binary '\0',121000,'25-40 phút','Pasta 7',15,_binary '',0),(1678,'Pasta Ý thơm ngon số 8 với sốt đậm đà','pasta8.jpg',_binary '\0',124000,'25-40 phút','Pasta 8',15,_binary '',0),(1679,'Pasta Ý thơm ngon số 9 với sốt đậm đà','pasta9.jpg',_binary '\0',127000,'25-40 phút','Pasta 9',15,_binary '',0),(1680,'Pasta Ý thơm ngon số 10 với sốt đậm đà','pasta10.jpg',_binary '\0',130000,'25-40 phút','Pasta 10',15,_binary '',0),(1681,'Pasta Ý thơm ngon số 11 với sốt đậm đà','pasta11.jpg',_binary '\0',133000,'25-40 phút','Pasta 11',15,_binary '',0),(1682,'Pasta Ý thơm ngon số 12 với sốt đậm đà','pasta12.jpg',_binary '\0',136000,'25-40 phút','Pasta 12',15,_binary '',0),(1683,'Pasta Ý thơm ngon số 13 với sốt đậm đà','pasta13.jpg',_binary '\0',139000,'25-40 phút','Pasta 13',15,_binary '',0),(1684,'Pasta Ý thơm ngon số 14 với sốt đậm đà','pasta14.jpg',_binary '\0',142000,'25-40 phút','Pasta 14',15,_binary '',0),(1685,'Pasta Ý thơm ngon số 15 với sốt đậm đà','pasta15.jpg',_binary '\0',145000,'25-40 phút','Pasta 15',15,_binary '',0),(1686,'Pasta Ý thơm ngon số 16 với sốt đậm đà','pasta16.jpg',_binary '\0',148000,'25-40 phút','Pasta 16',15,_binary '',0),(1687,'Pasta Ý thơm ngon số 17 với sốt đậm đà','pasta17.jpg',_binary '\0',151000,'25-40 phút','Pasta 17',15,_binary '',0),(1688,'Pasta Ý thơm ngon số 18 với sốt đậm đà','pasta18.jpg',_binary '\0',154000,'25-40 phút','Pasta 18',15,_binary '',0),(1689,'Pasta Ý thơm ngon số 19 với sốt đậm đà','pasta19.jpg',_binary '\0',157000,'25-40 phút','Pasta 19',15,_binary '',0),(1690,'Pasta Ý thơm ngon số 20 với sốt đậm đà','pasta20.jpg',_binary '\0',160000,'25-40 phút','Pasta 20',15,_binary '',0),(1691,'Pasta Ý thơm ngon số 21 với sốt đậm đà','pasta21.jpg',_binary '\0',163000,'25-40 phút','Pasta 21',15,_binary '',0),(1692,'Pasta Ý thơm ngon số 22 với sốt đậm đà','pasta22.jpg',_binary '\0',166000,'25-40 phút','Pasta 22',15,_binary '',0),(1693,'Pasta Ý thơm ngon số 23 với sốt đậm đà','pasta23.jpg',_binary '\0',169000,'25-40 phút','Pasta 23',15,_binary '',0),(1694,'Pasta Ý thơm ngon số 24 với sốt đậm đà','pasta24.jpg',_binary '\0',172000,'25-40 phút','Pasta 24',15,_binary '',0),(1695,'Pasta Ý thơm ngon số 25 với sốt đậm đà','pasta25.jpg',_binary '\0',175000,'25-40 phút','Pasta 25',15,_binary '',0),(1696,'Pasta Ý thơm ngon số 26 với sốt đậm đà','pasta26.jpg',_binary '\0',178000,'25-40 phút','Pasta 26',15,_binary '',0),(1697,'Pasta Ý thơm ngon số 27 với sốt đậm đà','pasta27.jpg',_binary '\0',181000,'25-40 phút','Pasta 27',15,_binary '',0),(1698,'Pasta Ý thơm ngon số 28 với sốt đậm đà','pasta28.jpg',_binary '\0',184000,'25-40 phút','Pasta 28',15,_binary '',0),(1699,'Pasta Ý thơm ngon số 29 với sốt đậm đà','pasta29.jpg',_binary '\0',187000,'25-40 phút','Pasta 29',15,_binary '',0),(1700,'Pasta Ý thơm ngon số 30 với sốt đậm đà','pasta30.jpg',_binary '\0',190000,'25-40 phút','Pasta 30',15,_binary '',0),(1701,'Pasta Ý thơm ngon số 31 với sốt đậm đà','pasta31.jpg',_binary '\0',193000,'25-40 phút','Pasta 31',15,_binary '',0),(1702,'Pasta Ý thơm ngon số 32 với sốt đậm đà','pasta32.jpg',_binary '\0',196000,'25-40 phút','Pasta 32',15,_binary '',0),(1703,'Pasta Ý thơm ngon số 33 với sốt đậm đà','pasta33.jpg',_binary '\0',199000,'25-40 phút','Pasta 33',15,_binary '',0),(1704,'Pasta Ý thơm ngon số 34 với sốt đậm đà','pasta34.jpg',_binary '\0',202000,'25-40 phút','Pasta 34',15,_binary '',0),(1734,'Samosa truyền thống Ấn Độ số 1 thơm ngon','samosa1.jpg',_binary '\0',47000,'20-30 phút','Samosa 1',11,_binary '',0),(1735,'Samosa truyền thống Ấn Độ số 2 thơm ngon','samosa2.jpg',_binary '\0',49000,'20-30 phút','Samosa 2',11,_binary '',0),(1736,'Samosa truyền thống Ấn Độ số 3 thơm ngon','samosa3.jpg',_binary '\0',51000,'20-30 phút','Samosa 3',11,_binary '',0),(1737,'Samosa truyền thống Ấn Độ số 4 thơm ngon','samosa4.jpg',_binary '\0',53000,'20-30 phút','Samosa 4',11,_binary '',0),(1738,'Samosa truyền thống Ấn Độ số 5 thơm ngon','samosa5.jpg',_binary '\0',55000,'20-30 phút','Samosa 5',11,_binary '',0),(1739,'Samosa truyền thống Ấn Độ số 6 thơm ngon','samosa6.jpg',_binary '\0',57000,'20-30 phút','Samosa 6',11,_binary '',0),(1740,'Samosa truyền thống Ấn Độ số 7 thơm ngon','samosa7.jpg',_binary '\0',59000,'20-30 phút','Samosa 7',11,_binary '',0),(1741,'Samosa truyền thống Ấn Độ số 8 thơm ngon','samosa8.jpg',_binary '\0',61000,'20-30 phút','Samosa 8',11,_binary '',0),(1742,'Samosa truyền thống Ấn Độ số 9 thơm ngon','samosa9.jpg',_binary '\0',63000,'20-30 phút','Samosa 9',11,_binary '',0),(1743,'Samosa truyền thống Ấn Độ số 10 thơm ngon','samosa10.jpg',_binary '\0',65000,'20-30 phút','Samosa 10',11,_binary '',0),(1744,'Samosa truyền thống Ấn Độ số 11 thơm ngon','samosa11.jpg',_binary '\0',67000,'20-30 phút','Samosa 11',11,_binary '',0),(1745,'Samosa truyền thống Ấn Độ số 12 thơm ngon','samosa12.jpg',_binary '\0',69000,'20-30 phút','Samosa 12',11,_binary '',0),(1746,'Samosa truyền thống Ấn Độ số 13 thơm ngon','samosa13.jpg',_binary '\0',71000,'20-30 phút','Samosa 13',11,_binary '',0),(1747,'Samosa truyền thống Ấn Độ số 14 thơm ngon','samosa14.jpg',_binary '\0',73000,'20-30 phút','Samosa 14',11,_binary '',0),(1748,'Samosa truyền thống Ấn Độ số 15 thơm ngon','samosa15.jpg',_binary '\0',75000,'20-30 phút','Samosa 15',11,_binary '',0),(1749,'Samosa truyền thống Ấn Độ số 16 thơm ngon','samosa16.jpg',_binary '\0',77000,'20-30 phút','Samosa 16',11,_binary '',0),(1750,'Samosa truyền thống Ấn Độ số 17 thơm ngon','samosa17.jpg',_binary '\0',79000,'20-30 phút','Samosa 17',11,_binary '',0),(1751,'Samosa truyền thống Ấn Độ số 18 thơm ngon','samosa18.jpg',_binary '\0',81000,'20-30 phút','Samosa 18',11,_binary '',0),(1752,'Samosa truyền thống Ấn Độ số 19 thơm ngon','samosa19.jpg',_binary '\0',83000,'20-30 phút','Samosa 19',11,_binary '',0),(1753,'Samosa truyền thống Ấn Độ số 20 thơm ngon','samosa20.jpg',_binary '\0',85000,'20-30 phút','Samosa 20',11,_binary '',0),(1754,'Samosa truyền thống Ấn Độ số 21 thơm ngon','samosa21.jpg',_binary '\0',87000,'20-30 phút','Samosa 21',11,_binary '',0),(1755,'Samosa truyền thống Ấn Độ số 22 thơm ngon','samosa22.jpg',_binary '\0',89000,'20-30 phút','Samosa 22',11,_binary '',0);
/*!40000 ALTER TABLE `food` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invalidated_token`
--

DROP TABLE IF EXISTS `invalidated_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invalidated_token` (
  `id` varchar(255) NOT NULL,
  `expiry_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invalidated_token`
--

LOCK TABLES `invalidated_token` WRITE;
/*!40000 ALTER TABLE `invalidated_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `invalidated_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_restaurant`
--

DROP TABLE IF EXISTS `menu_restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_restaurant` (
  `cate_id` int NOT NULL,
  `res_id` int NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `create_date` datetime(6) DEFAULT NULL,
  `update_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`cate_id`,`res_id`),
  KEY `FKovgqil4wlu0m3atpsq3bw6wql` (`res_id`),
  CONSTRAINT `FKm8l9omw05to6e05482q19gu41` FOREIGN KEY (`cate_id`) REFERENCES `category` (`id`),
  CONSTRAINT `FKovgqil4wlu0m3atpsq3bw6wql` FOREIGN KEY (`res_id`) REFERENCES `restaurant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_restaurant`
--

LOCK TABLES `menu_restaurant` WRITE;
/*!40000 ALTER TABLE `menu_restaurant` DISABLE KEYS */;
INSERT INTO `menu_restaurant` VALUES (11,22,'2025-11-26 22:55:17.000000',NULL,NULL),(11,23,'2025-11-26 22:55:17.000000',NULL,NULL),(11,24,'2025-11-26 22:55:17.000000',NULL,NULL),(11,25,'2025-11-26 22:55:17.000000',NULL,NULL),(11,26,'2025-11-26 22:55:17.000000',NULL,NULL),(11,27,'2025-11-26 22:55:17.000000',NULL,NULL),(12,22,'2025-11-26 22:55:17.000000',NULL,NULL),(12,23,'2025-11-26 22:55:17.000000',NULL,NULL),(12,24,'2025-11-26 22:55:17.000000',NULL,NULL),(12,25,'2025-11-26 22:55:17.000000',NULL,NULL),(12,26,'2025-11-26 22:55:17.000000',NULL,NULL),(12,27,'2025-11-26 22:55:17.000000',NULL,NULL),(13,22,'2025-11-26 22:55:17.000000',NULL,NULL),(13,23,'2025-11-26 22:55:17.000000',NULL,NULL),(13,24,'2025-11-26 22:55:17.000000',NULL,NULL),(13,25,'2025-11-26 22:55:17.000000',NULL,NULL),(13,26,'2025-11-26 22:55:17.000000',NULL,NULL),(13,27,'2025-11-26 22:55:17.000000',NULL,NULL),(14,22,'2025-11-26 22:55:17.000000',NULL,NULL),(14,23,'2025-11-26 22:55:17.000000',NULL,NULL),(14,24,'2025-11-26 22:55:17.000000',NULL,NULL),(14,25,'2025-11-26 22:55:17.000000',NULL,NULL),(14,26,'2025-11-26 22:55:17.000000',NULL,NULL),(14,27,'2025-11-26 22:55:17.000000',NULL,NULL),(15,22,'2025-11-26 22:55:17.000000',NULL,NULL),(15,23,'2025-11-26 22:55:17.000000',NULL,NULL),(15,24,'2025-11-26 22:55:17.000000',NULL,NULL),(15,25,'2025-11-26 22:55:17.000000',NULL,NULL),(15,26,'2025-11-26 22:55:17.000000',NULL,NULL),(15,27,'2025-11-26 22:55:17.000000',NULL,NULL);
/*!40000 ALTER TABLE `menu_restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_created_date` (`created_date`),
  KEY `idx_conversation` (`sender_id`,`receiver_id`,`created_date`),
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,16,3,'đơn hàng của bạn đã sẵn sàng để giao',1,'2025-11-27 09:41:53');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text,
  `created_date` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `food_id` int NOT NULL,
  `order_id` int NOT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`food_id`,`order_id`),
  KEY `FKt4dc2r9nbvbujrljv3e23iibt` (`order_id`),
  CONSTRAINT `FK4fcv9bk14o2k04wghr09jmy3b` FOREIGN KEY (`food_id`) REFERENCES `food` (`id`),
  CONSTRAINT `FKt4dc2r9nbvbujrljv3e23iibt` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (1355,5,'2025-11-27 09:33:36.861000'),(1377,5,'2025-11-27 09:33:36.861000'),(1557,4,'2025-11-26 23:40:03.141000');
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `res_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_price` bigint DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `payment_intent_id` varchar(255) DEFAULT NULL COMMENT 'Stripe payment intent ID (for credit card payments)',
  `transaction_id` varchar(255) DEFAULT NULL COMMENT 'Bank transaction ID (for bank transfer payments)',
  `delivery_address` varchar(255) DEFAULT NULL,
  `user_lat` double DEFAULT NULL COMMENT 'Vĩ độ vị trí khách hàng',
  `user_lng` double DEFAULT NULL COMMENT 'Kinh độ vị trí khách hàng',
  `shipper_lat` double DEFAULT NULL COMMENT 'Vĩ độ vị trí shipper',
  `shipper_lng` double DEFAULT NULL COMMENT 'Kinh độ vị trí shipper',
  `delivery_fee` bigint DEFAULT '0' COMMENT 'Phí giao hàng (VND)',
  `driver_id` int DEFAULT NULL COMMENT 'ID của driver/shipper nhận đơn',
  `accepted_at` datetime(6) DEFAULT NULL COMMENT 'Thời gian driver nhận đơn',
  `picked_up_at` datetime(6) DEFAULT NULL COMMENT 'Thời gian driver lấy hàng',
  `delivered_at` datetime(6) DEFAULT NULL COMMENT 'Thời gian driver giao hàng',
  `processing_started_at` datetime(6) DEFAULT NULL COMMENT 'Thời gian nhà hàng bắt đầu chế biến',
  `ready_at` datetime(6) DEFAULT NULL COMMENT 'Thời gian món ăn sẵn sàng',
  `shipping_fee` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
  KEY `IDX_orders_driver` (`driver_id`),
  KEY `IDX_orders_status` (`status`),
  KEY `idx_orders_driver_id` (`driver_id`),
  KEY `idx_orders_restaurant_status` (`res_id`,`status`),
  KEY `idx_orders_created_date` (`created_date`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_orders_driver` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FKdus6iri9jicaf63clcf9tx7oo` FOREIGN KEY (`res_id`) REFERENCES `restaurant` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (4,'2025-11-26 23:40:03.037000',22,3,'cancelled',78000,NULL,'PENDING',NULL,NULL,'Số 18, 134/22 Nguyên Xá, Bắc Từ Liêm, Hà Nội',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'2025-11-27 09:33:36.849000',22,3,'delivered',132000,NULL,'PENDING',NULL,NULL,'Số 18, 134/22 Nguyên Xá, Bắc Từ Liêm, Hà Nội',NULL,NULL,NULL,NULL,NULL,6,'2025-11-27 09:43:19.946000','2025-11-27 09:43:45.987000','2025-11-27 09:43:59.281000','2025-11-27 09:41:30.925000','2025-11-27 09:41:34.841000',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo`
--

DROP TABLE IF EXISTS `promo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `res_id` int DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `value` bigint DEFAULT '0',
  `max_usage` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `percent` int DEFAULT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `FK_promo_restaurant_new` (`res_id`),
  CONSTRAINT `FK_promo_restaurant_new` FOREIGN KEY (`res_id`) REFERENCES `restaurant` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo`
--

LOCK TABLES `promo` WRITE;
/*!40000 ALTER TABLE `promo` DISABLE KEYS */;
INSERT INTO `promo` VALUES (2,NULL,'7KA9AWCB','Giảm giá 50k cho đơn hàng','FOOD_DISCOUNT',50000,NULL,0,'',1,NULL,'2025-11-27 12:33:00.000000','2025-12-03 12:33:00.000000');
/*!40000 ALTER TABLE `promo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating_food`
--

DROP TABLE IF EXISTS `rating_food`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rating_food` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `rate_point` int DEFAULT NULL,
  `food_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9vbo076sms1cyc0ek2incdvri` (`food_id`),
  KEY `FKgketre40yat7fl78w4ey8c9r` (`user_id`),
  CONSTRAINT `FK9vbo076sms1cyc0ek2incdvri` FOREIGN KEY (`food_id`) REFERENCES `food` (`id`),
  CONSTRAINT `FKgketre40yat7fl78w4ey8c9r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating_food`
--

LOCK TABLES `rating_food` WRITE;
/*!40000 ALTER TABLE `rating_food` DISABLE KEYS */;
/*!40000 ALTER TABLE `rating_food` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating_restaurant`
--

DROP TABLE IF EXISTS `rating_restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rating_restaurant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `rate_point` int DEFAULT NULL,
  `res_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKos0mh27uu2xfxhpj62vp76x41` (`res_id`),
  KEY `FK6ke7nwuogwo4rniadhqo1no1y` (`user_id`),
  CONSTRAINT `FK6ke7nwuogwo4rniadhqo1no1y` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKos0mh27uu2xfxhpj62vp76x41` FOREIGN KEY (`res_id`) REFERENCES `restaurant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating_restaurant`
--

LOCK TABLES `rating_restaurant` WRITE;
/*!40000 ALTER TABLE `rating_restaurant` DISABLE KEYS */;
/*!40000 ALTER TABLE `rating_restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_freeship` bit(1) DEFAULT NULL,
  `open_date` datetime(6) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `is_active` bit(1) DEFAULT b'1' COMMENT 'Trạng thái hoạt động của cửa hàng',
  `is_approved` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_restaurant_owner` (`owner_id`),
  KEY `IDX_restaurant_active` (`is_active`),
  CONSTRAINT `FK_restaurant_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
INSERT INTO `restaurant` VALUES (22,'123 Phố Hàng Bông, Hoàn Kiếm, Hà Nội','Thưởng thức các món ăn Ấn Độ chính thống với hương vị đậm đà, từ Biryani thơm lừng đến các món cơm, bánh truyền thống','restaurant1.jpg',_binary '','2025-11-26 22:55:17.000000','Ẩm thực Ấn Độ đặc sắc','Nhà Hàng Biryani',8,_binary '',NULL),(23,'456 Phố Lý Thường Kiệt, Hoàn Kiếm, Hà Nội','Menu phong phú với Pizza, Burger, Pasta và nhiều món ăn đa dạng từ nhiều nền ẩm thực khác nhau','restaurant2.jpg',_binary '\0','2025-11-26 22:55:17.000000','Đa dạng món ăn quốc tế','Nhà Hàng Tổng Hợp',8,_binary '',NULL),(24,'789 Phố Tràng Tiền, Hoàn Kiếm, Hà Nội','Chuyên các món ăn Ấn Độ như Samosa, Dosa, Idly và các món cơm thơm ngon, đậm đà hương vị','restaurant3.jpg',_binary '\0','2025-11-26 22:55:17.000000','Ẩm thực Ấn Độ truyền thống','Nhà Hàng Samosa',8,_binary '',NULL),(25,'321 Phố Nguyễn Du, Hai Bà Trưng, Hà Nội','Pizza được làm thủ công theo công thức Ý, Burger thơm ngon và Pasta đậm đà hương vị','restaurant1.jpg',_binary '','2025-11-26 22:55:17.000000','Pizza và Burger chất lượng','Pizza Express Hà Nội',8,_binary '',NULL),(26,'654 Phố Láng Hạ, Đống Đa, Hà Nội','Chuyên các món gà nướng thơm lừng, Butter Chicken đậm đà cùng nhiều món ăn hấp dẫn khác','restaurant2.jpg',_binary '\0','2025-11-26 22:55:17.000000','Gà nướng và món ăn đa dạng','Nhà Hàng Gà Nướng',8,_binary '',NULL),(27,'987 Phố Tây Sơn, Đống Đa, Hà Nội','Từ món Á đến món Âu, từ cơm, pizza, burger đến pasta và các món tráng miệng thơm ngon','restaurant3.jpg',_binary '','2025-11-26 22:55:17.000000','Menu phong phú đa quốc gia','Nhà Hàng Đa Dạng',8,_binary '',NULL);
/*!40000 ALTER TABLE `restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_staff`
--

DROP TABLE IF EXISTS `restaurant_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'ID của nhân viên (user có role RESTAURANT_STAFF)',
  `restaurant_id` int NOT NULL COMMENT 'ID của nhà hàng',
  `created_date` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `is_active` bit(1) DEFAULT b'1' COMMENT 'Trạng thái hoạt động',
  `status` varchar(20) DEFAULT 'WORKING',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_staff_restaurant` (`user_id`,`restaurant_id`),
  KEY `FK_restaurant_staff_user` (`user_id`),
  KEY `FK_restaurant_staff_restaurant` (`restaurant_id`),
  CONSTRAINT `FK_restaurant_staff_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_restaurant_staff_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng liên kết nhân viên với nhà hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_staff`
--

LOCK TABLES `restaurant_staff` WRITE;
/*!40000 ALTER TABLE `restaurant_staff` DISABLE KEYS */;
INSERT INTO `restaurant_staff` VALUES (5,16,22,'2025-11-26 23:10:09.421000',_binary '','WORKING'),(6,17,23,'2025-11-26 23:10:40.180000',_binary '','WORKING');
/*!40000 ALTER TABLE `restaurant_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `role_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'2025-11-22 15:34:53.000000','ADMIN'),(2,'2025-11-22 15:34:53.000000','USER'),(3,'2025-11-22 15:34:53.000000','RESTAURANT_STAFF'),(4,'2025-11-22 15:34:53.000000','DRIVER'),(5,'2025-11-22 15:34:53.000000','RESTAURANT_OWNER');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_permissions`
--

DROP TABLE IF EXISTS `roles_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_permissions` (
  `roles_id` int NOT NULL,
  `permissions_name` varchar(255) NOT NULL,
  PRIMARY KEY (`roles_id`,`permissions_name`),
  KEY `FKpqh0ean4n5un6h790yuaimjj8` (`permissions_name`),
  CONSTRAINT `FKb9gqc5kvla3ijovnihsbb816e` FOREIGN KEY (`roles_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKpqh0ean4n5un6h790yuaimjj8` FOREIGN KEY (`permissions_name`) REFERENCES `permission` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_permissions`
--

LOCK TABLES `roles_permissions` WRITE;
/*!40000 ALTER TABLE `roles_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_address`
--

DROP TABLE IF EXISTS `user_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0' COMMENT 'Địa chỉ mặc định',
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_default` (`is_default`),
  CONSTRAINT `user_address_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_address`
--

LOCK TABLES `user_address` WRITE;
/*!40000 ALTER TABLE `user_address` DISABLE KEYS */;
INSERT INTO `user_address` VALUES (3,3,'Nhà','Số 18, 134/22 Nguyên Xá, Bắc Từ Liêm, Hà Nội','HOME',1,'2025-11-26 23:19:31');
/*!40000 ALTER TABLE `user_address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_payment_method`
--

DROP TABLE IF EXISTS `user_payment_method`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_payment_method` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_holder_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_month` int DEFAULT NULL COMMENT 'Tháng hết hạn (1-12)',
  `expiry_year` int DEFAULT NULL COMMENT 'Năm hết hạn',
  `card_brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_method_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe PaymentMethod ID (pm_xxx)',
  `is_default` tinyint(1) DEFAULT '0' COMMENT 'Phương thức thanh toán mặc định',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  `last_used_date` datetime DEFAULT NULL COMMENT 'Ngày sử dụng cuối',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_stripe_payment_method_id` (`stripe_payment_method_id`),
  CONSTRAINT `user_payment_method_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_payment_method`
--

LOCK TABLES `user_payment_method` WRITE;
/*!40000 ALTER TABLE `user_payment_method` DISABLE KEYS */;
INSERT INTO `user_payment_method` VALUES (1,3,'CREDIT_CARD','0000','NGUYEN VAN A',12,2020,'VISA',NULL,1,1,'2025-11-26 20:19:04',NULL);
/*!40000 ALTER TABLE `user_payment_method` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL COMMENT 'Email của người dùng',
  `avatar` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_approved` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKp56c1712k691lhsyewcssf40f` (`role_id`),
  CONSTRAINT `FKp56c1712k691lhsyewcssf40f` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,NULL,'$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','admin@gmail.com',1,NULL,NULL,NULL,NULL,_binary '\0'),(2,NULL,'Nguyễn Văn Anh','$2a$10$ve9NGndBqRR5bMY0xyuO/uQaJcK5jMEWrnWWKSWy2rtT7VDOPbBKi','alice',2,'0123456789',NULL,NULL,NULL,_binary '\0'),(3,NULL,'Nguyễn Văn Thiện','$2a$10$aazNZht7Y7zZkTM078SqkOaBRU.DCEBP5X.o9QTSk.EJmJakd/WLi','thiennguyen@gmail.com',2,'0862160948',NULL,'','Số 18, Nguyên Xá, Minh Khai, Bắc Từ Liêm, Hà Nội',_binary '\0'),(4,NULL,'Nguyễn Thiện','$2a$10$GZZ5VyaOkappY.I79sD6AuyedGXMqU/lLCXvuuj0syLxajQSXVMZS','thien1234@gmail.com',2,NULL,NULL,NULL,NULL,_binary '\0'),(5,'2025-11-21 22:01:25.000000','Nguyễn Văn User','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','user@gmail.com',2,'0987654321',NULL,NULL,NULL,_binary '\0'),(6,'2025-11-21 22:01:25.000000','Nguyễn Văn Driver','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','driver@gmail.com',4,'0912345678',NULL,NULL,NULL,_binary '\0'),(7,'2025-11-21 22:01:25.000000','Nguyễn Văn Staff','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','staff@gmail.com',3,'0923456789',NULL,NULL,NULL,_binary '\0'),(8,'2025-11-21 22:01:25.000000','Nguyễn Văn Owner','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','owner@gmail.com',5,'0934567890',NULL,NULL,NULL,_binary '\0'),(9,'2025-11-22 15:34:53.000000','Quản trị viên','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','admin@gmail.com',1,'0123456789',NULL,NULL,NULL,_binary '\0'),(10,'2025-11-22 15:34:53.000000','Nguyễn Văn User','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','user@gmail.com',2,'0987654321',NULL,NULL,NULL,_binary '\0'),(12,'2025-11-22 15:34:53.000000','Nguyễn Văn Driver','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','driver@gmail.com',4,'0912345678',NULL,NULL,NULL,_binary '\0'),(13,'2025-11-22 15:34:53.000000','Nguyễn Văn Owner','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','owner@gmail.com',5,'0934567890',NULL,NULL,NULL,_binary '\0'),(14,NULL,'Nguyễn Văn Thiện','$2a$10$YaF9qQ89SiQb8DDxJBekK.XKiYk5BJvD1vodfPKuYuyJvpmVJVTWi','thiennguyen2@gmail.com',3,'0987654321',NULL,NULL,NULL,_binary '\0'),(15,'2025-11-26 22:55:17.000000','Chủ cửa hàng Hà Nội','$2a$10$dnSIbS99g2QkK1FtgRf8euosKwrIIRQqEV/wjzrjaQ.06iuAi8pDe','owner.hanoi@gmail.com',5,'0987654321',NULL,NULL,NULL,NULL),(16,NULL,'Nguyễn Văn Anh','$2a$10$2ULrZLzqjZ7pz..7EfaU9ukjaVWdprOkWOpagXSYmt5mAJVcb.e7e','nguyenvananh@gmail.com',3,'0123456789',NULL,NULL,NULL,NULL),(17,NULL,'Nguyễn Văn Thiện','$2a$10$kcIHg5eE.7oQ6QtytcCzHOHWKbHbDPouZ0k9Tl5dCSngwd4Fywqx6','nguyenvanthien@gmail.com',3,'0987654321',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL COMMENT 'ID của nhà hàng',
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã voucher (VD: GIAM50K)',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên khuyến mãi',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại giảm giá: FOOD_DISCOUNT, SHIP_DISCOUNT',
  `value` bigint NOT NULL COMMENT 'Giá trị giảm (VND)',
  `start_date` datetime NOT NULL COMMENT 'Ngày bắt đầu',
  `end_date` datetime NOT NULL COMMENT 'Ngày kết thúc',
  `max_usage` int DEFAULT NULL COMMENT 'Số lần sử dụng tối đa (NULL = không giới hạn)',
  `used_count` int DEFAULT '0' COMMENT 'Số lần đã sử dụng',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả chi tiết',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  `updated_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_voucher_code` (`code`),
  KEY `FK_voucher_restaurant` (`restaurant_id`),
  KEY `idx_voucher_restaurant_active` (`restaurant_id`,`is_active`),
  KEY `idx_voucher_code` (`code`),
  KEY `idx_voucher_dates` (`start_date`,`end_date`),
  CONSTRAINT `FK_voucher_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ voucher/khuyến mãi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-30 18:57:32
