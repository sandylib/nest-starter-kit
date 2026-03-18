import { LoggerProvider } from "../logging/logger.provider";

export abstract class BaseRepository {
  constructor(protected readonly logger: LoggerProvider) {}

  protected async loggedOperation<T>(
    label: string,
    category: string,
    meta: Record<string, unknown>,
    fn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    this.logger.info(label, category, meta);

    try {
      const result = await fn();
      this.logger.info(`Successfully ${label.toLowerCase()}`, category, {
        ...meta,
        responseTime: `${Date.now() - startTime}ms`,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to ${label.toLowerCase()}`,
        error as Error,
        category,
        {
          ...meta,
          responseTime: `${Date.now() - startTime}ms`,
        },
      );
      throw error;
    }
  }
}
