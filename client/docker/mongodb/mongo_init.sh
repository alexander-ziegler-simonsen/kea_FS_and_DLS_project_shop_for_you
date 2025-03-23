# this script should only be runned the first time the docker compose gets run
# TODO - make sure it only run one time

# this script will be setup all our tables, users, privileges and raw data

# create db
mongo --eval 'use shop;'

# create tables / collections
mongo --eval 'db.createCollection("product");'
mongo --eval 'db.createCollection("order");'
mongo --eval 'db.createCollection("user");'

# add roles

# ...... more code goes here

# add dev user
mongo --eval "db.createUser({
    user: \"$MON_D1_USE\", 
    pwd: \"$MON_D1_PASS\", 
    roles:[{role: \"root\", db: \"shop\"}] 
});"

# add user1
mongo --eval "db.createUser({
    user: \"$MON_U1_USE\", 
    pwd: \"$MON_U1_PASS\", 
    roles:[{}] 
});"

# add user2
mongo --eval "db.createUser({
    user: \"$MON_U2_USE\", 
    pwd: \"$MON_U2_PASS\", 
    roles:[{}] 
});"

# add user3
mongo --eval "db.createUser({
    user: \"$MON_U3_USE\", 
    pwd: \"$MON_U3_PASS\", 
    roles:[{}] 
});"