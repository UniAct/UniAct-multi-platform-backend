CREATE OR REPLACE FUNCTION clone_schema(source_schema text, dest_schema text)
RETURNS void AS
$$
DECLARE
  obj text;
BEGIN

  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', dest_schema);

  FOR obj IN
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = source_schema
  LOOP

      EXECUTE format(
        'CREATE TABLE %I.%I (LIKE %I.%I INCLUDING ALL)',
        dest_schema,
        obj,
        source_schema,
        obj
      );

  END LOOP;

END;
$$ LANGUAGE plpgsql;