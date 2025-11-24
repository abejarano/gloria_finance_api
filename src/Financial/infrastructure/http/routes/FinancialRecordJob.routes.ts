import { Router, Response, Request } from "express"
import {
  Can,
  PermissionMiddleware,
  QueueService,
} from "@/Shared/infrastructure"
import { HttpStatus, QueueName } from "@/Shared/domain"
import RebuildMasterDataValidator from "@/Financial/infrastructure/http/validators/RebuildMasterData.validator"

const financialJobRoute = Router()

financialJobRoute.post(
  "/rebuild/availabilityAccount",
  [PermissionMiddleware, RebuildMasterDataValidator, Can("tools", ["admin"])],
  async (req: Request, res: Response) => {
    QueueService.getInstance().dispatch(
      QueueName.RebuildAvailabilityMasterAccountJob,
      {
        ...req.body,
      }
    )

    res.status(HttpStatus.OK).send({ message: "process" })
  }
)

financialJobRoute.post(
  "/rebuild/costcenter",
  [PermissionMiddleware, RebuildMasterDataValidator, Can("tools", ["admin"])],
  async (req: Request, res) => {
    QueueService.getInstance().dispatch(QueueName.RebuildCostCenterMasterJob, {
      ...req.body,
    })
    res.status(HttpStatus.OK).send({ message: "process" })
  }
)

export default financialJobRoute
