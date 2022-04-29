export class ImportCategory
{
  public id            : number;
  public category      : string;
  public fromContent   : string;

  public fromSelectors : string[];

  public lines         : string[];

  constructor(index : number, json : any)
  {
    this.lines         = [];
    this.id            = index;
    this.category      = json?.category    || '';
    this.fromContent   = json?.fromContent || '';

    this.fromSelectors = [];
    if (this.fromContent)
    {
      if (this.fromContent.includes(','))
        this.fromSelectors = this.fromContent.split(',').map(s => s.trim());
      else
        this.fromSelectors = [ this.fromContent.trim() ];
    }
  }
}