export class InterlayerNotice<D = null> {
  public data: D | null;
  public extensions: InterlayerNoticeExtension[];
  public code: number;

  constructor(data: D | null = null) {
    this.data = data;
    this.extensions = [];
    this.code = 0;
  }

  public addData(data: D): void {
    this.data = data;
  }

  public addError(
    message: string,
    key: string | null = null,
    code: number | null = 1,
  ): void {
    this.code = code ?? 1;
    this.extensions.push(new InterlayerNoticeExtension(message, key));
  }

  public hasError(): boolean {
    return this.code !== 0;
  }

  static createErrorNotice(message: string, field?: string, code?: number): InterlayerNotice<null> {
    const errorNotice = new InterlayerNotice<null>();
    errorNotice.addError(message, field ?? null, code ?? 1);
    return errorNotice;
  }
}

export class InterlayerNoticeExtension {
  constructor(
    public readonly message: string,
    public readonly field: string | null
  ) {}
}
