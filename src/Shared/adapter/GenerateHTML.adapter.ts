import { IHTMLAdapter } from "@/Shared/domain/interfaces/GenerateHTML.interface"
import * as handlebars from "handlebars"
import fs from "node:fs"
import { APP_DIR } from "@/app"
import puppeteer from "puppeteer"
import path from "node:path"
import { v4 } from "uuid"

export class GenerateHTMLAdapter implements IHTMLAdapter {
  constructor() {
    handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this)
    })

    handlebars.registerHelper("inc", (value: number) => value + 1)

    handlebars.registerHelper("formatDate", (date: string) => {
      return new Intl.DateTimeFormat("es-ES").format(new Date(date))
    })
  }

  generateHTML(templateName: string, data: any): string {
    const loadTemplate = (path: string) => {
      return fs.readFileSync(path, "utf8")
    }

    const htmlTemplate = loadTemplate(
      `${APP_DIR}/templates/${templateName}.hbs`
    )

    const template = handlebars.compile(htmlTemplate)

    return template(data)
  }

  async toPDF(html: string): Promise<string> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setContent(html)

    const pdfPath = path.join("/tmp/", `${v4()}.pdf`)

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        bottom: "0.5in",
        left: "1in",
        right: "1in",
      },
    })

    await browser.close()

    return pdfPath
  }
}
