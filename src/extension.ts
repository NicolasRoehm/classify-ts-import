'use strict';
// External modules
import { window }           from 'vscode';
import { commands }         from 'vscode';
import { ExtensionContext } from 'vscode';
import { Position }         from 'vscode';
import { Range }            from 'vscode';

// Helpers
import { ImportHelper }      from './helpers/import.helper';

// This method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context : ExtensionContext) : void
{

  console.log('The extension "classify-ts-import" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposableImportClassifier = commands.registerCommand('classify-ts-import.importClassifier', () =>
  {
    // The code you place here will be executed every time your command is executed

    const editor = window.activeTextEditor;

    if (!editor)
    {
      window.showErrorMessage("No file is open, can't classify imports");
      return;
    }

    const categories = ImportHelper.getCategoriesFromConfig();

    const docText  = editor.document.getText();
    const allLines = docText.split('\n');

    let importFound : boolean = false;
    let firstIndex  : number  = 0;
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
          firstIndex  = index;
          importFound = true;
          // NOTE Clear comment before first import
          const prevLine = allLines[index - 1];
          if (prevLine && prevLine.startsWith('//'))
            firstIndex--;
        }
        lastIndex = index;
      }
    }

    if (!importFound)
    {
      window.showErrorMessage("No import found, can't classify");
      return;
    }

    const lines : string[] = [];
    for (let y = firstIndex; y <= lastIndex; y++)
      lines.push(allLines[y]);

    ImportHelper.cleanLines(lines);

    const maxNameLength = ImportHelper.getLongestModuleName(lines);

    ImportHelper.indentLines(lines, maxNameLength);

    // NOTE Order lines by origin
    lines.sort((a, b) =>
    {
      const originA = ImportHelper.getOrigin(a);
      const originB = ImportHelper.getOrigin(b);
      if (originA < originB)
        return -1;
      if (originA > originB)
        return 1;
      return 0; // NOTE Values must be equal
    });

    const classifiedLines = ImportHelper.classifyLines(lines, categories);
    const linesAsText     = classifiedLines.join('\n');

    // NOTE Remove lines found from activeDocument
    editor.edit(editBuilder =>
    {
      const start = new Position(firstIndex, 0);
      const end   = new Position(lastIndex, allLines[lastIndex].length);
      const rangeToDelete = new Range(start, end);
      editBuilder.delete(rangeToDelete);

      // NOTE Add new lines to activeDocument
      editBuilder.insert(start, linesAsText);
    });

  });

  context.subscriptions.push(disposableImportClassifier);
}

// -------------------------------------------------------------------------------
// ---- NOTE Deactivate ---------------------------------------------------------
// -------------------------------------------------------------------------------

// NOTE This method is called when your extension is deactivated
export function deactivate() { /* */ }