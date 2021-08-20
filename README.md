# fluid-app

Test fluid app

## Run Locally

This project uses `yarn` with Plug'n'Play, so [install yarn](https://yarnpkg.com/getting-started/install) before continuing:

```shell
npm i -g yarn
```

Install dependencies:

```shell
yarn
```

(Optional) [Install and start Redis](https://redis.io/topics/quickstart) locally:

```shell
brew install redis
redis-server
```

Setup the configs:

```shell
cp src/config/config.example.ts src/config/config.ts
# Update config in your favorite editor.
```

> Note: if not using Redis to store session info, set the redis config to `undefined` or "env" in config.ts
> ```ts
> export const redisConfig = redisConfigs.none; // or undefined or "env"
> ```

Run with live updates on change:

```shell
yarn dev
```

Build and run statically:

```shell
yarn build
yarn start
```

## Dev Troubleshooting

### VSCode can't resolve module imports

1. Open a `.ts` file
2. In bottom right corner, click the TS version (e.g. 4.2.3)
3. Choose `Select TypeScript Version`
4. Choose `Use Workspace Version` (should have `-pnpify` suffix)

## VSCode says ESLint can't format file

1. Press Cmd+Shift+P (or View > Command Pallet)
2. Execute `Select Node Path`
3. Select `Use NODE_PATH value defined by setting`

## Fluid Development Testing

Sometimes, you want to test local changes to FluidFramework with a more complex sample app than provided in the examples.
One way to do that is to use this app with locally published NPM packages!

1. Install and run [Verdaccio](https://verdaccio.org/) using Docker.

```shell
docker pull verdaccio/verdaccio
docker run -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
```

2. Verify Verdaccio is running by navigating to [localhost:4873](http://localhost:4873). You should see the Verdaccio registry landing page.
3. Navigate to your FluidFramework clone and build

```shell
cd ~/FluidFramework
npm install
npm run build
```

4. Configure your local Verdaccio registry

```shell
npm set registry http://localhost:4873/
npm adduser --registry http://localhost:4873
npm login
```

5. Publish all FluidFramework packages to Verdaccio, then reset your local NPM registry config. This will publish all the lerna packages at the current version, which should be enough to run this app.

```shell
npx lerna exec --no-bail --parallel --stream -- npm publish
npm set registry https://registry.npmjs.org
```

> **Note:** you can specify a tag for the publish version. Simply append `--tag <tag>` to the publish command above, then replace `@latest` with `@<tag>` in the up command below.

6. Navigate to this app, set the appropriate `npmScopes` configs in `.yarnrc.yml`, and install latest dependencies

```shell
cd ~/fluid-app
yarn config set npmScopes.fluidframework --json '{ "npmRegistryServer": "http://localhost:4873", "npmAlwaysAuth": false }'
yarn config set unsafeHttpWhitelist --json '["localhost"]'
yarn up '@fluidframework/*@latest'
yarn
```
