// External modules
import { workspace }      from 'vscode';

// Models
import { ImportCategory } from '../models/import-category.model';

export class ImportHelper
{
  public static cleanPackageName(packageName : string) : string
  {
    return packageName.replace(/ +/g, ' ').trim();
  }

  public static getCategoriesFromConfig() : ImportCategory[]
  {
    const extConfig  = workspace.getConfiguration('classify-ts-import');
    const parameters : any[]          = extConfig.import.categories;
    const addTitles : boolean = extConfig.import.addTitles; 
    const categories : ImportCategory[] = [];
    for (let i = 0; i < parameters.length; i++)
      categories.push(new ImportCategory(i, parameters[i], addTitles));
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

    // NOTE Add empty line (for Line Feed) or clear empty category
    const lastIndex = categories.length - 1;
    for (const [i, category] of categories.entries())
    {
      if (category.lines.length === 1)
        category.lines = [];
      if (category.lines.length > 1 && lastIndex !== i)
        category.lines.push('');
    }

    // NOTE Update classified lines
    for (const category of categories)
      classified = [...classified, ...category.lines];

    return classified;
  }

  public static cleanLines(lines : string[]) : void
  {
    // NOTE Get config
    const extConfig = workspace.getConfiguration('classify-ts-import');
    const groupByOrigin : boolean = extConfig.import.groupByOrigin;

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

      if (!hasLBracket && !hasRBracket) // NOTE If it's an import * as or default exported module
        continue;

      const betweenBrackets = lines[i].slice(lines[i].lastIndexOf('{') + 1, lines[i].lastIndexOf('}'));

      if (!groupByOrigin && betweenBrackets.includes(',')) // NOTE If there are more than one package
      {
        ImportHelper.splitPackages(betweenBrackets, i, lines); // NOTE Split packages
        continue;
      }

      lines[i] = ImportHelper.rewriteImport(betweenBrackets, lines[i]); // NOTE Rewrite import
    }
  }

  public static splitPackages(betweenBrackets : string, i : number, lines : string[]) : void
  {
    const origin   = ImportHelper.getOrigin(lines[i]);

    const packages = betweenBrackets.split(',');

    for (const [x, pkg] of packages.entries())
    {
      const packageName = ImportHelper.cleanPackageName(pkg);
      const newLine     = ImportHelper.createImportLine(lines[i], packageName, origin);
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
    const origin      = ImportHelper.getOrigin(line);
    const packageName = ImportHelper.cleanPackageName(betweenBrackets);
    const newLine     = ImportHelper.createImportLine(line, packageName, origin);
    return newLine;
  }

  public static getOrigin(line : string) : string
  {
    const betweenApostrophes = line.match("'(.*)'");
    let origin : string = '';
    if (betweenApostrophes)
      origin = betweenApostrophes[1];
    return origin;
  }

  public static createImportLine(line : string, moduleName : string, origin : string) : string
  {
    const start      = line.includes('import type') ? 'import type' : 'import';
    const importLine = `${start} { ${moduleName.trim()} } from '${origin}';`;
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
      const packageName     = ImportHelper.cleanPackageName(betweenBrackets);

      if (packageName.length > longestLength)
        longestLength = packageName.length;
    }
    return longestLength;
  }

}
