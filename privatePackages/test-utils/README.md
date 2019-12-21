# @pnpm/test-utils

> Utils for testing projects that use pnpm

## Installation

```
pnpm install -D @pnpm/test-utils
```

## Usage

```ts
import test = require('tape')
import assertProject from '@pnpm/test-utils'

test('...', t => {
  // ...
  const project = assertProject(t, pathToProject)

  await project.has('foo')
  // Test fails if project has no foo in node_modules
})
```

## License

MIT © [Zoltan Kochan](https://www.kochan.io/)
