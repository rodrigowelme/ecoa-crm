-- Repara bancos preenchidos pelo seed antigo, sem modificar os registros.
-- Não retrocede sequências que já avançaram além do maior ID existente.
BEGIN;
LOCK TABLE "stages", "sellers", "deals" IN SHARE ROW EXCLUSIVE MODE;

SELECT setval(pg_get_serial_sequence('stages', 'id')::regclass,
  GREATEST(COALESCE((SELECT MAX(id) FROM stages), 0)::bigint + 1,
    nextval(pg_get_serial_sequence('stages', 'id')::regclass)), false);

SELECT setval(pg_get_serial_sequence('sellers', 'id')::regclass,
  GREATEST(COALESCE((SELECT MAX(id) FROM sellers), 0)::bigint + 1,
    nextval(pg_get_serial_sequence('sellers', 'id')::regclass)), false);

SELECT setval(pg_get_serial_sequence('deals', 'id')::regclass,
  GREATEST(COALESCE((SELECT MAX(id) FROM deals), 0)::bigint + 1,
    nextval(pg_get_serial_sequence('deals', 'id')::regclass)), false);
COMMIT;
