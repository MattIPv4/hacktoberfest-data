# Data

## Install MongoDB

```
brew tap mongodb/brew
brew install mongodb-community@4.2
```

## Start MongoDB

```
mongod --config /usr/local/etc/mongod.conf
```

## Import the data into MongoDB

```
mongoimport --db hacktoberfest-2019 --collection pull_requests --file data/pull_requests.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection repositories --file data/repositories.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection users --file data/users.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection spam_repositories --type csv --headerline --file data/spam_repos.csv
```

## Create some indexes

```
mongo
> use hacktoberfest-2019
> db.pull_requests.createIndex({ id: 1 })
> db.repositories.createIndex({ id: 1 })
> db.users.createIndex({ id: 1 })
> db.spam_repositories.createIndex({ 'Repo ID': 1 })
```
