# Hacktoberfest Stats

## Getting some data

Unfortunately, the raw data from Hacktoberfest is not publicly available.
However, we are able to share the schema for the JSON data input that is used for this script:

```yaml
schema:
  type: object
  properties:
    generation:
      type: object
      properties:
        started:
          type: string
          format: date-time
        ended:
          type: string
          format: date-time
    data:
      type: object
      properties:
        users:
          type: object
          properties:
            states:
              type: object
              properties:
                daily:
                  type: object
                  additionalProperties:
                    type: object
                    properties:
                      states:
                        type: object
                        additionalProperties:
                          type: integer
                      count:
                        type: integer
                all:
                  type: object
                  properties:
                    states:
                      type: object
                      additionalProperties:
                        type: integer
                    count:
                      type: integer
            providers:
              type: object
              additionalProperties:
                type: object
                properties:
                  states:
                    type: object
                    additionalProperties:
                      type: integer
                  count:
                    type: integer
            metadata:
              type: object
              additionalProperties:
                type: object
                properties:
                  values:
                    type: object
                    additionalProperties:
                      type: object
                      properties:
                        states:
                          type: object
                          additionalProperties:
                            type: integer
                        count:
                          type: integer
            pull_requests:
              type: object
              additionalProperties:
                type: object
                properties:
                  states:
                    type: object
                    additionalProperties:
                      type: object
                      properties:
                        counts:
                          type: object
                          additionalProperties:
                            type: integer
                        average:
                          type: integer
                  all:
                    type: object
                    properties:
                      counts:
                        type: object
                        additionalProperties:
                          type: integer
                      average:
                        type: integer
        pull_requests:
          type: object
          properties:
            states:
              type: object
              properties:
                daily:
                  type: object
                  additionalProperties:
                    type: object
                    properties:
                      states:
                        type: object
                        additionalProperties:
                          type: integer
                      count:
                        type: integer
                all:
                  type: object
                  properties:
                    states:
                      type: object
                      additionalProperties:
                        type: integer
                    count:
                      type: integer
            providers:
              type: object
              properties:
                daily:
                  type: object
                  additionalProperties:
                    type: object
                    properties:
                      providers:
                        type: object
                        additionalProperties:
                          type: object
                          properties:
                            states:
                              type: object
                              additionalProperties:
                                type: integer
                            count:
                              type: integer
                all:
                  type: object
                  properties:
                    providers:
                      type: object
                      additionalProperties:
                        type: object
                        properties:
                          states:
                            type: object
                            additionalProperties:
                              type: integer
                          count:
                            type: integer
            languages:
              type: object
              properties:
                daily:
                  type: object
                  additionalProperties:
                    type: object
                    properties:
                      languages:
                        type: object
                        additionalProperties:
                          type: object
                          properties:
                            states:
                              type: object
                              additionalProperties:
                                type: integer
                            count:
                              type: integer
                all:
                  type: object
                  properties:
                    languages:
                      type: object
                      additionalProperties:
                        type: object
                        properties:
                          states:
                            type: object
                            additionalProperties:
                              type: integer
                          count:
                            type: integer
            merged:
              type: object
              additionalProperties:
                type: object
                properties:
                  states:
                    type: object
                    additionalProperties:
                      type: integer
                  count:
                    type: integer
            approved:
              type: object
              additionalProperties:
                type: object
                properties:
                  states:
                    type: object
                    additionalProperties:
                      type: integer
                  count:
                    type: integer
            additions:
              type: object
              properties:
                states:
                  type: object
                  additionalProperties:
                    type: integer
                count:
                  type: integer
            deletions:
              type: object
              properties:
                states:
                  type: object
                  additionalProperties:
                    type: integer
                count:
                  type: integer
            files:
              type: object
              properties:
                states:
                  type: object
                  additionalProperties:
                    type: integer
                count:
                  type: integer
            commits:
              type: object
              properties:
                states:
                  type: object
                  additionalProperties:
                    type: integer
                count:
                  type: integer
        repositories:
          type: object
          properties:
            pull_requests:
              type: object
              additionalProperties:
                type: object
                properties:
                  counts:
                    type: object
                    additionalProperties:
                      type: integer
                  count:
                    type: integer
                  average:
                    type: number
            languages:
              type: object
              properties:
                languages:
                  type: object
                  additionalProperties:
                    type: integer
                unique:
                  type: integer
            licenses:
              type: object
              properties:
                licenses:
                  type: object
                  additionalProperties:
                    type: integer
                unique:
                  type: integer
        excluded_repositories:
          type: object
          properties:
            active:
              type: object
              additionalProperties:
                type: object
                properties:
                  has_note:
                    type: object
                    additionalProperties:
                      type: object
                      properties:
                        reports:
                          type: object
                          additionalProperties:
                            type: integer
                        count:
                          type: integer
                  count:
                    type: integer
            count:
              type: integer
```

This schema is part of a larger OpenAPI 3.0 schema that is used to describe the whole API behind
Hacktoberfest. When generating data, keep in mind that many parts of this schema rely on
`additionalProperties` rather than explicit properties. In many cases this may simply be
`true`/`false` for flags, or assorted state names (`spam`, `waiting`, `accepted`, etc.). Make sure
you have all the state names that the script expects from Hacktoberfest in your data (you may need
to do a bit of trial and error to get everything).

Once you have data in a JSON file that conforms to this schema, update the
[`src/index.js`](src/index.js) file to load it in.

## Generating the stats

### Install the project's dependencies

If you have NVM, run `nvm use`.
Otherwise, ensure that you are running Node 16.x (preferably 16.13.0 as per .nvmrc).

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
