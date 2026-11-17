declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfData = { text: string; numpages: number; info?: Record<string, unknown> };
  type PdfOptions = { max?: number; version?: string };
  function pdfParse(data: Buffer, options?: PdfOptions): Promise<PdfData>;
  export default pdfParse;
}
