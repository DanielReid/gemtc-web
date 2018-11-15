echo $(pwd)
docker run --name postgres2 -e POSTGRES_PASSWORD=develop -d postgres
sleep 3 # wait for db to spin up
for i in changesets/create-database-changeset-*.sql; do cat $i >> db-init.sql; done
cat > .pgpass <<EOF
postgres:5432:*:postgres:develop
postgres:5432:*:gemtc:develop
EOF
docker run -it --rm \
  --mount type=bind,source="$(pwd)"/.pgpass,target=/root/.pgpass \
  --mount type=bind,source="$(pwd)"/db.sh,target=/db.sh \
  --mount type=bind,source="$(pwd)"/db-init.sql,target=/db-init.sql \
  --link postgres2:postgres postgres \
  /db.sh
rm db-init.sql
