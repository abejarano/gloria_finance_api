import "reflect-metadata"
import { Request, Response, NextFunction } from "express"

export const PERMISSION_METADATA_KEY = "rbac:permission"

export function Can(module: string, action: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const permissionKey = `${module}:${action}`

    Reflect.defineMetadata(
      PERMISSION_METADATA_KEY,
      { module, action, permissionKey },
      originalMethod
    )

    descriptor.value = async function (...args: any[]) {
      const [req, res, next] = args as [
        Request & { auth?: any; user?: any },
        Response,
        NextFunction
      ]

      const auth = req?.auth ?? req?.user

      if (!auth) {
        return res.status(401).send({ message: "Unauthorized." })
      }

      const permissions: string[] = auth.permissions ?? []
      const moduleWildcard = `${module}:*`

      const isAllowed =
        permissions.includes(permissionKey) ||
        permissions.includes(moduleWildcard)

      if (!isAllowed) {
        return res.status(403).send({
          message: "Forbidden.",
          requiredPermission: permissionKey,
        })
      }

      req.requiredPermission = permissionKey

      return originalMethod.apply(this, args)
    }
  }
}
