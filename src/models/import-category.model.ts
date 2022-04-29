export class ImportCategory
{
  public category      : string;
  public fromContent   : string;

  public fromSelectors : string[];

  constructor(json : any)
  {
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