# Hacktoberfest 2020 Stats

## Data in MongoDB

_Unfortunately, the Hacktoberfest 2020 raw data isn't public currently._
_These mostly act as notes to myself for next year, so I know what I'm doing._

### Install MongoDB

```
brew tap mongodb/brew
brew install mongodb-community@4.2
```

### Start MongoDB

```
mongod --config /usr/local/etc/mongod.conf
```

### Create the empty collections

```
mongo
> use hacktoberfest-2020
> db.createCollection('pull_requests')
> db.createCollection('repositories')
> db.createCollection('users')
> db.createCollection('spam_repositories')
```

### Create some indexes

This helps with faster lookups, but also to ensure unique records

```
mongo
> use hacktoberfest-2020
> db.pull_requests.createIndex({ id: 1 }, { unique: true })
> db.pull_requests.createIndex({ 'app.state': 1 }, { unique: false })
> db.pull_requests.createIndex({ 'base.repo.id': 1 }, { unique: false })
> db.repositories.createIndex({ id: 1 }, { unique: true })
> db.users.createIndex({ 'app.id': 1 }, { unique: true })
> db.users.createIndex({ id: 1 }, { unique: false })
> db.users.createIndex({ 'app.receipt.repository.databaseId': 1 }, { unique: false })
> db.spam_repositories.createIndex({ 'Repo ID': 1 }, { unique: true })
```

### Import the data

```
mongoimport --db hacktoberfest-2020 --collection pull_requests --file data/2020/pull_requests.json --jsonArray
mongoimport --db hacktoberfest-2020 --collection repositories --file data/2020/repositories.json --jsonArray
mongoimport --db hacktoberfest-2020 --collection users --file data/2020/users.json --jsonArray
mongoimport --db hacktoberfest-2020 --collection spam_repositories --type csv --headerline --file data/2020/spam_repos.csv
```

## Generating the stats

### Install the project's dependencies

If you have NVM, run `nvm use`.
Otherwise, ensure that you are running Node 12.x (preferably 12.10.0 as per .nvmrc).

```
npm install
```

### Run the script

```
npm start
```

### Output

All the text-based stats will be logged to console and saved to `generated/stats.txt`.
All the generated charts/graphs will be saved to the `generated` directory.

## Linting

This project uses eslint to enforce code-style standards.

```
npm test
```
