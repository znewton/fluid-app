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
# Use "none" option for Redis to use environment vars to store session info.
```

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
