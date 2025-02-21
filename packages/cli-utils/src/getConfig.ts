import getConfig, { CliOptions } from '@pnpm/config'
import packageManager from './pnpmPkgJson'

export default async function (
  cliOptions: CliOptions,
  opts: {
    excludeReporter: boolean,
    rcOptionsTypes: Record<string, unknown>,
    workspaceDir: string | undefined,
  },
) {
  const { config, warnings } = await getConfig({
    cliOptions,
    packageManager,
    rcOptionsTypes: opts.rcOptionsTypes,
    workspaceDir: opts.workspaceDir,
  })
  config.cliOptions = cliOptions

  if (opts.excludeReporter) {
    delete config.reporter // This is a silly workaround because supi expects a function as opts.reporter
  }

  if (warnings.length > 0) {
    console.log(warnings.join('\n'))
  }

  return config
}
