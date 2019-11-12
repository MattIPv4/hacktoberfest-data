# Hacktoberfest 2019 Stats

## Data in MongoDB

### Install MongoDB

```
brew tap mongodb/brew
brew install mongodb-community@4.2
```

### Start MongoDB

```
mongod --config /usr/local/etc/mongod.conf
```

### Import the data

```
mongoimport --db hacktoberfest-2019 --collection pull_requests --file data/pull_requests.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection repositories --file data/repositories.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection users --file data/users.json --jsonArray
mongoimport --db hacktoberfest-2019 --collection spam_repositories --type csv --headerline --file data/spam_repos.csv
```

### Create some indexes

```
mongo
> use hacktoberfest-2019
> db.pull_requests.createIndex({ id: 1 })
> db.repositories.createIndex({ id: 1 })
> db.users.createIndex({ id: 1 })
> db.spam_repositories.createIndex({ 'Repo ID': 1 })
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

All the text-based stats will be logged to console.
All the generated charts/graphs will be saved to the `images` directory.

## Linting

This project uses eslint to enforce code-style standards.

```
npm test
```
