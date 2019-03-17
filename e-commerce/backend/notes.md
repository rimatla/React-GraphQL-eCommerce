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