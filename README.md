# NodeJS Starter Project for Apollo GraphQL

(work in progress)

Recently, I started looking at creating applications using NodeJS and Apollo Graphql and I reallized that there is a lot of work involved in order to create all the pillars are going to support your application so I decided to start this effort of creation a barebone project that supports the basis and most common tasks needed to get you going with you app.

This starter was also designed to work for multitenancy where each tenant is going to have its own database on a mongo db instance. There are a few technologies that a put together to come up with this demo so let me list them here:

- NodeJS
- Graphql
- MongoDb/Mongoose
- Typescript
- Mocha
- Chai
- Sinon
- Wallaby

### Authetication

I know, I know, there are many options out there for authentication (passport.js is a good example) But for this project I wanted to keep it simple and in house. In the future I ay be willing to look at other options but for know token authentication (jwt) is more than enough for my needs. 

I am using the `jsonwebtoken` package to generate unique tokens per user. These tokens contains some details about the logged user. You can inspect the details about the identity looking at the IIdentity interface:

```typescript
interface IIdentity {
    firstName: String;
    middleName: String;
    lastName: String;
    username: String;
    roles: [IRole];
    permissions: [IPermission];
    dbUri: String;
}
```

*Note:* As you can see is pretty basic and of course the password is not part of the user identity. 

The system have an specific endpoint to generate the tokens at: `POST /auth/token`. I mentioned earlier that this starter project supports multitenancy so you need to pass the tenant when authenticating. For example when you are trying to generate a token you would have to provide the following details:

```
host: customer.domain.com
username: username
password: password
```

Once the system generates a token it can be used for the next 24h (the expiration time can be configure)

### Authorization
(coming soon)

### Middlewares
(coming soon)

### Multitenancy
(coming soon)

### App Bootstrap
(coming soon)

### Testing
(coming soon)

