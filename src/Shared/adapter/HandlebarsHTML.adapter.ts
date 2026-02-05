import type { IHTMLAdapter } from "@/Shared/domain/interfaces/GenerateHTML.interface"
import Handlebars from "handlebars"
import * as fs from "fs"
import * as path from "node:path"
import { APP_DIR } from "@/app"
import { Logger } from "@/Shared/adapter/CustomLogger"

const handlebars =
  (Handlebars as unknown as { default?: typeof Handlebars }).default ||
  Handlebars

type Translations = Record<string, unknown>
const DEFAULT_LOCALE = "pt-BR"

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export class HandlebarsHTMLAdapter implements IHTMLAdapter {
  private logger = Logger(HandlebarsHTMLAdapter.name)
  private translations: Record<string, Translations>
  private availableLocales: string[]

  constructor() {
    this.translations = this.loadTranslations()
    this.availableLocales = Object.keys(this.translations)

    handlebars.registerHelper(
      "ifEquals",
      function (this: unknown, arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this)
      }
    )

    handlebars.registerHelper("inc", (value: number) => value + 1)

    handlebars.registerHelper("formatDate", (date: string) => {
      return new Intl.DateTimeFormat("es-ES").format(new Date(date))
    })

    handlebars.registerHelper("subtract", (a: number, b: number) => {
      const left = Number(a) || 0
      const right = Number(b) || 0

      return (left - right).toFixed(2)
    })

    handlebars.registerHelper("formatCurrency", (value: unknown) => {
      const numericValue = Number(value)
      const safeValue = Number.isFinite(numericValue) ? numericValue : 0

      if (safeValue < 0) {
        return `(${brlFormatter.format(Math.abs(safeValue))})`
      }

      return brlFormatter.format(safeValue)
    })

    handlebars.registerHelper("formatExpense", (value: unknown) => {
      const numericValue = Number(value)
      const safeValue = Number.isFinite(numericValue) ? numericValue : 0

      // For expenses, always show with minus sign
      if (safeValue > 0) {
        return `- ${brlFormatter.format(safeValue)}`
      } else if (safeValue < 0) {
        // If already negative (edge case), show as positive with minus
        return `- ${brlFormatter.format(Math.abs(safeValue))}`
      }

      return brlFormatter.format(0)
    })

    handlebars.registerHelper("isNegative", (value: unknown) => {
      const numericValue = Number(value)

      return Number.isFinite(numericValue) && numericValue < 0
    })

    handlebars.registerHelper("isExpense", (value: unknown) => {
      const numericValue = Number(value)
      // An expense is considered as any positive cost value
      return Number.isFinite(numericValue) && numericValue > 0
    })

    handlebars.registerHelper(
      "translateCategory",
      (category: string, options: any) => {
        if (!category) {
          return ""
        }

        const locale = this.resolveLocale(options?.data?.root)
        const key = `categories.${category}.label`
        const translation = this.lookupTranslation(locale, key)

        if (typeof translation === "string" && translation.trim().length > 0) {
          return translation
        }

        return category
          .toLowerCase()
          .split(/[_\s-]+/)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      }
    )

    handlebars.registerHelper(
      "categoryDescription",
      (category: string, options: any) => {
        if (!category) {
          return ""
        }

        const locale = this.resolveLocale(options?.data?.root)
        const key = `categories.${category}.description`
        const translation = this.lookupTranslation(locale, key)

        if (typeof translation === "string") {
          return translation
        }

        return ""
      }
    )

    handlebars.registerHelper("t", (key: string, options: any) => {
      const locale = this.resolveLocale(options?.data?.root)
      const translation = this.lookupTranslation(locale, key)

      if (typeof translation !== "string") {
        return ""
      }

      const params = options?.hash ?? {}
      return this.interpolate(translation, params)
    })

    handlebars.registerHelper("i18nLang", (options: any) => {
      return this.resolveLocale(options?.data?.root)
    })
  }

  generateHTML(templateName: string, data: any, locale?: string): string {
    this.logger.info(
      `Generating HTML from template: ${templateName}, lang ${locale}`,
      data
    )

    const templatePath = this.resolveTemplatePath(templateName)
    const htmlTemplate = fs.readFileSync(templatePath, "utf8")

    const template = handlebars.compile(htmlTemplate)

    const payload = this.withLocale(data, locale)

    return template(payload)
  }

  private loadTranslations(): Record<string, Translations> {
    const translations: Record<string, Translations> = {}
    const roots = [
      typeof APP_DIR === "string"
        ? path.join(APP_DIR, "templates", "i18n")
        : undefined,
      path.join(process.cwd(), "dist", "templates", "i18n"),
      path.join(process.cwd(), "src", "templates", "i18n"),
      path.join(process.cwd(), "templates", "i18n"),
    ].filter(Boolean) as string[]

    for (const root of roots) {
      if (!fs.existsSync(root)) {
        continue
      }

      const files = fs
        .readdirSync(root)
        .filter((file) => file.endsWith(".json"))
      for (const file of files) {
        const locale = path.basename(file, ".json")
        if (translations[locale]) {
          continue
        }
        const content = fs.readFileSync(path.join(root, file), "utf8")
        translations[locale] = JSON.parse(content)
      }
    }

    return translations
  }

  private resolveLocale(data: any): string {
    const candidate = data?.lang
    const normalized = this.normalizeLocale(candidate)
    if (this.availableLocales.includes(normalized)) {
      return normalized
    }
    if (this.availableLocales.includes(DEFAULT_LOCALE)) {
      return DEFAULT_LOCALE
    }
    return this.availableLocales[0] ?? DEFAULT_LOCALE
  }

  private normalizeLocale(value?: string): string {
    if (!value) {
      return DEFAULT_LOCALE
    }

    const normalized = value.replace("_", "-").trim()
    const lower = normalized.toLowerCase()

    if (lower.startsWith("pt")) {
      return "pt-BR"
    }
    if (lower.startsWith("es")) {
      return "es"
    }

    return normalized
  }

  private lookupTranslation(locale: string, key: string): unknown {
    const catalog = this.translations[locale]
    if (!catalog || !key) {
      return undefined
    }

    return key.split(".").reduce<unknown>((current, part) => {
      if (!current || typeof current !== "object") {
        return undefined
      }
      return (current as Record<string, unknown>)[part]
    }, catalog)
  }

  private interpolate(text: string, params: Record<string, unknown>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, token) => {
      const value = params[token]
      return value === undefined || value === null ? "" : String(value)
    })
  }

  private withLocale(data: any, locale?: string): any {
    if (!locale) {
      return data
    }

    if (data && typeof data === "object") {
      return { ...data, lang: locale }
    }

    return { lang: locale }
  }

  private resolveTemplatePath(templateName: string): string {
    const templateFile = `${templateName}.hbs`
    const roots = [
      typeof APP_DIR === "string" ? path.join(APP_DIR, "templates") : undefined,
      path.join(process.cwd(), "dist", "templates"),
      path.join(process.cwd(), "src", "templates"),
      path.join(process.cwd(), "templates"),
    ].filter(Boolean) as string[]

    for (const root of roots) {
      const candidate = path.join(root, templateFile)
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }

    throw new Error(`Invalid path: template ${templateFile} not found`)
  }
}
