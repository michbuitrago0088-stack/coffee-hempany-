-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-10-2026 a las 23:09:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `coffee_hempany`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `clave_hash` varchar(255) NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id`, `usuario`, `clave_hash`, `creado_en`, `estado`) VALUES
(1, 'admin', '$2y$10$HCqGmMislUoy0UoSbi2pNO0ktplPOPHDG4hODeMozVmZED3AVRtF.', '2026-10-15 14:04:36', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `metodos_pago`
--

INSERT INTO `metodos_pago` (`id`, `nombre`) VALUES
(1, 'Efectivo'),
(3, 'Tarjeta'),
(2, 'Transferencia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `piso_id` tinyint(3) UNSIGNED NOT NULL,
  `oficina` varchar(50) NOT NULL,
  `metodo_pago_id` tinyint(3) UNSIGNED NOT NULL,
  `estado` enum('pendiente','en_preparacion','entregado','anulado') NOT NULL DEFAULT 'pendiente',
  `total` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `nombre`, `correo`, `piso_id`, `oficina`, `metodo_pago_id`, `estado`, `total`, `creado_en`, `fecha`) VALUES
(4, 'michell', 'michbuitrago0088@gmail.com', 3, '3', 1, 'pendiente', 12500, '2026-10-15 17:56:38', '2026-10-15 18:12:45'),
(6, 'samantha', 'michbuitrago0088@gmail.com', 5, '10', 1, 'pendiente', 14500, '2026-10-15 17:58:40', '2026-10-15 18:12:45'),
(7, 'paola', 'michbuitrago0088@gmail.com', 3, '6', 1, 'pendiente', 18500, '2026-10-15 19:35:31', '2026-10-15 19:35:31'),
(8, 'paulina', 'michbuitrago0088@gmail.com', 4, '20', 1, 'pendiente', 40000, '2026-10-17 13:13:10', '2026-10-17 13:13:10'),
(9, 'michell', 'michbuitrago0088@gmail.com', 5, '20', 1, 'pendiente', 17000, '2026-10-17 13:23:39', '2026-10-17 13:23:39'),
(10, 'samantha', 'michbuitrago0088@gmail.com', 2, '6', 1, 'pendiente', 7500, '2026-10-17 13:24:56', '2026-10-17 13:24:56'),
(11, 'michell', 'michbuitrago0088@gmail.com', 4, '2', 1, 'pendiente', 11000, '2026-10-17 13:37:43', '2026-10-17 13:37:43'),
(12, 'michell', 'michbuitrago0088@gmail.com', 2, '20', 1, 'pendiente', 4000, '2026-10-17 13:44:39', '2026-10-17 13:44:39'),
(13, 'samantha', 'michbuitrago0088@gmail.com', 5, '6', 2, 'pendiente', 3500, '2026-10-17 13:48:46', '2026-10-17 13:48:46'),
(14, 'michell', 'michbuitrago0088@gmail.com', 5, '20', 1, 'pendiente', 19000, '2026-10-17 13:50:22', '2026-10-17 13:50:22'),
(15, 'michell', 'michbuitrago0088@gmail.com', 5, '20', 1, 'pendiente', 29000, '2026-10-17 13:55:16', '2026-10-17 13:55:16'),
(18, 'paulina', 'michbuitrago0088@gmail.com', 5, '20', 1, 'pendiente', 10500, '2026-10-17 14:58:06', '2026-10-17 14:58:06'),
(19, 'michell', 'michbuitrago0088@gmail.com', 4, '20', 1, 'pendiente', 7500, '2026-10-17 15:02:25', '2026-10-17 15:02:25'),
(20, 'samantha', 'michbuitrago0088@gmail.com', 3, '2', 1, 'pendiente', 8000, '2026-10-17 15:05:53', '2026-10-17 15:05:53'),
(21, 'samantha', 'michbuitrago0088@gmail.com', 5, '20', 1, 'pendiente', 17500, '2026-10-17 15:15:59', '2026-10-17 15:15:59'),
(22, 'paulina', 'michbuitrago0088@gmail.com', 4, '20', 1, 'pendiente', 20500, '2026-10-17 15:19:02', '2026-10-17 15:19:02'),
(23, 'samantha', 'michbuitrago0088@gmail.com', 5, '20', 1, 'pendiente', 13000, '2026-10-17 15:23:36', '2026-10-17 15:23:36'),
(24, 'samantha', 'michbuitrago0088@gmail.com', 2, '20', 1, 'pendiente', 29500, '2026-10-17 15:33:29', '2026-10-17 15:33:29'),
(25, 'michell', 'michbuitrago0088@gmail.com', 1, '20', 1, 'pendiente', 43500, '2026-10-17 15:43:20', '2026-10-17 15:43:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_items`
--

