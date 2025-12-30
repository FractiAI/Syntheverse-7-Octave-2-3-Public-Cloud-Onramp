// Type declarations for node-poppler
declare module 'node-poppler' {
  class Poppler {
    constructor()
    text(inputFile: string, outputFile: string): Promise<void>
  }

  export { Poppler }
}
