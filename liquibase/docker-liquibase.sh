docker run --rm -v $(pwd):/liquibase/ \
  --network host \
  -e "LIQUIBASE_URL=jdbc:postgresql://postgres:5432/gemtc" \
  -e "LIQUIBASE_USERNAME=gemtc" \
  -e "LIQUIBASE_PASSWORD=develop" \
  -e "LIQUIBASE_CHANGELOG=liquibase-changelog.sql" \
  --link postgres:db \
  webdevops/liquibase:postgres \
  $@