CREATE TABLE `pedido_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `pedido_id` int(10) UNSIGNED NOT NULL,
  `producto_id` int(10) UNSIGNED DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` int(10) UNSIGNED NOT NULL,
  `cantidad` tinyint(3) UNSIGNED NOT NULL
) ;

--
-- Volcado de datos para la tabla `pedido_items`
--

INSERT INTO `pedido_items` (`id`, `pedido_id`, `producto_id`, `nombre`, `precio`, `cantidad`) VALUES
(9, 4, 1, 'Capuccino', 5500, 1),
(10, 4, 6, 'rollo de canela', 3500, 2),
(13, 6, 1, 'Capuccino', 5500, 2),
(14, 6, 6, 'rollo de canela', 3500, 1),
(15, 7, 1, 'Capuccino', 5500, 2),
(16, 7, 2, 'Café americano', 4000, 1),
(17, 7, 6, 'rollo de canela', 3500, 1),
(18, 8, 1, 'Capuccino', 5500, 1),
(19, 8, 4, 'Cheesecake', 13500, 1),
(20, 8, 5, 'Brownie de chocolate', 7000, 2),
(21, 8, 6, 'rollo de canela', 3500, 2),
(22, 9, 3, 'Frappe de café', 10000, 1),
(23, 9, 6, 'rollo de canela', 3500, 2),
(24, 10, 2, 'Café americano', 4000, 1),
(25, 10, 6, 'rollo de canela', 3500, 1),
(26, 11, 2, 'Café americano', 4000, 1),
(27, 11, 5, 'Brownie de chocolate', 7000, 1),
(28, 12, 2, 'Café americano', 4000, 1),
(29, 13, 6, 'rollo de canela', 3500, 1),
(30, 14, 1, 'Capuccino', 5500, 1),
(31, 14, 4, 'Cheesecake', 13500, 1),
(32, 15, 1, 'Capuccino', 5500, 1),
(33, 15, 3, 'Frappe de café', 10000, 1),
(34, 15, 4, 'Cheesecake', 13500, 1),
(38, 18, 5, 'Brownie de chocolate', 7000, 1),
(39, 18, 6, 'rollo de canela', 3500, 1),
(40, 19, 2, 'Café americano', 4000, 1),
(41, 19, 6, 'rollo de canela', 3500, 1),
(42, 20, 2, 'Café americano', 4000, 2),
(43, 21, 5, 'Brownie de chocolate', 7000, 2),
(44, 21, 6, 'rollo de canela', 3500, 1),
(45, 22, 4, 'Cheesecake', 13500, 1),
(46, 22, 5, 'Brownie de chocolate', 7000, 1),
(47, 23, 1, 'Capuccino', 5500, 1),
(48, 23, 2, 'Café americano', 4000, 1),
(49, 23, 6, 'rollo de canela', 3500, 1),
(50, 24, 1, 'Capuccino', 5500, 1),
(51, 24, 2, 'Café americano', 4000, 1),
(52, 24, 3, 'Frappe de café', 10000, 2),
(53, 25, 1, 'Capuccino', 5500, 1),
(54, 25, 2, 'Café americano', 4000, 1),
(55, 25, 3, 'Frappe de café', 10000, 1),
(56, 25, 4, 'Cheesecake', 13500, 1),
(57, 25, 5, 'Brownie de chocolate', 7000, 1),
(58, 25, 6, 'rollo de canela', 3500, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pisos`
--

CREATE TABLE `pisos` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pisos`
--

INSERT INTO `pisos` (`id`, `nombre`) VALUES
(1, 'Piso 1'),
(2, 'Piso 2'),
(3, 'Piso 3'),
(4, 'Piso 4'),
(5, 'Piso 5');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) NOT NULL DEFAULT '',
  `precio` int(10) UNSIGNED NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `imagen` mediumtext DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `imagen`, `creado_en`) VALUES
