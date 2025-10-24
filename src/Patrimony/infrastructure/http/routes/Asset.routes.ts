import { Request, Response, Router } from "express"
import { PermissionMiddleware } from "@/Shared/infrastructure"
import {
  createAssetController,
  generateInventoryReportController,
  getAssetController,
  listAssetsController,
  updateAssetController,
} from "../controllers/Asset.controller"
import CreateAssetValidator from "../validators/CreateAsset.validator"
import UpdateAssetValidator from "../validators/UpdateAsset.validator"
import ListAssetsValidator from "../validators/ListAssets.validator"
import InventoryReportValidator from "../validators/InventoryReport.validator"
import {
  AssetStatus,
  CreateAssetRequest,
  UpdateAssetRequest,
} from "../../../domain"

const router = Router()

const resolveUserId = (request: Request) => {
  const user = request["user"] || {}

  return user.userId || user.id || user.sub || "system"
}

router.post(
  "/",
  [PermissionMiddleware, CreateAssetValidator],
  async (req: Request, res: Response) => {
    const performedBy = resolveUserId(req)

    await createAssetController(
      {
        ...req.body,
        value: Number(req.body.value),
        status: req.body.status as AssetStatus,
        performedBy,
      } as CreateAssetRequest,
      res
    )
  }
)

router.get(
  "/",
  [PermissionMiddleware, ListAssetsValidator],
  async (req: Request, res: Response) => {
    const performedBy = resolveUserId(req)

    await listAssetsController(
      {
        congregationId:
          typeof req.query.congregationId === "string"
            ? req.query.congregationId
            : undefined,
        category:
          typeof req.query.category === "string"
            ? req.query.category
            : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        perPage: req.query.perPage ? Number(req.query.perPage) : undefined,
        status: req.query.status as AssetStatus,
        search:
          typeof req.query.search === "string" ? req.query.search : undefined,
        performedBy,
      },
      res
    )
  }
)

router.get(
  "/:assetId",
  [PermissionMiddleware],
  async (req: Request, res: Response) => {
    const performedBy = resolveUserId(req)

    await getAssetController(
      {
        assetId: req.params.assetId,
        performedBy,
      },
      res
    )
  }
)

router.put(
  "/:assetId",
  [PermissionMiddleware, UpdateAssetValidator],
  async (req: Request, res: Response) => {
    const performedBy = resolveUserId(req)

    await updateAssetController(
      {
        ...req.body,
        assetId: req.params.assetId,
        value:
          typeof req.body.value !== "undefined"
            ? Number(req.body.value)
            : undefined,
        status: req.body.status as AssetStatus,
        performedBy,
      } as UpdateAssetRequest,
      res
    )
  }
)

router.get(
  "/report/inventory",
  [PermissionMiddleware, InventoryReportValidator],
  async (req: Request, res: Response) => {
    const performedBy = resolveUserId(req)

    await generateInventoryReportController(
      {
        congregationId:
          typeof req.query.congregationId === "string"
            ? req.query.congregationId
            : undefined,
        category:
          typeof req.query.category === "string"
            ? req.query.category
            : undefined,
        format: req.query.format as "csv" | "pdf",
        status: req.query.status as AssetStatus,
        performedBy,
      },
      res
    )
  }
)

export default router
