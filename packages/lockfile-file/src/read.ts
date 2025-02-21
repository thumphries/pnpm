
import {
  LOCKFILE_VERSION,
  WANTED_LOCKFILE,
} from '@pnpm/constants'
import { Lockfile } from '@pnpm/lockfile-types'
import { DEPENDENCIES_FIELDS } from '@pnpm/types'
import path = require('path')
import readYamlFile from 'read-yaml-file'
import { LockfileBreakingChangeError } from './errors'
import logger from './logger'

export async function readCurrentLockfile (
  virtualStoreDir: string,
  opts: {
    wantedVersion?: number,
    ignoreIncompatible: boolean,
  },
): Promise<Lockfile | null> {
  const lockfilePath = path.join(virtualStoreDir, 'lock.yaml')
  return _read(lockfilePath, virtualStoreDir, opts)
}

export async function readWantedLockfile (
  pkgPath: string,
  opts: {
    wantedVersion?: number,
    ignoreIncompatible: boolean,
  },
): Promise<Lockfile | null> {
  const lockfilePath = path.join(pkgPath, WANTED_LOCKFILE)
  return _read(lockfilePath, pkgPath, opts)
}

async function _read (
  lockfilePath: string,
  prefix: string,
  opts: {
    wantedVersion?: number,
    ignoreIncompatible: boolean,
  },
): Promise<Lockfile | null> {
  let lockfile
  try {
    lockfile = await readYamlFile<Lockfile>(lockfilePath)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err
    }
    return null
  }
  // tslint:disable:no-string-literal
  if (typeof lockfile?.['specifiers'] !== 'undefined') {
    lockfile.importers = {
      '.': {
        specifiers: lockfile['specifiers'],
      },
    }
    delete lockfile['specifiers']
    for (const depType of DEPENDENCIES_FIELDS) {
      if (lockfile[depType]) {
        lockfile.importers['.'][depType] = lockfile[depType]
        delete lockfile[depType]
      }
    }
  }
  if (lockfile) {
    // tslint:enable:no-string-literal
    if (typeof opts.wantedVersion !== 'number' || Math.floor(lockfile.lockfileVersion) === Math.floor(opts.wantedVersion)) {
      if (typeof opts.wantedVersion === 'number' && lockfile.lockfileVersion > opts.wantedVersion) {
        logger.warn({
          message: `Your ${WANTED_LOCKFILE} was generated by a newer version of pnpm. ` +
            `It is a compatible version but it might get downgraded to version ${opts.wantedVersion}`,
          prefix,
        })
      }
      return lockfile
    }
  }
  if (opts.ignoreIncompatible) {
    logger.warn({
      message: `Ignoring not compatible lockfile at ${lockfilePath}`,
      prefix,
    })
    return null
  }
  throw new LockfileBreakingChangeError(lockfilePath)
}

export function createLockfileObject (
  importerIds: string[],
  opts: {
    lockfileVersion: number,
  },
) {
  const importers = importerIds.reduce((acc, importerId) => {
    acc[importerId] = {
      dependencies: {},
      specifiers: {},
    }
    return acc
  }, {})
  return {
    importers,
    lockfileVersion: opts.lockfileVersion || LOCKFILE_VERSION,
  }
}
