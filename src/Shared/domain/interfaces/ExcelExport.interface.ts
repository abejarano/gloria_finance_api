import { ReportFile } from "@/Shared/domain"

/**
 * Interfaz para el adaptador de exportación a Excel
 *
 * Esta interfaz define los métodos necesarios para exportar datos a Excel
 */
export interface IXLSExportAdapter {
  /**
   * Exporta los datos a un archivo CSV
   *
   */
  export(rows: any[], header: string[], sheetName: string): Promise<ReportFile>
}
