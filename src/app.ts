import "reflect-metadata"
import "dotenv/config"
import { BootstrapStandardServer } from "@abejarano/ts-express-server"
import { Queues } from "@/queues"
import { controllersModule, routerModule } from "@/bootstrap"
import { FactoryService } from "@/bootstrap/FactoryService"
import { ServerSocketService } from "@/bootstrap/ServerSocketService"
import { FinancialSchedules } from "@/Financial/infrastructure/schedules"
import { StartQueueService } from "@/Shared/infrastructure"

export const APP_DIR = __dirname

const server = BootstrapStandardServer(
  Number(process.env.APP_PORT || 8080),
  routerModule(),
  controllersModule()
)

StartQueueService(server.getApp(), Queues())

server.addServices([new FactoryService(), new ServerSocketService()])

server.start().then(() => FinancialSchedules())
