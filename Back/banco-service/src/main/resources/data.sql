-- Insertar Clientes
INSERT INTO CLIENTE (cedula, nombre, genero, fecha_nacimiento)
VALUES 
('1712345678', 'Juan Perez (Sujeto Apto)', 'M', CURRENT_DATE - INTERVAL '28 years'),
('1712345679', 'Pedro Gomez (Menor 25)', 'M', CURRENT_DATE - INTERVAL '20 years'),
('1712345680', 'Maria Lopez (Mujer Menor 25 Apta)', 'F', CURRENT_DATE - INTERVAL '22 years'),
('1712345681', 'Carlos Ruiz (Con Credito Activo)', 'M', CURRENT_DATE - INTERVAL '30 years'),
('1712345682', 'Luis Torres (Sin Deposito Reciente)', 'M', CURRENT_DATE - INTERVAL '35 years')
ON CONFLICT (cedula) DO NOTHING;

-- Insertar Cuentas
INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '11111111', cod_cliente, 5000.00 FROM CLIENTE WHERE cedula = '1712345678' ON CONFLICT (num_cuenta) DO NOTHING;
INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '22222222', cod_cliente, 1500.00 FROM CLIENTE WHERE cedula = '1712345679' ON CONFLICT (num_cuenta) DO NOTHING;
INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '33333333', cod_cliente, 3000.00 FROM CLIENTE WHERE cedula = '1712345680' ON CONFLICT (num_cuenta) DO NOTHING;
INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '44444444', cod_cliente, 8000.00 FROM CLIENTE WHERE cedula = '1712345681' ON CONFLICT (num_cuenta) DO NOTHING;
INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '55555555', cod_cliente, 2000.00 FROM CLIENTE WHERE cedula = '1712345682' ON CONFLICT (num_cuenta) DO NOTHING;

-- Insertar Movimientos
-- Juan Perez (DEP en último mes, DEP en trimestre)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '11111111', 'DEP', 2000.00, CURRENT_DATE - INTERVAL '15 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '11111111');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '11111111', 'DEP', 1500.00, CURRENT_DATE - INTERVAL '45 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '11111111');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '11111111', 'RET', 500.00, CURRENT_DATE - INTERVAL '10 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '11111111');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '11111111', 'RET', 800.00, CURRENT_DATE - INTERVAL '50 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '11111111');

-- Pedro Gomez (DEP en último mes)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '22222222', 'DEP', 800.00, CURRENT_DATE - INTERVAL '10 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '22222222');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '22222222', 'RET', 300.00, CURRENT_DATE - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '22222222');

-- Maria Lopez (DEP en último mes)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '33333333', 'DEP', 1200.00, CURRENT_DATE - INTERVAL '20 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '33333333');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '33333333', 'RET', 400.00, CURRENT_DATE - INTERVAL '12 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '33333333');

-- Carlos Ruiz (DEP en último mes, con crédito activo)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '44444444', 'DEP', 3000.00, CURRENT_DATE - INTERVAL '18 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '44444444');

-- Luis Torres (Sin depósito reciente, sólo retiros recientes o depósitos viejos)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '55555555', 'DEP', 1000.00, CURRENT_DATE - INTERVAL '40 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '55555555');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '55555555', 'RET', 200.00, CURRENT_DATE - INTERVAL '15 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '55555555');

-- Crear Credito Activo para Carlos Ruiz (evita duplicación si ya existe)
INSERT INTO CREDITO (cod_cliente, monto, plazo_meses, tasa_interes, fecha_aprobacion, activo)
SELECT cod_cliente, 1200.00, 6, 0.165, CURRENT_DATE - INTERVAL '2 months', true 
FROM CLIENTE 
WHERE cedula = '1712345681'
  AND NOT EXISTS (
      SELECT 1 FROM CREDITO cr 
      JOIN CLIENTE cl ON cr.cod_cliente = cl.cod_cliente 
      WHERE cl.cedula = '1712345681' AND cr.activo = true
  );

-- ============================================================
-- NUEVOS CLIENTES HABILITADOS PARA COMPRAR
-- ============================================================

