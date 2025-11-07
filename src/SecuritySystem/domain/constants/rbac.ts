export type BasePermissionDefinition = {
  permissionId: string
  module: string
  action: string
  description: string
  isSystem?: boolean
}

export type BaseRoleDefinition = {
  roleId: string
  name: string
  description: string
  permissions: string[]
  isSystem?: boolean
}

export const BASE_PERMISSIONS: BasePermissionDefinition[] = [
  {
    permissionId: "financial_records:create",
    module: "financial_records",
    action: "create",
    description: "Crear registros financieros",
    isSystem: true,
  },
  {
    permissionId: "financial_records:read",
    module: "financial_records",
    action: "read",
    description: "Consultar registros financieros",
    isSystem: true,
  },
  {
    permissionId: "financial_records:update",
    module: "financial_records",
    action: "update",
    description: "Actualizar registros financieros",
    isSystem: true,
  },
  {
    permissionId: "financial_records:delete",
    module: "financial_records",
    action: "delete",
    description: "Eliminar registros financieros",
    isSystem: true,
  },
  {
    permissionId: "financial_records:export",
    module: "financial_records",
    action: "export",
    description: "Exportar reportes financieros",
    isSystem: true,
  },
  {
    permissionId: "financial_records:*",
    module: "financial_records",
    action: "*",
    description: "Control total de registros financieros",
    isSystem: true,
  },
  {
    permissionId: "accounts_payable:create",
    module: "accounts_payable",
    action: "create",
    description: "Crear cuentas por pagar",
    isSystem: true,
  },
  {
    permissionId: "accounts_payable:read",
    module: "accounts_payable",
    action: "read",
    description: "Consultar cuentas por pagar",
    isSystem: true,
  },
  {
    permissionId: "accounts_payable:update",
    module: "accounts_payable",
    action: "update",
    description: "Actualizar cuentas por pagar",
    isSystem: true,
  },
  {
    permissionId: "accounts_payable:approve",
    module: "accounts_payable",
    action: "approve",
    description: "Aprobar pagos",
    isSystem: true,
  },
  {
    permissionId: "accounts_payable:*",
    module: "accounts_payable",
    action: "*",
    description: "Control total de cuentas por pagar",
    isSystem: true,
  },
  {
    permissionId: "accounts_receivable:read",
    module: "accounts_receivable",
    action: "read",
    description: "Consultar cuentas por cobrar",
    isSystem: true,
  },
  {
    permissionId: "accounts_receivable:update",
    module: "accounts_receivable",
    action: "update",
    description: "Actualizar cuentas por cobrar",
    isSystem: true,
  },
  {
    permissionId: "banking:read",
    module: "banking",
    action: "read",
    description: "Consultar información bancaria",
    isSystem: true,
  },
  {
    permissionId: "banking:reconcile",
    module: "banking",
    action: "reconcile",
    description: "Conciliar estados bancarios",
    isSystem: true,
  },
  {
    permissionId: "banking:*",
    module: "banking",
    action: "*",
    description: "Control total de operaciones bancarias",
    isSystem: true,
  },
  {
    permissionId: "reports:read",
    module: "reports",
    action: "read",
    description: "Visualizar reportes",
    isSystem: true,
  },
  {
    permissionId: "reports:export",
    module: "reports",
    action: "export",
    description: "Exportar reportes",
    isSystem: true,
  },
  {
    permissionId: "reports:*",
    module: "reports",
    action: "*",
    description: "Control total de reportes",
    isSystem: true,
  },
  {
    permissionId: "church:manage",
    module: "church",
    action: "manage",
    description: "Administrar la iglesia",
    isSystem: true,
  },
  {
    permissionId: "members:manage",
    module: "members",
    action: "manage",
    description: "Gestionar miembros",
    isSystem: true,
  },
  {
    permissionId: "rbac:bootstrap",
    module: "rbac",
    action: "bootstrap",
    description: "Inicializar catálogos de permisos y roles",
    isSystem: true,
  },
  {
    permissionId: "rbac:manage_roles",
    module: "rbac",
    action: "manage_roles",
    description: "Gestionar roles y permisos",
    isSystem: true,
  },
  {
    permissionId: "rbac:assign_roles",
    module: "rbac",
    action: "assign_roles",
    description: "Asignar roles a usuarios",
    isSystem: true,
  },
  {
    permissionId: "rbac:read",
    module: "rbac",
    action: "read",
    description: "Consultar información de RBAC",
    isSystem: true,
  },
]

export const BASE_ROLES: BaseRoleDefinition[] = [
  {
    roleId: "ADMIN",
    name: "Administrador",
    description: "Acceso total a la plataforma",
    permissions: [
      "financial_records:*",
      "accounts_payable:*",
      "accounts_receivable:read",
      "banking:*",
      "reports:*",
      "church:manage",
      "members:manage",
      "rbac:bootstrap",
      "rbac:manage_roles",
      "rbac:assign_roles",
      "rbac:read",
    ],
    isSystem: true,
  },
  {
    roleId: "PASTOR",
    name: "Pastor",
    description: "Visualización general y administración de miembros",
    permissions: [
      "financial_records:read",
      "reports:read",
      "church:manage",
      "members:manage",
    ],
    isSystem: true,
  },
  {
    roleId: "TESORERO",
    name: "Tesorero",
    description: "Gestión financiera y bancaria",
    permissions: [
      "financial_records:create",
      "financial_records:update",
      "accounts_payable:*",
      "accounts_receivable:read",
      "banking:*",
      "reports:export",
    ],
    isSystem: true,
  },
  {
    roleId: "CONTADOR",
    name: "Contador",
    description: "Control contable y reportes",
    permissions: [
      "financial_records:read",
      "financial_records:export",
      "accounts_payable:read",
      "accounts_receivable:read",
      "reports:read",
    ],
    isSystem: true,
  },
  {
    roleId: "AUDITOR",
    name: "Auditor",
    description: "Auditoría de información financiera",
    permissions: [
      "financial_records:read",
      "reports:read",
      "banking:read",
    ],
    isSystem: true,
  },
]
