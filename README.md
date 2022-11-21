Libplanet Explorer Frontend
===========================

This project is a user-facing web app, which renders data provided by
a [Libplanet Explorer server][] instance.

[Libplanet Explorer server]: https://github.com/planetarium/libplanet-explorer

Package Management
------------------

This project uses [yarn](https://yarnpkg.com/) 3+ with PnP installs for package management. Please enable yarn as the following:

```bash
corepack enable
```

If you get an error message that looks like this: `-bash: corepack: command not found` please install [corepack](https://nodejs.org/dist/latest/docs/api/corepack.html) and try again:

```bash
npm i -g corepack
corepack enable
```

Also, if you are using an IDE, you might need to setup the editor SDK on yarn for the IDE to work properly. Refer to https://yarnpkg.com/getting-started/editor-sdks for further instruction.

Development (without server)
----------------------------

Copy *.env.development* (which contains the defaults) to *.env.local*, and open the copied *.env.development* file and change the
`NEXT_PUBLIC_GRAPHQL_ENDPOINTS` list to refer to our demo server.  The demo server URI can be
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
copy *.env.development* to *.env.local* and build the app:

~~~~ bash
yarn
yarn dev
~~~~

You can now see the web app from *localhost:8000*.


Production
----------

Make a *.env.local* configuration and then build:

~~~~ bash
yarn
yarn build
yarn export
~~~~
