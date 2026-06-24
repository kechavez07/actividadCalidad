-- Insertar Partidos
INSERT INTO PARTIDO_FUTBOL (codigo, equipo_local, equipo_visita, fecha, lugar) VALUES
('MX-ZAF', 'México', 'Sudáfrica', '2026-06-11 13:00:00', 'Estadio Azteca, Ciudad de México'),
('ARG-AUS', 'Argentina', 'Australia', '2026-06-22 11:00:00', 'Dallas Stadium, Dallas'),
('FRA-SEN', 'Francia', 'Senegal', '2026-06-15 13:00:00', 'New Jersey Stadium, New York'),
('POR-UZB', 'Portugal', 'Uzbekistán', '2026-06-23 11:00:00', 'Houston Stadium, Houston'),
('ENG-GHA', 'Inglaterra', 'Ghana', '2026-06-23 14:00:00', 'Boston Stadium, Boston'),
('COL-REP', 'Colombia', 'Repechaje 1', '2026-06-23 20:00:00', 'Estadio Guadalajara, Guadalajara'),
('URU-ESP', 'Uruguay', 'España', '2026-06-25 17:00:00', 'New York/New Jersey Stadium'),
('FINAL-2026', 'Final FIFA 2026', 'Ganador Semifinal', '2026-07-19 18:00:00', 'MetLife Stadium, East Rutherford')
ON CONFLICT (codigo) DO NOTHING;

-- Insertar Localidades por Partido
-- MX-ZAF
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'MX-ZAF', 'PALCO', 10, 250.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'MX-ZAF')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'MX-ZAF', 'TRIBUNA', 50, 120.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'MX-ZAF')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'MX-ZAF', 'GENERAL', 100, 60.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'MX-ZAF')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;

-- ARG-AUS
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'ARG-AUS', 'PALCO', 5, 300.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'ARG-AUS')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'ARG-AUS', 'TRIBUNA', 40, 150.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'ARG-AUS')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'ARG-AUS', 'GENERAL', 80, 80.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'ARG-AUS')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;

-- POR-UZB
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'POR-UZB', 'PALCO', 12, 220.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'POR-UZB')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'POR-UZB', 'TRIBUNA', 60, 110.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'POR-UZB')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'POR-UZB', 'GENERAL', 120, 50.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'POR-UZB')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;

-- ENG-GHA
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'ENG-GHA', 'PALCO', 8, 280.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'ENG-GHA')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'ENG-GHA', 'TRIBUNA', 45, 130.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'ENG-GHA')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'ENG-GHA', 'GENERAL', 90, 70.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'ENG-GHA')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;

-- COL-REP
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'COL-REP', 'PALCO', 6, 240.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'COL-REP')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'COL-REP', 'TRIBUNA', 50, 120.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'COL-REP')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'COL-REP', 'GENERAL', 100, 55.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'COL-REP')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;

-- URU-ESP
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'URU-ESP', 'PALCO', 10, 260.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'URU-ESP')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'URU-ESP', 'TRIBUNA', 40, 140.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'URU-ESP')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'URU-ESP', 'GENERAL', 110, 65.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'URU-ESP')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;

-- FINAL-2026
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'FINAL-2026', 'PALCO', 15, 600.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'FINAL-2026')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'FINAL-2026', 'TRIBUNA', 80, 300.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'FINAL-2026')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;
INSERT INTO LOCALIDAD_PARTIDO (codigo_partido, codigo_localidad, disponibilidad, precio)
SELECT 'FINAL-2026', 'GENERAL', 200, 150.00 WHERE EXISTS (SELECT 1 FROM PARTIDO_FUTBOL WHERE codigo = 'FINAL-2026')
ON CONFLICT (codigo_partido, codigo_localidad) DO NOTHING;

-- ============================================
-- ASIENTOS INDIVIDUALES POR LOCALIDAD/PARTIDO
-- Genera un asiento por cada unidad de disponibilidad
-- Usa generate_series() (SQL estándar de PostgreSQL, compatible con Spring ScriptUtils)
-- ============================================

-- MX-ZAF
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'MX-ZAF', 'PALCO', s, 'LIBRE' FROM generate_series(1, 10) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'MX-ZAF', 'TRIBUNA', s, 'LIBRE' FROM generate_series(1, 50) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'MX-ZAF', 'GENERAL', s, 'LIBRE' FROM generate_series(1, 100) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;

-- ARG-AUS
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'ARG-AUS', 'PALCO', s, 'LIBRE' FROM generate_series(1, 5) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'ARG-AUS', 'TRIBUNA', s, 'LIBRE' FROM generate_series(1, 40) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'ARG-AUS', 'GENERAL', s, 'LIBRE' FROM generate_series(1, 80) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;

-- POR-UZB
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'POR-UZB', 'PALCO', s, 'LIBRE' FROM generate_series(1, 12) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'POR-UZB', 'TRIBUNA', s, 'LIBRE' FROM generate_series(1, 60) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'POR-UZB', 'GENERAL', s, 'LIBRE' FROM generate_series(1, 120) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;

-- ENG-GHA
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'ENG-GHA', 'PALCO', s, 'LIBRE' FROM generate_series(1, 8) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'ENG-GHA', 'TRIBUNA', s, 'LIBRE' FROM generate_series(1, 45) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'ENG-GHA', 'GENERAL', s, 'LIBRE' FROM generate_series(1, 90) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;

-- COL-REP
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'COL-REP', 'PALCO', s, 'LIBRE' FROM generate_series(1, 6) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'COL-REP', 'TRIBUNA', s, 'LIBRE' FROM generate_series(1, 50) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'COL-REP', 'GENERAL', s, 'LIBRE' FROM generate_series(1, 100) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;

-- URU-ESP
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'URU-ESP', 'PALCO', s, 'LIBRE' FROM generate_series(1, 10) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'URU-ESP', 'TRIBUNA', s, 'LIBRE' FROM generate_series(1, 40) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'URU-ESP', 'GENERAL', s, 'LIBRE' FROM generate_series(1, 110) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;

-- FINAL-2026
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'FINAL-2026', 'PALCO', s, 'LIBRE' FROM generate_series(1, 15) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'FINAL-2026', 'TRIBUNA', s, 'LIBRE' FROM generate_series(1, 80) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;
INSERT INTO ASIENTO (codigo_partido, codigo_localidad, numero_asiento, estado)
SELECT 'FINAL-2026', 'GENERAL', s, 'LIBRE' FROM generate_series(1, 200) AS s ON CONFLICT (codigo_partido, codigo_localidad, numero_asiento) DO NOTHING;

