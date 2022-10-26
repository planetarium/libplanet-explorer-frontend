Libplanet Explorer Frontend
===========================

This project is a user-facing web app, which renders data provided by
a [Libplanet Explorer server][] instance.

[Libplanet Explorer server]: https://github.com/planetarium/libplanet-explorer


Development (without server)
----------------------------

This project uses [yarn](https://yarnpkg.com/) for the package manager. Please enable yarn as the following:

```bash
corepack enable
```

If you get an error message that looks like this: `-bash: corepack: command not found` please install [corepack](https://nodejs.org/dist/latest/docs/api/corepack.html) and try again:

```bash
npm i -g corepack
corepack enable
```

Copy *.env.example* to *.env.development*, and open the copied *.env.development* file and change the value of
`GRAPHQL_ENDPOINT_URI` to refer to our demo server.  The demo server URI can be
found in the first line of *DEPLOYMENTS.tsv*.

Then, install the dependencies and build the app:

~~~~ bash
yarn
yarn dev
~~~~

You can now see the web app from *localhost:8000*.


Development (with server)
-------------------------

First of all, you need to run the server.  See the below repository and
then follow the instruction in its README:

<https://github.com/planetarium/libplanet-explorer>

If you are sure that your server is ready (check *localhost:5000*)
copy *.env.example* to *.env.development* and build the app:

~~~~ bash
yarn
yarn dev
~~~~

You can now see the web app from *localhost:8000*.


Production
----------

Make a *env.production* configuration and then build:

~~~~ bash
{
  echo NETWORK_NAME=example
  echo GRAPHQL_ENDPOINT_URI=https://example.com/graphql/
} > .env.production
yarn
yarn build
~~~~