(1, 'Capuccino', 'Espresso con leche vaporizada y una capa de espuma cremosa.', 5500, 1, 'img/capuccino.jpg', '2026-10-15 14:04:36'),
(2, 'Café americano', 'Espresso suave alargado con agua caliente, para tomar con calma.', 4000, 1, 'img/americano.jpg', '2026-10-15 14:04:36'),
(3, 'Frappe de café', 'Café frío licuado con hielo, crema batida y salsa de caramelo.', 10000, 1, 'img/cafefrappe.jpg', '2026-10-15 14:04:36'),
(4, 'Cheesecake', 'Porción cremosa de cheesecake de la casa, ideal para acompañar tu café.', 13500, 1, 'img/Cheesecake.jpg', '2026-10-15 14:04:36'),
(5, 'Brownie de chocolate', 'Brownie de chocolate húmedo, con salsa de chocolate y trozos de avellana.', 7000, 1, 'img/browniedechocolate.jpg', '2026-10-15 14:04:36'),
(6, 'rollo de canela', 'delicioso y esponjoso rollo de canela', 3500, 1, 'img/producto_6_1792101449.jpg', '2026-10-15 16:57:29');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos` (
`id` int(10) unsigned
,`nombre` varchar(100)
,`correo` varchar(150)
,`piso` varchar(30)
,`oficina` varchar(50)
,`metodo` varchar(30)
,`estado` enum('pendiente','en_preparacion','entregado','anulado')
,`total` int(10) unsigned
,`fecha` datetime
,`detalle` mediumtext
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos`
--
DROP TABLE IF EXISTS `vista_pedidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos`  AS SELECT `p`.`id` AS `id`, `p`.`nombre` AS `nombre`, `p`.`correo` AS `correo`, `pi`.`nombre` AS `piso`, `p`.`oficina` AS `oficina`, `m`.`nombre` AS `metodo`, `p`.`estado` AS `estado`, `p`.`total` AS `total`, `p`.`fecha` AS `fecha`, group_concat(concat(`i`.`cantidad`,' × ',`i`.`nombre`) order by `i`.`id` ASC separator ', ') AS `detalle` FROM (((`pedidos` `p` join `pisos` `pi` on(`pi`.`id` = `p`.`piso_id`)) join `metodos_pago` `m` on(`m`.`id` = `p`.`metodo_pago_id`)) left join `pedido_items` `i` on(`i`.`pedido_id` = `p`.`id`)) GROUP BY `p`.`id`, `p`.`nombre`, `p`.`correo`, `pi`.`nombre`, `p`.`oficina`, `m`.`nombre`, `p`.`estado`, `p`.`total`, `p`.`fecha` ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_administradores_usuario` (`usuario`);

--
-- Indices de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_metodos_pago_nombre` (`nombre`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pedidos_estado` (`estado`),
  ADD KEY `fk_pedidos_piso` (`piso_id`),
  ADD KEY `fk_pedidos_metodo` (`metodo_pago_id`);

--
-- Indices de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_item_pedido_producto` (`pedido_id`,`producto_id`),
  ADD KEY `fk_items_producto` (`producto_id`);

--
-- Indices de la tabla `pisos`
--
ALTER TABLE `pisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pisos_nombre` (`nombre`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_productos_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pisos`
--
ALTER TABLE `pisos`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedidos_metodo` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`),
  ADD CONSTRAINT `fk_pedidos_piso` FOREIGN KEY (`piso_id`) REFERENCES `pisos` (`id`);

--
-- Filtros para la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD CONSTRAINT `fk_items_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_items_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
