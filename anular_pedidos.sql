-- Agrega la opción "anulado" al estado de los pedidos.
-- Ejecútalo UNA vez en phpMyAdmin: base coffee_hempany -> pestaña SQL -> Continuar.
ALTER TABLE pedidos
  MODIFY estado ENUM('pendiente','en_preparacion','entregado','anulado')
  NOT NULL DEFAULT 'pendiente';
