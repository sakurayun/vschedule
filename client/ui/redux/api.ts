import * as querystring from 'querystring';
import { EventList } from 'shared/entities/event';
import { Response } from 'shared/entities/response';

export class ItsukaraLink {
  protected baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(url: string, params: RequestInit = {}) {
    return (await fetch(url, params)
      .then(res => res.json() as Promise<Response<T>>)
      .then(json => json.data)) as T;
  }

  protected async get<T>(url: string, params?: { [K: string]: any }) {
    return this.request<T>(`${url}?${querystring.stringify(params)}`);
  }

  public fetchEvents = async () => {
    return await this.get<EventList>(`${this.baseUrl}/api/events.json`);
  };
}

export const api = new ItsukaraLink(
  `${process.env.APP_PROTOCOL}://${process.env.APP_HOST}${
    process.env.APP_PORT ? ':' + process.env.APP_PORT : ''
  }`,
);