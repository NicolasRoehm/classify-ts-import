export class ImportCategory
{
  public id            : number;
  public category      : string;
  public fromContent   : string;

  public isExternal    : boolean;

  public fromSelectors : string[];

  public lines         : string[];

  constructor(index : number, json : any)
  {
    this.id            = index;
    this.category      = json.category;
    this.fromContent   = json.fromContent;

    this.isExternal    = !this.fromContent;

    this.fromSelectors = [];
    this.lines         = [ `// ${this.category}` ];
    if (this.fromContent)
      this.fromSelectors = this.fromContent.includes(',') ? this.fromContent.split(',').map(s => s.trim()) : [ this.fromContent.trim() ];
  }
}