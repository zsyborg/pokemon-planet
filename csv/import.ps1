$env:PGPASSWORD = "za"
$psql = " D:\Program Files\PostgreSQL\18\bin\psql.exe"
$db = "pokemon"
$csvPath = "D:\Crypto\pokeapi\data\v2\csv"

Get-ChildItem $csvPath -Filter *.csv | ForEach-Object {

    $table = $_.BaseName
    Write-Host "Importing $table"

    # Read header
    $header = Get-Content $_.FullName -First 1
    $cols = $header -split "," | ForEach-Object { "`"$_`" TEXT" }
    $cols = $header -split "," | ForEach-Object {
    $clean = $_.Trim()
    "`"$clean`" TEXT"
}
$colSql = $cols -join ", "

    # SQL file content
    $sql = @"
DROP TABLE IF EXISTS "$table";
CREATE TABLE "$table" ($colSql);
COPY "$table"
FROM '$($_.FullName.Replace("\","/"))'
CSV HEADER;
"@

    & $psql -U postgres -d $db -v ON_ERROR_STOP=1 -c $sql
}
