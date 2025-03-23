# this script should only be runned the first time the docker compose gets run

# this one line is just to make it easier to find in the debug log
echo "MongoDB docker 'init script' have been started **************
**************************************************************
***************************************************************
****************************************************************"

# if the docker volume is initialized, then skip the rest of the file
if [ -f /data/db/initialized ]; then
    echo "MongoDB is already initialized. Therefore the init script will be skipped"
    exit 0
fi

# this script will be setting up all our tables, users, privileges and raw data

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 10

# start the program
mongosh -u "$MON_USERNAME" -p "$MON_PASSWORD" --authenticationDatabase 'admin'

# # create db
use shop

# # create tables / collections 
# # these are not our final tables, just for testing right now
db.createCollection("product"); # THIS WORKS
sleep 1
db.createCollection("order"); # everything after "product" does not get run for some reason # TODO - work on this
sleep 1
db.createCollection("user");
sleep 1

# # add roles

# # ...... more code goes here

# # add dev user
db.createUser({
    user: "$MON_D1_USE", 
    pwd: "$MON_D1_PASS", 
    roles: [{role: "dbOwner", db: "shop"}] 
});

# add user1
db.createUser({
    user: \"$MON_U1_USE\", 
    pwd: \"$MON_U1_PASS\", 
    roles:[{}] 
});

# add user2
db.createUser({
    user: \"$MON_U2_USE\", 
    pwd: \"$MON_U2_PASS\", 
    roles:[{}] 
});

# add user3
db.createUser({
    user: \"$MON_U3_USE\", 
    pwd: \"$MON_U3_PASS\", 
    roles:[{}] 
});

# keep the container alive
wait $! # TODO - check if this line IS needed to not kill the container