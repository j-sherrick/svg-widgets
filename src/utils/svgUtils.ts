import { promises as fs } from 'fs';
import path from 'path';
import { parseStringPromise, Builder } from 'xml2js';

const cleanSvg = async (inputFile: string, outputFile: string) => {
  try {
    const svgContent = await fs.readFile(inputFile, 'utf8');

    // Parse the SVG content to a JavaScript object
    const svgObject = await parseStringPromise(svgContent);

    // Remove unnecessary metadata
    delete svgObject.svg.$['sodipodi:docname'];
    delete svgObject.svg.$['xmlns:inkscape'];
    delete svgObject.svg.$['xmlns:sodipodi'];
    delete svgObject.svg.$['inkscape:version'];

    // Replace Inkscape IDs with layer names
    const replaceIds = (obj: any) => {
      if (obj.$ && obj.$['inkscape:label']) {
        obj.$.id = obj.$['inkscape:label'];
        delete obj.$['inkscape:label'];
      }
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          replaceIds(obj[key]);
        }
      }
    };

    replaceIds(svgObject);

    // Build the cleaned SVG content
    const builder = new Builder();
    const cleanedSvgContent = builder.buildObject(svgObject);

    // Write the cleaned SVG content to the output file
    await fs.writeFile(outputFile, cleanedSvgContent, 'utf8');
  } catch (error) {
    console.error('Error cleaning SVG:', error);
  }
};

const inputFilePath = path.join(__dirname, '../../src/static/template.svg');
const outputFilePath = path.join(__dirname, '../../src/static/cleanedTemplate.svg');

cleanSvg(inputFilePath, outputFilePath);
