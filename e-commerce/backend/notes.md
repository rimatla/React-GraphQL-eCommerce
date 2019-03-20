# Prisma
- Create an account 
- install prisma -g globally
- `prisma login` authorize and authenticate 

# `prisma init` 
- choose Demo server
- demo-us1 (has less latency)
- choose a name for your service i.e. foobar
- choose a name for your stage => dev
- If you're asked about Prisma Client programing language select `Don't generate`

# secret: ${env:PRISMA_SECRET}
- this will lock up your database so ppl can't add and delete stuff

# `prisma deploy`
- prisma deploy --env-file variables.env
- or `npm run deploy`

# Start server
- `npm run dev` is a combination of debug and playground in parallel 
- `npm run debug` or `npm start`

# Steps to whenever you need to update a piece of data
- datamodel.prisma
- deploy it tp Prisma so DB csn be updated (crucial step) 
- schema.graphql 

# queries playground
```
# Write your query or mutation here
query {
  users {
    id
    name
  }
}
```

```
mutation {
  createUser(data: {
    name: "Jon Dong"
    email: "hu@gmat.com"
  }) {
    name
    email
  }
}
```

```
# Prisma filters
query {
  users(where: {
    name_contains: "Zen"
  }) {
    id
    name
  }
}

```

```
query {
  usersConnection {
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    aggregate {
      count
    }
  }
}
```

``` 
PRISMA PLAYGROUND MUTATION
mutation {
  createItem(data: {
    title: "Sengs"
    description: "qwdef"
    image: "dog.jpg"
    largeImage: "cat.jpg"
    price: 1000
  }) {
    id
    title
  }
}
```
```
YOGA PLAYGROUND MUTATION
mutation {
  createItem(
    title: "Sengs"
    description: "qwdef"
    image: "dog.jpg"
    largeImage: "cat.jpg"
    price: 1000
  ) {
    id
    title
  }
}
```
