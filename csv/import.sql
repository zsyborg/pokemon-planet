DO $$
DECLARE
    file_name TEXT;
    table_name TEXT;
    col_defs TEXT;
BEGIN
    FOR file_name IN
        SELECT pg_ls_dir('D:/Crypto/pokeapi/data/v2/csv')
        WHERE file_name LIKE '%.csv'
    LOOP
        table_name := replace(file_name, '.csv', '');

        EXECUTE format('DROP TABLE IF EXISTS %I', table_name);

        -- Read header row to create columns
        EXECUTE format(
            'CREATE TABLE %I (%s)',
            table_name,
            (
                SELECT string_agg(format('%I TEXT', col), ', ')
                FROM unnest(
                    string_to_array(
                        (SELECT pg_read_file('D:/Crypto/pokeapi/data/v2/csv/' || file_name, 0, 10000)),
                        ','
                    )
                ) AS col
            )
        );

        EXECUTE format(
            'COPY %I FROM %L CSV HEADER',
            table_name,
            'C:/pokemon_csv/' || file_name
        );
    END LOOP;
END $$;
