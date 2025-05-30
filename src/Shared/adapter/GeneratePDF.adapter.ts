import { IStorageService } from "@/Shared/domain"
import puppeteer from "puppeteer"
import { v4 } from "uuid"
import * as path from "path"
import { IHTMLAdapter } from "@/Shared/domain/interfaces/GenerateHTML.interface"
import { Logger } from "@/Shared/adapter/CustomLogger"

export abstract class GeneratePDFAdapter {
  protected htmlString: string

  constructor(
    protected readonly htmlAdapter: IHTMLAdapter,
    protected readonly storeService: IStorageService
  ) {}

  abstract htmlTemplate(template: string, data: any): this

  abstract toPDF(upload: boolean): Promise<string>
}

export class PuppeteerAdapter extends GeneratePDFAdapter {
  private logger = Logger(PuppeteerAdapter.name)

  constructor(htmlAdapter: IHTMLAdapter, storeService: IStorageService) {
    super(htmlAdapter, storeService)
  }

  htmlTemplate(template: string, data: any) {
    this.htmlString = this.htmlAdapter.generateHTML(template, data)

    return this
  }

  async toPDF(upload: boolean = true): Promise<string> {
    this.logger.info("Generating PDF from HTML string")

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setContent(this.htmlString)

    const pdfName = `${v4()}.pdf`
    const pdfPath = path.join("/tmp/", pdfName)

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
        right: "0.5in",
      },
    })

    await browser.close()

    if (!upload) {
      return pdfPath
    }

    return await this.storeService.uploadFile({
      tempFilePath: pdfPath,
      name: pdfName,
      mimetype: "application/pdf",
    })
  }
}
