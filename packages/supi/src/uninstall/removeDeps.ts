import { packageManifestLogger } from '@pnpm/core-loggers'
import {
  DEPENDENCIES_FIELDS,
  DependenciesField,
  ProjectManifest,
} from '@pnpm/types'

export default async function (
  packageManifest: ProjectManifest,
  removedPackages: string[],
  opts: {
    saveType?: DependenciesField,
    prefix: string,
  },
): Promise<ProjectManifest> {
  if (opts.saveType) {
    packageManifest[opts.saveType] = packageManifest[opts.saveType]

    if (!packageManifest[opts.saveType]) return packageManifest

    removedPackages.forEach((dependency) => {
      delete packageManifest[opts.saveType as DependenciesField]![dependency]
    })
  } else {
    DEPENDENCIES_FIELDS
      .filter((depField) => packageManifest[depField])
      .forEach((depField) => {
        removedPackages.forEach((dependency) => {
          delete packageManifest[depField]![dependency]
        })
      })
  }
  if (packageManifest.peerDependencies) {
    for (const removedDependency of removedPackages) {
      delete packageManifest.peerDependencies[removedDependency]
    }
  }

  packageManifestLogger.debug({
    prefix: opts.prefix,
    updated: packageManifest,
  })
  return packageManifest
}
