for file in *.csv
do
  name=$(basename "$file" .csv)

  mongoimport \
    --db pokemon \
    --collection "$name" \
    --type csv \
    --headerline \
    --file "$file"

done
