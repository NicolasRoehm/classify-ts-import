// External modules
import { workspace }      from 'vscode';

// Models
import { ImportCategory } from '../models/import-category.model';

export class ImportHelper
{
  public static getCategories() : ImportCategory[]
  {
    const extConfig  = workspace.getConfiguration('angular-vscode-extension')
    const parameters : any[]          = extConfig.import.categories;
    const categories : ImportCategory[] = [];
    for (let parameter of parameters)
      categories.push(new ImportCategory(parameter));
    return categories;
  }

  public static classifyLines(lines : string[]) : string[]
  {
    let classified : string[] = [];

    // TODO Add pages
    // TODO Add AWS modules

    const angularLines   : string[] = ['// Angular modules'];
    const ionicLines     : string[] = ['// Ionic modules'];
    const externalLines  : string[] = ['// External modules'];
    const moduleLines    : string[] = ['// Internal modules'];
    const serviceLines   : string[] = ['// Services'];
    const helperLines    : string[] = ['// Helpers'];
    const modelLines     : string[] = ['// Models'];
    const enumLines      : string[] = ['// Enums'];
    const componentLines : string[] = ['// Components'];

    for (const line of lines)
    {
      const hasAngular   = line.includes('@angular');
      const hasIonic     = line.includes('ionic');
      const hasModule    = line.includes('.module');
      const hasService   = line.includes('.service');
      const hasHelper    = line.includes('.helper');
      const hasModel     = line.includes('.model');
      const hasEnum      = line.includes('.enum');
      const hasComponent = line.includes('.component');

      if (hasAngular)
      {
        angularLines.push(line);
        continue;
      }

      if (hasIonic)
      {
        ionicLines.push(line);
        continue;
      }

      if (hasModule)
      {
        moduleLines.push(line);
        continue;
      }

      if (hasService)
      {
        serviceLines.push(line);
        continue;
      }

      if (hasHelper)
      {
        helperLines.push(line);
        continue;
      }

      if (hasModel)
      {
        modelLines.push(line);
        continue;
      }

      if (hasEnum)
      {
        enumLines.push(line);
        continue;
      }

      if (hasComponent)
      {
        componentLines.push(line);
        continue;
      }

      externalLines.push(line);
    }

    angularLines.push(  '');
    ionicLines.push(    '');
    externalLines.push( '');
    moduleLines.push(   '');
    serviceLines.push(  '');
    helperLines.push(   '');
    modelLines.push(    '');
    enumLines.push(     '');
    // componentLines.push('');

    if (angularLines.length > 2)
      classified = [...classified, ...angularLines];
    if (ionicLines.length > 2)
      classified = [...classified, ...ionicLines];
    if (externalLines.length > 2)
      classified = [...classified, ...externalLines];
    if (moduleLines.length > 2)
      classified = [...classified, ...moduleLines];
    if (serviceLines.length > 2)
      classified = [...classified, ...serviceLines];
    if (helperLines.length > 2)
      classified = [...classified, ...helperLines];
    if (modelLines.length > 2)
      classified = [...classified, ...modelLines];
    if (enumLines.length > 2)
      classified = [...classified, ...enumLines];
    if (componentLines.length > 1) //
      classified = [...classified, ...componentLines];

    return classified;
  }

  public static cleanLines(lines : string[]) : void
  {
    for (let i = 0; i < lines.length; i++)
    {
      // NOTE Remove comments
      if (lines[i].startsWith("//", 0) || lines[i].startsWith("/*", 0))
      {
        lines.splice(i, 1);
        i--;
        continue;
      }

      // NOTE Replace quotes by apostrophes
      lines[i] = lines[i].replace(/"/g, "'");

      // NOTE Replace multiple spaces
      lines[i] = lines[i].replace(/\s\s+/g, ' ');

      // NOTE Remove empty line
      if (lines[i] === '' || lines[i] === ' ' || lines[i] === '\r')
      {
        lines.splice(i, 1);
        i--;
      }

      const hasLBracket = lines[i].includes('{');
      const hasRBracket = lines[i].includes('}');

      if (!hasLBracket && !hasRBracket) // NOTE If it's an import * as
        continue;

      const betweenBrackets = lines[i].substring(lines[i].lastIndexOf('{') + 1, lines[i].lastIndexOf('}'));

      if (betweenBrackets.includes(',')) // NOTE If there are more than one package
      {
        ImportHelper.splitPackages(betweenBrackets, i, lines); // NOTE Split packages
        continue;
      }

      lines[i] = ImportHelper.rewriteImport(betweenBrackets, lines[i]); // NOTE Rewrite import
    }
  }

  public static splitPackages(betweenBrackets : string, i : number, lines : string[]) : void
  {
    const fromValue = ImportHelper.getFromValue(lines[i]);

    const packages  = betweenBrackets.split(',');

    for (let x = 0; x < packages.length; x++)
    {
      const packageName = packages[x].replace(/ +/g, ''); // NOTE Clean package name
      const newLine     = ImportHelper.createImportLine(packageName, fromValue);
      lines.splice(i + x + 1, 0, newLine); // NOTE Push a new line for each package
    }

    lines.splice(i, 1); // NOTE Remove line with multiple modules
  }

  public static indentLines(lines : string[], maxNameLength : number) : void
  {
    for (let i = 0; i < lines.length; i++)
    {
      const position = lines[i].indexOf('from');
      const spaces   = maxNameLength + 12 - position; // NOTE 12 for 'import {  } '

      for (let x = 0; x < spaces; x++)
        lines[i] = [lines[i].slice(0, position), ' ', lines[i].slice(position)].join('');
    }
  }

  public static rewriteImport(betweenBrackets : string, line : string) : string
  {
    const fromValue   = ImportHelper.getFromValue(line);
    const packageName = betweenBrackets.replace(/ +/g, ''); // NOTE Clean package name
    const newLine     = ImportHelper.createImportLine(packageName, fromValue);
    return newLine;
  }

  public static getFromValue(line : string) : string
  {
    const betweenApostrophes = line.match("'(.*)'");
    let fromValue : string = '';
    if (betweenApostrophes)
      fromValue = betweenApostrophes[1];
    return fromValue;
  }

  public static createImportLine(moduleName : string, fromValue : string) : string
  {
    const importLine = 'import { ' + moduleName.trim() + " } from '" + fromValue + "';";
    return importLine;
  }

  public static getLongestModuleName(lines : string[]) : number
  {
    let longestLength : number = 0;
    for (let i = 0; i < lines.length; i++)
    {
      const hasLBracket = lines[i].includes('{');
      const hasRBracket = lines[i].includes('}');

      if (!hasLBracket && !hasRBracket)
        continue;

      const betweenBrackets = lines[i].substring(lines[i].lastIndexOf('{') + 1, lines[i].lastIndexOf('}'));
      const packageName     = betweenBrackets.replace(/ +/g, ''); // NOTE Clean package name

      if (packageName.length > longestLength)
        longestLength = packageName.length;
    }
    return longestLength;
  }

}
