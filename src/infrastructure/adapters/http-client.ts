import { Injectable, Scope, Inject } from "@nestjs/common";
import { Request } from "express";
import axios, { AxiosInstance, AxiosError } from "axios";
import { AppConfigProvider } from "../config/app-config.provider";
import { AuthenticationError } from "../errors/auth.exceptions";
import { HTTP_STATUS } from "../../shared/constants/http.constants";
import {
  ExternalApiHttpError,
  ExternalApiUnavailableError,
} from "../../shared/errors/external-api.errors";

@Injectable({ scope: Scope.REQUEST })
export class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(
    private readonly appConfig: AppConfigProvider,
    @Inject("REQUEST") private readonly request: Request,
  ) {
    const baseURL = this.appConfig.get().api.baseUrl;
    this.axiosInstance = axios.create({
      baseURL,
      timeout: this.appConfig.get().api.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": process.env.USER_AGENT_HEADER || "nest-starter-kit",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.request.authToken) {
          config.headers.authorization = `Bearer ${this.request.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          throw new AuthenticationError();
        }

        const url = error.config?.url || "unknown";
        const source = "HttpClient";

        if (error.response) {
          throw new ExternalApiHttpError(
            url,
            error.response.status,
            error.response.statusText,
            source,
            error,
            error.response.data,
          );
        }

        throw new ExternalApiUnavailableError(url, source, error);
      },
    );
  }

  get instance(): AxiosInstance {
    return this.axiosInstance;
  }
}
