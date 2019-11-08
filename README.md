# JSON Data

## Install MongoDB

```
brew tap mongodb/brew
brew install mongodb-community@4.2
```

## Start MongoDB

```
mongod --config /usr/local/etc/mongod.conf
```

## Import the JSON into MongoDB

```
mongoimport --db hacktoberfest-2019 --collection pull_requests --file data/pull_requests.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection repositories --file data/repositories.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection users --file data/users.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection spam_repositories --type csv --headerline --file data/spam_repos.csv
```
