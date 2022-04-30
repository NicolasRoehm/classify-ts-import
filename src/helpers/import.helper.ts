// External modules
import { workspace }      from 'vscode';

// Models
import { ImportCategory } from '../models/import-category.model';

export class ImportHelper
{
  public static getCategoriesFromConfig() : ImportCategory[]
  {
    const extConfig  = workspace.getConfiguration('classify-ts-import');
    const parameters : any[]          = extConfig.import.categories;
    const categories : ImportCategory[] = [];
    for (let i = 0; i < parameters.length; i++)
      categories.push(new ImportCategory(i, parameters[i]));
    return categories;
  }

  public static classifyLines(lines : string[], categories : ImportCategory[]) : string[]
  {
    let classified : string[] = [];

    for (const line of lines)
    {
      let categorized : boolean = false;
      for (const category of categories)
        for (const selector of category.fromSelectors)
          if (line.includes(selector))
          {
            category.lines.push(line);
            categorized = true;
          }
      // NOTE Default category
      if (!categorized)
        categories.find(c => c.isExternal)?.lines.push(line);
    }

    // NOTE Add empty line or clear empty category
    for (const category of categories)
      if (category.lines.length > 1)
        category.lines.push('');
      else
        category.lines = [];

    // NOTE Update classified lines
    for (const category of categories)
      classified = [...classified, ...category.lines];

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

      const betweenBrackets = lines[i].slice(lines[i].lastIndexOf('{') + 1, lines[i].lastIndexOf('}'));

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

    for (const [x, pkg] of packages.entries())
    {
      const packageName = pkg.replace(/ +/g, ''); // NOTE Clean package name
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
    for (const line of lines)
    {
      const hasLBracket = line.includes('{');
      const hasRBracket = line.includes('}');

      if (!hasLBracket && !hasRBracket)
        continue;

      const betweenBrackets = line.slice(line.lastIndexOf('{') + 1, line.lastIndexOf('}'));
      const packageName     = betweenBrackets.replace(/ +/g, ''); // NOTE Clean package name

      if (packageName.length > longestLength)
        longestLength = packageName.length;
    }
    return longestLength;
  }

}