-- Insertar Clientes Aptos
INSERT INTO CLIENTE (cedula, nombre, genero, fecha_nacimiento)
VALUES 
('1712345683', 'Ana Martinez (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '30 years'),
('1712345684', 'Roberto Diaz (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '32 years'),
('1712345685', 'Laura Garcia (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '27 years'),
('1712345686', 'Diego Torres (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '40 years'),
('1712345687', 'Carmen Vega (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '35 years'),
('1712345688', 'Pablo Ramirez (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '29 years')
ON CONFLICT (cedula) DO NOTHING;

-- Insertar Cuentas
INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '66666666', cod_cliente, 4500.00 FROM CLIENTE WHERE cedula = '1712345683' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '77777777', cod_cliente, 6000.00 FROM CLIENTE WHERE cedula = '1712345684' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '88888888', cod_cliente, 3500.00 FROM CLIENTE WHERE cedula = '1712345685' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '99999999', cod_cliente, 10000.00 FROM CLIENTE WHERE cedula = '1712345686' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '10101010', cod_cliente, 7000.00 FROM CLIENTE WHERE cedula = '1712345687' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '12121212', cod_cliente, 5500.00 FROM CLIENTE WHERE cedula = '1712345688' ON CONFLICT (num_cuenta) DO NOTHING;

-- Ana Martinez (F, 30) - DEP en último mes
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '66666666', 'DEP', 1800.00, CURRENT_DATE - INTERVAL '10 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '66666666');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '66666666', 'RET', 300.00, CURRENT_DATE - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '66666666');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '66666666', 'DEP', 1200.00, CURRENT_DATE - INTERVAL '60 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '66666666');

-- Roberto Diaz (M, 32) - DEP en último mes
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '77777777', 'DEP', 2500.00, CURRENT_DATE - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '77777777');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '77777777', 'RET', 600.00, CURRENT_DATE - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '77777777');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '77777777', 'DEP', 1500.00, CURRENT_DATE - INTERVAL '50 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '77777777');

-- Laura Garcia (F, 27) - DEP en último mes
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '88888888', 'DEP', 1000.00, CURRENT_DATE - INTERVAL '15 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '88888888');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '88888888', 'RET', 200.00, CURRENT_DATE - INTERVAL '8 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '88888888');

-- Diego Torres (M, 40) - DEP en último mes
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '99999999', 'DEP', 5000.00, CURRENT_DATE - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '99999999');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '99999999', 'RET', 1000.00, CURRENT_DATE - INTERVAL '1 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '99999999');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '99999999', 'DEP', 3000.00, CURRENT_DATE - INTERVAL '45 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '99999999');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '99999999', 'DEP', 2000.00, CURRENT_DATE - INTERVAL '75 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '99999999');

-- Carmen Vega (F, 35) - DEP en último mes
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '10101010', 'DEP', 3000.00, CURRENT_DATE - INTERVAL '8 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '10101010');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '10101010', 'RET', 500.00, CURRENT_DATE - INTERVAL '4 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '10101010');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '10101010', 'DEP', 2000.00, CURRENT_DATE - INTERVAL '55 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '10101010');

-- Pablo Ramirez (M, 29) - DEP en último mes
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '12121212', 'DEP', 2000.00, CURRENT_DATE - INTERVAL '12 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '12121212');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '12121212', 'RET', 400.00, CURRENT_DATE - INTERVAL '6 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '12121212');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '12121212', 'DEP', 1000.00, CURRENT_DATE - INTERVAL '70 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '12121212');

-- ============================================================
-- MÁS CLIENTES HABILITADOS (LOTE 2)
-- ============================================================

