AKPI_APP_SUBDOMAIN="bi.atlaskpi.com"
AKPI_MASTER_DB_URI="mongodb://atlas:yA22wflgDf9dZluW@production-shard-00-00-zozly.mongodb.net:27017,production-shard-00-01-zozly.mongodb.net:27017,production-shard-00-02-zozly.mongodb.net:27017/master?ssl=true&replicaSet=Production-shard-0&authSource=admin"
AKPI_MONGODB_API_KEY="16626d64-e21d-4208-b9b0-02a07020e6b7"
AKPI_MONGODB_API_URI="https://cloud.mongodb.com/api/atlas/v1.0/groups/598d2bdd4e658123873e3c98/databaseUsers"
AKPI_MONGODB_API_USERNAME="orlando@atlaskpi.com"
AKPI_MONGODB_GROUP_ID="598d2bdd4e658123873e3c98"
AKPI_NEW_ACCOUNT_DB_URI_FORMAT="mongodb://{{username}}:{{password}}@production-shard-00-00-zozly.mongodb.net:27017,production-shard-00-01-zozly.mongodb.net:27017,production-shard-00-02-zozly.mongodb.net:27017/{{database}}?ssl=true&replicaSet=Production-shard-0&authSource=admin"
AKPI_TOKEN_EXPIRATION="10 d"
AKPI_TOKEN_SECRET="E12CF3551A239BB5EC3F38E848B6F"

# local
AKPI_APP_SUBDOMAIN="d.atlaskpi.com" \
AKPI_MASTER_DB_URI="mongodb://localhost/kpibi" \
AKPI_MONGODB_API_KEY="16626d64-e21d-4208-b9b0-02a07020e6b7" \
AKPI_MONGODB_API_URI="https://cloud.mongodb.com/api/atlas/v1.0/groups/598d2bdd4e658123873e3c98/databaseUsers" \
AKPI_MONGODB_API_USERNAME="orlando@atlaskpi.com" \
AKPI_MONGODB_GROUP_ID="598d2bdd4e658123873e3c98" \
AKPI_NEW_ACCOUNT_DB_URI_FORMAT="mongodb://localhost/{{database}}" \
AKPI_TOKEN_EXPIRATION="10 d" \
AKPI_TOKEN_SECRET="E12CF3551A239BB5E4RF38E848B6F" \
npm start

# production
AKPI_APP_SUBDOMAIN="bi.atlaskpi.com" \
AKPI_MASTER_DB_URI="mongodb://atlas:yA22wflgDf9dZluW@production-shard-00-00-zozly.mongodb.net:27017,production-shard-00-01-zozly.mongodb.net:27017,production-shard-00-02-zozly.mongodb.net:27017/master?ssl=true&replicaSet=Production-shard-0&authSource=admin" \
AKPI_MONGODB_API_KEY="16626d64-e21d-4208-b9b0-02a07020e6b7" \
AKPI_MONGODB_API_URI="https://cloud.mongodb.com/api/atlas/v1.0/groups/598d2bdd4e658123873e3c98/databaseUsers" \
AKPI_MONGODB_API_USERNAME="orlando@atlaskpi.com" \
AKPI_MONGODB_GROUP_ID="598d2bdd4e658123873e3c98" \
AKPI_NEW_ACCOUNT_DB_URI_FORMAT="mongodb://{{username}}:{{password}}@production-shard-00-00-zozly.mongodb.net:27017,production-shard-00-01-zozly.mongodb.net:27017,production-shard-00-02-zozly.mongodb.net:27017/{{database}}?ssl=true&replicaSet=Production-shard-0&authSource=admin" \
AKPI_TOKEN_EXPIRATION="10 d" \
AKPI_TOKEN_SECRET="E12CF3551A239BB5EC3F38E848B6F" \
npm start


docker run \
-e AKPI_APP_SUBDOMAIN="bi.atlaskpi.com" \
-e AKPI_MASTER_DB_URI="mongodb://atlas:yA22wflgDf9dZluW@production-shard-00-00-zozly.mongodb.net:27017,production-shard-00-01-zozly.mongodb.net:27017,production-shard-00-02-zozly.mongodb.net:27017/master?ssl=true&replicaSet=Production-shard-0&authSource=admin" \
-e AKPI_MONGODB_API_KEY="16626d64-e21d-4208-b9b0-02a07020e6b7" \
-e AKPI_MONGODB_API_URI="https://cloud.mongodb.com/api/atlas/v1.0/groups/598d2bdd4e658123873e3c98/databaseUsers" \
-e AKPI_MONGODB_API_USERNAME="orlando@atlaskpi.com" \
-e AKPI_MONGODB_GROUP_ID="598d2bdd4e658123873e3c98" \
-e AKPI_NEW_ACCOUNT_DB_URI_FORMAT="mongodb://{{username}}:{{password}}@production-shard-00-00-zozly.mongodb.net:27017,production-shard-00-01-zozly.mongodb.net:27017,production-shard-00-02-zozly.mongodb.net:27017/{{database}}?ssl=true&replicaSet=Production-shard-0&authSource=admin" \
-e AKPI_TOKEN_EXPIRATION="10 d" \
-e AKPI_TOKEN_SECRET="E12CF3551A239BB5EC3F38E848B6F" \
-p 9091:9091 7c816d482382


