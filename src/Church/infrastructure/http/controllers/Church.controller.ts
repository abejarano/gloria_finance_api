import { Request } from "express"
import { HttpStatus } from "../../../../Shared/domain"
import domainResponse from "../../../../Shared/helpers/domainResponse"
import { Church, ChurchPaginateRequest, ChurchRequest } from "../../../domain"
import {
  CreateOrUpdateChurch,
  FindChurchById,
  RemoveMinister,
  SearchChurches,
  SearchChurchesByDistrictId,
  WithoutAssignedMinister,
} from "../../../applications"
import { ChurchMongoRepository } from "../../persistence/ChurchMongoRepository"
import { MinisterMongoRepository } from "../../persistence/MinisterMongoRepository"
import { FirstLoadFinancialConcepts } from "../../../../Financial/applications"
import { FinancialConceptMongoRepository } from "../../../../Financial/infrastructure/persistence"
import { GenerateFinancialMonths } from "../../../../ConsolidatedFinancial/applications"
import { FinancialYearMongoRepository } from "../../../../ConsolidatedFinancial/infrastructure"
import { BootstrapPermissions } from "@/SecuritySystem/applications"
import {
  PermissionMongoRepository,
  RoleMongoRepository,
  RolePermissionMongoRepository,
  UserAssignmentMongoRepository,
} from "@/SecuritySystem/infrastructure"
// import {
//   MinisterMongoRepository,
//   RegionMongoRepository,
// } from "../../../../OrganizacionalStructure/infrastructure";

type AuthContext = {
  userId: string
  churchId: string
  roles: string[]
  permissions: string[]
}

export class ChurchController {
  static async createOrUpdate(req: Request, res) {
    try {
      const request = req.body as ChurchRequest
      const auth = (req as any)["auth"] as AuthContext | undefined

      const church = await new CreateOrUpdateChurch(
        ChurchMongoRepository.getInstance()
        //RegionMongoRepository.getInstance(),
      ).execute(request)

      if (!request.churchId) {
        await new FirstLoadFinancialConcepts(
          FinancialConceptMongoRepository.getInstance(),
          ChurchMongoRepository.getInstance()
        ).execute(church.getChurchId())

        await new GenerateFinancialMonths(
          FinancialYearMongoRepository.getInstance()
        ).execute({
          churchId: church.getChurchId(),
          year: new Date().getFullYear(),
        })

        if (auth?.userId) {
          await new BootstrapPermissions(
            PermissionMongoRepository.getInstance(),
            RoleMongoRepository.getInstance(),
            RolePermissionMongoRepository.getInstance(),
            UserAssignmentMongoRepository.getInstance()
          ).execute({
            churchId: church.getChurchId(),
            userId: auth.userId,
          })
        }
      }

      res.status(HttpStatus.CREATED).send({ message: "Registered Church" })
    } catch (e) {
      domainResponse(e, res)
    }
  }

  static async list(req: ChurchPaginateRequest, res) {
    try {
      const churches = await new SearchChurches(
        ChurchMongoRepository.getInstance()
      ).execute(req)

      res.status(HttpStatus.OK).send({
        // data: PaginateChurchDto(
        //   churches,
        //   await MinisterMongoRepository.getInstance().allActive(),
        // ),
      })
    } catch (e) {
      domainResponse(e, res)
    }
  }

  static async listByDistrictId(districtId: string, res) {
    try {
      const churches = await new SearchChurchesByDistrictId(
        ChurchMongoRepository.getInstance()
      ).execute(districtId)

      res.status(HttpStatus.OK).send({
        data: churches,
      })
    } catch (e) {
      domainResponse(e, res)
    }
  }

  static async findByChurchId(churchId: string, res) {
    try {
      const church: Church = await new FindChurchById(
        ChurchMongoRepository.getInstance()
      ).execute(churchId)

      res.status(HttpStatus.OK).send(church)
    } catch (e) {
      domainResponse(e, res)
    }
  }

  static async listWithoutAssignedMinister(res) {
    try {
      const churches = await new WithoutAssignedMinister(
        ChurchMongoRepository.getInstance()
      ).execute()

      res.status(HttpStatus.OK).send({
        data: churches,
      })
    } catch (e) {
      domainResponse(e, res)
    }
  }

  static async removeMinister(churchId: string, res) {
    try {
      await new RemoveMinister(
        MinisterMongoRepository.getInstance(),
        ChurchMongoRepository.getInstance()
      ).execute(churchId)

      res.status(HttpStatus.OK).send({ message: "Minister removed" })
    } catch (e) {
      domainResponse(e, res)
    }
  }
}
