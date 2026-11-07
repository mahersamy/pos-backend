export interface IdempotencyRecord {
  /** Whether the original request is still running or has completed. */
  state: 'processing' | 'done';

  /**
   * SHA-256 hex digest of the canonicalised request payload.
   * Used to detect key reuse with a different body (→ 422).
   */
  fingerprint: string;

  /**
   * Ownership token (random UUID) written by the request that claimed the key.
   * Used to verify that only the owner transitions state from `processing` → `done`.
   */
  token: string;

  /** Serialised response body – present only when `state === 'done'`. */
  body?: unknown;

  /** HTTP status code of the original response – present only when `state === 'done'`. */
  statusCode?: number;
}

