$env:PGPASSWORD = "za"

$psql = "D:/Program Files/PostgreSQL/18/bin/psql.exe"
$db   = "pokemon"
$user = "postgres"

$sql = @'
DO $$
DECLARE
    r RECORD;
    has_id BOOLEAN;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN (
            SELECT tc.table_name
            FROM information_schema.table_constraints tc
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
        )
    LOOP
        -- check if column "id" already exists
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = r.tablename
            AND column_name = 'id'
        ) INTO has_id;

        IF has_id THEN
            RAISE NOTICE 'Adding PRIMARY KEY to existing id in table: %', r.tablename;
            EXECUTE format(
                'ALTER TABLE %I ADD PRIMARY KEY (id)',
                r.tablename
            );
        ELSE
            RAISE NOTICE 'Adding id column to table: %', r.tablename;
            EXECUTE format(
                'ALTER TABLE %I ADD COLUMN id BIGSERIAL PRIMARY KEY',
                r.tablename
            );
        END IF;
    END LOOP;
END
$$;
'@

& $psql -U $user -d $db -v ON_ERROR_STOP=1 -c $sql
