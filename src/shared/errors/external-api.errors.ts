export class ExternalApiError extends Error {
  constructor(
    message: string,
    public readonly source: string,
    public readonly originalError?: Error,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExternalApiUnavailableError extends ExternalApiError {
  constructor(url: string, source: string, originalError?: Error) {
    super(`External API is unavailable at ${url}`, source, originalError, {
      url,
    });
  }
}

export class ExternalApiHttpError extends ExternalApiError {
  public readonly responseBody: unknown;

  constructor(
    url: string,
    statusCode: number,
    statusText: string,
    source: string,
    originalError?: Error,
    responseBody?: unknown,
  ) {
    super(
      `External API returned ${statusCode} ${statusText} from ${url}`,
      source,
      originalError,
      { url, statusCode, statusText, responseBody },
    );
    this.responseBody = responseBody;
  }
}
