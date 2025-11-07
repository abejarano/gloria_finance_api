import {
  BASE_PERMISSIONS,
  BASE_ROLES,
  IPermissionRepository,
  IRolePermissionRepository,
  IRoleRepository,
  IUserAssignmentRepository,
  Permission,
  Role,
} from "@/SecuritySystem/domain"
import { Logger } from "@/Shared/adapter"

export type BootstrapPermissionsRequest = {
  churchId: string
  userId: string
}

export class BootstrapPermissions {
  private readonly logger = Logger(BootstrapPermissions.name)

  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly userAssignmentRepository: IUserAssignmentRepository
  ) {}

  async execute(request: BootstrapPermissionsRequest): Promise<void> {
    this.logger.info(
      `Bootstrapping permissions for church ${request.churchId}`
    )

    await this.ensurePermissionsCatalog()
    await this.ensureBaseRoles(request.churchId)
    await this.assignAdminToCreator(request.churchId, request.userId)
  }

  private async ensurePermissionsCatalog(): Promise<void> {
    for (const permissionDefinition of BASE_PERMISSIONS) {
      const existing = await this.permissionRepository.findByModuleAction(
        permissionDefinition.module,
        permissionDefinition.action
      )

      if (!existing) {
        const permission = Permission.create({
          permissionId: permissionDefinition.permissionId,
          module: permissionDefinition.module,
          action: permissionDefinition.action,
          description: permissionDefinition.description,
          isSystem: Boolean(permissionDefinition.isSystem),
        })

        await this.permissionRepository.upsert(permission)
      }
    }
  }

  private async ensureBaseRoles(churchId: string): Promise<void> {
    for (const roleDefinition of BASE_ROLES) {
      const existingRole = await this.roleRepository.findByRoleId(
        churchId,
        roleDefinition.roleId
      )

      if (!existingRole) {
        const role = Role.create(
          churchId,
          roleDefinition.name,
          roleDefinition.description,
          Boolean(roleDefinition.isSystem),
          roleDefinition.roleId
        )
        await this.roleRepository.upsert(role)
      }

      await this.rolePermissionRepository.replacePermissions(
        churchId,
        roleDefinition.roleId,
        roleDefinition.permissions
      )
    }
  }

  private async assignAdminToCreator(
    churchId: string,
    userId: string
  ): Promise<void> {
    const assignment = await this.userAssignmentRepository.assignRoles(
      churchId,
      userId,
      ["ADMIN"]
    )

    this.logger.info(
      `Assigned ADMIN role to user ${assignment.getUserId()} for church ${churchId}`
    )
  }
}
