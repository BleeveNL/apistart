export interface WebserverServiceEnabled {
  readonly http: boolean
  readonly https: boolean
  readonly versionHandling: boolean
}

export interface WebserverServiceHttpEnabled extends WebserverServiceEnabled {
  readonly http: true
}

export interface WebserverServiceHttpsEnabled extends WebserverServiceEnabled {
  readonly https: true
}

export interface WebserverServiceVersionHandlingEnabled extends WebserverServiceEnabled {
  readonly versionHandling: true
}

export interface WebserverServiceVersionHandlingDisabled extends WebserverServiceEnabled {
  readonly versionHandling: false
}

export interface WebserverServiceEverythingEnabled extends WebserverServiceEnabled {
  readonly http: true
  readonly https: true
  readonly versionHandling: true
}
