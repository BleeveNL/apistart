export interface Migration {
  readonly down: () => Promise<void>
  readonly up: () => Promise<void>
}
