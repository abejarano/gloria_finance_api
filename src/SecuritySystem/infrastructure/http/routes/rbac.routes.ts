import { Router } from "express"
import { PermissionMiddleware } from "@/Shared/infrastructure"
import { RbacController } from "../controllers/rbac/Rbac.controller"

const rbacRouter = Router()
const controller = new RbacController()

rbacRouter.post(
  "/permissions/bootstrap",
  PermissionMiddleware,
  controller.bootstrap.bind(controller)
)

rbacRouter.post(
  "/roles",
  PermissionMiddleware,
  controller.createRole.bind(controller)
)

rbacRouter.post(
  "/roles/:id/permissions",
  PermissionMiddleware,
  controller.assignPermissionsToRole.bind(controller)
)

rbacRouter.post(
  "/users/:id/assignments",
  PermissionMiddleware,
  controller.assignRolesToUser.bind(controller)
)

rbacRouter.get(
  "/users/:id/permissions",
  PermissionMiddleware,
  controller.getUserPermissions.bind(controller)
)

rbacRouter.get(
  "/roles",
  PermissionMiddleware,
  controller.listRoles.bind(controller)
)

rbacRouter.get(
  "/permissions",
  PermissionMiddleware,
  controller.listPermissions.bind(controller)
)

export default rbacRouter
