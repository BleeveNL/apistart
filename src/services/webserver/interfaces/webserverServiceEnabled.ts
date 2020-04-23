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

export interface WebserverServiceHVersionHandlingEnabled extends WebserverServiceEnabled {
  readonly versionHandling: true
}

export interface WebserverServiceHVersionHandlingDisabled extends WebserverServiceEnabled {
  readonly versionHandling: false
}
