# BlinkBox

>Share and download your favorite files

## Prerequisites and install

  1. Install [NVM](https://github.com/creationix/nvm#installation)
  2. Install [NodeJS v7](https://github.com/creationix/nvm#usage)
  3. Install the latest version of Bower `npm install -g bower`
  4. Install Polymer CLI `npm install -g polymer-cli`
  5. Read [tutorials and docs](https://github.com/UNArqui17i-B/Knowledge#polymer)

## Create new application

```
$ polymer init
```

## Viewing your application

```
$ polymer serve
```

## Building your application

```
$ polymer build
```

This will create a `build/` folder with `bundled/` and `unbundled/` sub-folders
containing a bundled (Vulcanized) and unbundled builds, both run through HTML,
CSS, and JS optimizers.

You can serve the built versions by giving `polymer serve` a folder to serve
from:

```
$ polymer serve build/bundled
```

## Running tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.

## License
  - [MIT](./LICENSE)