INSERT INTO CLIENTE (cedula, nombre, genero, fecha_nacimiento)
VALUES 
('1712345689', 'Sofia Castro (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '28 years'),
('1712345690', 'Andres Morales (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '35 years'),
('1712345691', 'Valeria Ortiz (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '24 years'),
('1712345692', 'Fernando Rios (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '45 years'),
('1712345693', 'Gabriela Silva (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '31 years'),
('1712345694', 'Hector Campos (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '27 years'),
('1712345695', 'Isabella Rojas (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '29 years'),
('1712345696', 'Javier Cruz (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '38 years'),
('1712345697', 'Karen Luna (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '33 years'),
('1712345698', 'Leonardo Paz (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '42 years'),
('1712345699', 'Monica Vera (Mujer Apta)', 'F', CURRENT_DATE - INTERVAL '26 years'),
('1712345700', 'Nestor Pena (Hombre Apto)', 'M', CURRENT_DATE - INTERVAL '31 years')
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '13131313', cod_cliente, 4200.00 FROM CLIENTE WHERE cedula = '1712345689' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '14141414', cod_cliente, 7500.00 FROM CLIENTE WHERE cedula = '1712345690' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '15151515', cod_cliente, 3800.00 FROM CLIENTE WHERE cedula = '1712345691' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '16161616', cod_cliente, 12000.00 FROM CLIENTE WHERE cedula = '1712345692' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '17171717', cod_cliente, 5600.00 FROM CLIENTE WHERE cedula = '1712345693' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '18181818', cod_cliente, 3400.00 FROM CLIENTE WHERE cedula = '1712345694' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '19191919', cod_cliente, 6100.00 FROM CLIENTE WHERE cedula = '1712345695' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '20202020', cod_cliente, 8900.00 FROM CLIENTE WHERE cedula = '1712345696' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '21212121', cod_cliente, 4700.00 FROM CLIENTE WHERE cedula = '1712345697' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '23232323', cod_cliente, 10500.00 FROM CLIENTE WHERE cedula = '1712345698' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '24242424', cod_cliente, 3200.00 FROM CLIENTE WHERE cedula = '1712345699' ON CONFLICT (num_cuenta) DO NOTHING;

INSERT INTO CUENTA (num_cuenta, cod_cliente, saldo)
SELECT '25252525', cod_cliente, 6800.00 FROM CLIENTE WHERE cedula = '1712345700' ON CONFLICT (num_cuenta) DO NOTHING;

-- Sofia Castro (F, 28)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '13131313', 'DEP', 1500.00, CURRENT_DATE - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '13131313');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '13131313', 'RET', 300.00, CURRENT_DATE - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '13131313');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '13131313', 'DEP', 800.00, CURRENT_DATE - INTERVAL '50 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '13131313');

-- Andres Morales (M, 35)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '14141414', 'DEP', 3000.00, CURRENT_DATE - INTERVAL '4 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '14141414');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '14141414', 'RET', 800.00, CURRENT_DATE - INTERVAL '1 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '14141414');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '14141414', 'DEP', 2000.00, CURRENT_DATE - INTERVAL '65 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '14141414');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '14141414', 'DEP', 1500.00, CURRENT_DATE - INTERVAL '85 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '14141414');

-- Valeria Ortiz (F, 24)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '15151515', 'DEP', 1200.00, CURRENT_DATE - INTERVAL '12 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '15151515');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '15151515', 'RET', 200.00, CURRENT_DATE - INTERVAL '6 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '15151515');

-- Fernando Rios (M, 45)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '16161616', 'DEP', 6000.00, CURRENT_DATE - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '16161616');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '16161616', 'RET', 1500.00, CURRENT_DATE - INTERVAL '1 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '16161616');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '16161616', 'DEP', 4000.00, CURRENT_DATE - INTERVAL '40 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '16161616');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '16161616', 'DEP', 3500.00, CURRENT_DATE - INTERVAL '70 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '16161616');

-- Gabriela Silva (F, 31)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '17171717', 'DEP', 2000.00, CURRENT_DATE - INTERVAL '9 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '17171717');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '17171717', 'RET', 500.00, CURRENT_DATE - INTERVAL '4 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '17171717');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '17171717', 'DEP', 1000.00, CURRENT_DATE - INTERVAL '55 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '17171717');

-- Hector Campos (M, 27)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '18181818', 'DEP', 1400.00, CURRENT_DATE - INTERVAL '14 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '18181818');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '18181818', 'RET', 300.00, CURRENT_DATE - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '18181818');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '18181818', 'DEP', 900.00, CURRENT_DATE - INTERVAL '60 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '18181818');

-- Isabella Rojas (F, 29)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '19191919', 'DEP', 2500.00, CURRENT_DATE - INTERVAL '6 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '19191919');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '19191919', 'RET', 600.00, CURRENT_DATE - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '19191919');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '19191919', 'DEP', 1500.00, CURRENT_DATE - INTERVAL '45 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '19191919');

-- Javier Cruz (M, 38)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '20202020', 'DEP', 3500.00, CURRENT_DATE - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '20202020');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '20202020', 'RET', 1000.00, CURRENT_DATE - INTERVAL '1 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '20202020');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '20202020', 'DEP', 2200.00, CURRENT_DATE - INTERVAL '50 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '20202020');

-- Karen Luna (F, 33)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '21212121', 'DEP', 1800.00, CURRENT_DATE - INTERVAL '11 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '21212121');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '21212121', 'RET', 400.00, CURRENT_DATE - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '21212121');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '21212121', 'DEP', 1100.00, CURRENT_DATE - INTERVAL '65 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '21212121');

-- Leonardo Paz (M, 42)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '23232323', 'DEP', 4500.00, CURRENT_DATE - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '23232323');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '23232323', 'RET', 1200.00, CURRENT_DATE - INTERVAL '1 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '23232323');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '23232323', 'DEP', 2800.00, CURRENT_DATE - INTERVAL '35 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '23232323');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '23232323', 'DEP', 2000.00, CURRENT_DATE - INTERVAL '80 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '23232323');

-- Monica Vera (F, 26)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '24242424', 'DEP', 1300.00, CURRENT_DATE - INTERVAL '13 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '24242424');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '24242424', 'RET', 200.00, CURRENT_DATE - INTERVAL '6 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '24242424');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '24242424', 'DEP', 700.00, CURRENT_DATE - INTERVAL '75 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '24242424');

-- Nestor Pena (M, 31)
INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '25252525', 'DEP', 2800.00, CURRENT_DATE - INTERVAL '8 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '25252525');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '25252525', 'RET', 700.00, CURRENT_DATE - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '25252525');

INSERT INTO MOVIMIENTO (num_cuenta, tipo, valor, fecha)
SELECT '25252525', 'DEP', 1600.00, CURRENT_DATE - INTERVAL '55 days'
WHERE EXISTS (SELECT 1 FROM CUENTA WHERE num_cuenta = '25252525');
