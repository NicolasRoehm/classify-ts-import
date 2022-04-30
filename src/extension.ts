'use strict';
// External modules
import { window }           from 'vscode';
import { commands }         from 'vscode';
import { ExtensionContext } from 'vscode';
import { Position }         from 'vscode';
import { Range }            from 'vscode';

// Helpers
import { ImportHelper }      from './helpers/import.helper';
import { ConstructorHelper } from './helpers/constructor.helper';

// This method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context : ExtensionContext) : void
{

  console.log('The extension "angular-vscode-cleaner" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposableImportCleaner = commands.registerCommand('angular-vscode-extension.importCleaner', () =>
  {
    // The code you place here will be executed every time your command is executed

    const editor = window.activeTextEditor;

    if (!editor)
    {
      window.showErrorMessage("No file is open, can't reorder imports");
      return;
    }

    const categories = ImportHelper.getCategories();

    const docText  = editor.document.getText();
    const allLines = docText.split('\n');

    let importFound : boolean = false;
    // let firstIndex  : number  = 0;
    let lastIndex   : number  = 0;

    for (const [index, line] of allLines.entries())
    {
      const hasImport   = line.includes('import');
      const hasFrom     = line.includes('from');
      const hasLBracket = line.includes('{');
      const hasRBracket = line.includes('}');
      const hasAll      = line.includes('*');
      const hasAs       = line.includes('as');
      if ((hasImport && hasFrom) && (hasLBracket && hasRBracket || hasAll && hasAs))
      {
        if (importFound === false)
        {
          // firstIndex = index;
          importFound = true;
        }
        lastIndex = index;
      }
    }

    if (!importFound)
    {
      window.showErrorMessage("No import found, can't reorder");
      return;
    }

    const lines : string[] = [];
    for (let y = 0; y <= lastIndex; y++) // NOTE Can change 0 to firstIndex
      lines.push(allLines[y]);

    ImportHelper.cleanLines(lines);

    const maxNameLength = ImportHelper.getLongestModuleName(lines);

    ImportHelper.indentLines(lines, maxNameLength);

    // NOTE Order lines by fromValue
    lines.sort((a, b) =>
    {
      const fromA = ImportHelper.getFromValue(a);
      const fromB = ImportHelper.getFromValue(b);
      if (fromA < fromB)
        return -1;
      if (fromA > fromB)
        return 1;
      return 0; // NOTE Values must be equal
    });

    const classifiedLines = ImportHelper.classifyLines(lines, categories);
    const linesAsText     = classifiedLines.join('\n');

    // NOTE Remove lines found from activeDocument
    editor.edit(editBuilder =>
    {
      const start = new Position(0, 0); // NOTE Can change the first 0 to firstIndex
      const end   = new Position(lastIndex, allLines[lastIndex].length);
      const rangeToDelete = new Range(start, end);
      editBuilder.delete(rangeToDelete);

      // NOTE Add new lines to activeDocument
      editBuilder.insert(start, linesAsText);
    });

  });

  const disposableConstructorCleaner = commands.registerCommand('angular-vscode-extension.constructorCleaner', () =>
  {
    const editor = window.activeTextEditor;

    if (!editor)
    {
      window.showErrorMessage("No file is open, can't clean constructor");
      return;
    }

    const docText  = editor.document.getText();
    const allLines = docText.split('\n');

    let constructorFound : boolean = false;
    let firstIndex       : number  = 0;
    let lastIndex        : number  = 0;

    let totalLBracket    : number  = 0;

    for (let i = 0; i <= allLines.length; i++)
    {
      const line           = allLines[i];
      const hasConstructor = line.includes('constructor');
      const hasLBracket    = line.includes('{');
      const hasRBracket    = line.includes('}');
      if (hasConstructor)
      {
        constructorFound = true;
        firstIndex = i;
      }
      if (constructorFound && hasLBracket)
        totalLBracket++;
      if (constructorFound && hasRBracket)
        totalLBracket--;
      if (constructorFound && hasRBracket && totalLBracket === 0)
      { // NOTE Get the position of the last } after the first { position
        lastIndex = i;
        break;
      }
    }

    if (!constructorFound)
    {
      window.showErrorMessage("No constructor found, can't clean");
      return;
    }

    const lines : string[] = [];
    for (let x = firstIndex; x <= lastIndex + 1; x++)
      lines.push(allLines[x]);

    const joinedLines        : string = lines.join('\n');

    const betweenParenthesis : string = joinedLines.slice(joinedLines.indexOf('(') + 1, joinedLines.indexOf(')'));
    const betweenBrackets    : string = joinedLines.slice(joinedLines.indexOf('{') + 1, joinedLines.lastIndexOf('}'));

    const newConstructor = ConstructorHelper.createConstructorParameters(betweenParenthesis, betweenBrackets);

    // NOTE Remove lines found from activeDocument
    editor.edit(editBuilder =>
    {
      const start = new Position(firstIndex, 0);
      const end   = new Position(lastIndex, allLines[lastIndex].length);
      const rangeToDelete = new Range(start, end);
      editBuilder.delete(rangeToDelete);

      // NOTE Add new lines to activeDocument
      editBuilder.insert(start, newConstructor);
    });

  });

  const disposableComponentCleaner = commands.registerCommand('angular-vscode-extension.componentCleaner', () =>
  {
    // TODO
  });

  context.subscriptions.push(disposableImportCleaner, disposableConstructorCleaner, disposableComponentCleaner);
}

// -------------------------------------------------------------------------------
// ---- NOTE Deactivate ---------------------------------------------------------
// -------------------------------------------------------------------------------

// NOTE This method is called when your extension is deactivated
export function deactivate() { /* */ }