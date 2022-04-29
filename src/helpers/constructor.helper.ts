export class ConstructorHelper
{
  public static createConstructorParameters(betweenParenthesis : string, betweenBrackets : string) : string
  {
    // NOTE Replace multiple spaces
    betweenParenthesis = betweenParenthesis.replace(/\s\s+/g, ' ');

    let text : string = '  constructor';

    if (betweenParenthesis.includes(',')) // NOTE If there are more than one package
    {
      text += '\n  (\n';
      const parts = betweenParenthesis.split(',');

      // NOTE Reorder

      let maxNameLength : number  = 0;

      const publics  : string[] = [];
      const privates : string[] = [];
      const others   : string[] = [];

      for (let part of parts)
      {
        const hasPublic  = part.includes('public');
        const hasPrivate = part.includes('private');

        // NOTE Get type
        const index = part.indexOf(':');
        const type1 = part.substr(index); // NOTE Get everything after the found index

        const type2 = type1.replace(/,/g,  ''); // NOTE Remove comma
        const type3 = type2.replace(/:/g,  ''); // NOTE Remove colon
        const type  = type3.replace(/\s/g, ''); // NOTE Remove spaces

        if (maxNameLength < type.length)
          maxNameLength = type.length;

        if (hasPublic)
        {
          publics.push(type);
          continue;
        }
        if (hasPrivate)
        {
          privates.push(type);
          continue;
        }
        others.push(part);
        // text += '    ' + part + '\n';
      }

      // NOTE Rewrite public
      ConstructorHelper.rewriteConstructorVar(publics,  '    public  ', maxNameLength);
      ConstructorHelper.rewriteConstructorVar(privates, '    private ', maxNameLength);

      const arrays = [].concat.apply([], [others, publics, privates]);
      const lines  = arrays.join(',\n');

      text += lines;
      text += '\n  )';
    }
    else
    {
      text += '(';
      text += betweenParenthesis;
      text += ')';
    }

    text += '\n  {';
    text += betweenBrackets;
    text += '\n  }';

    return text;
  }

  public static rewriteConstructorVar(types : string[], prefix : string, maxNameLength : number) : void
  {
    for (let i = 0; i < types.length; i++)
    {
      const varLength : number = types[i].length;
      const varName   : string = types[i].charAt(0).toLocaleLowerCase() + types[i].slice(1);
      const spaces    = maxNameLength + 1 - varLength;
      let spaceText = '';

      for (let x = 0; x < spaces; x++)
        spaceText += ' ';

      types[i] = prefix + varName + spaceText + ': ' + types[i];
    }
  }
}
