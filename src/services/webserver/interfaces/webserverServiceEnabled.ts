export interface WebserverServiceEnabled<
  Thttp extends boolean = boolean,
  Thttps extends boolean = boolean,
  TversionHandling extends boolean = boolean,
> {
  readonly http: Thttp
  readonly https: Thttps
  readonly versionHandling: TversionHandling
}
