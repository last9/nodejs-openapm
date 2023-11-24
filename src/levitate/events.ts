import EventEmitter from 'events';
import chalk from 'chalk';
import type { OpenAPMOptions } from '../OpenAPM';
import { request } from 'undici';

export interface LevitateConfig {
  host?: string;
  orgSlug: string;
  dataSourceName: string;
  refreshTokens: {
    write: string;
  };
}

export interface DomainEventsBody {
  [key: string]: any;
  event_name: string;
  event_state: 'start' | 'stop';
  workspace?: string;
  namespace?: string;
  entity_type?: string;
  data_source_name: string;
}

const defaultHost = 'https://app.last9.io';

export class LevitateEvents extends EventEmitter {
  private eventsUrl: URL;
  readonly levitateConfig?: LevitateConfig;
  constructor(options?: OpenAPMOptions) {
    super();
    this.levitateConfig = options?.levitateConfig;
    this.eventsUrl = new URL(
      `/api/v4/organizations/${this.levitateConfig?.orgSlug}/domain_events`,
      this.levitateConfig?.host ?? defaultHost
    );
    this.initiateEventListeners();
  }

  // Making the emit and on methods type safe
  public emit(
    event: 'application_started',
    ...args: (DomainEventsBody | any)[]
  ): boolean;
  public emit(event: any, ...args: any[]): any {
    return super.emit(event, ...args);
  }

  public on(
    event: 'application_started',
    listener: (...args: (DomainEventsBody | any)[]) => void
  ): this;
  public on(event: any, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public once(
    event: 'application_started',
    listener: (...args: (DomainEventsBody | any)[]) => void
  ): this;
  public once(event: any, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private initiateEventListeners() {
    if (typeof this.levitateConfig?.refreshTokens?.write === 'string') {
      console.log(
        chalk.green(`\nYou've enabled Events powered by Levitate 🚀`)
      );
      console.log(
        'For more info checkout https://docs.last9.io/change-events\n'
      );
      this.once('application_started', this.putDomainEvents);
    }
  }

  private generateAccessToken = async () => {
    const endpoint = '/api/v4/oauth/access_token';
    const url = new URL(endpoint, this.levitateConfig?.host ?? defaultHost);

    return request(url.toString(), {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: this.levitateConfig?.refreshTokens.write ?? ''
      })
    })
      .then((response) => {
        return response.body.json();
      })
      .catch((error) => {
        console.log(error);
        return;
      });
  };

  private async putDomainEvents(body: DomainEventsBody) {
    if (!!body) {
      try {
        const tokenResponse = (await this.generateAccessToken()) as
          | { access_token: string }
          | undefined;
        await request(this.eventsUrl.toString(), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-LAST9-API-TOKEN': `Bearer ${tokenResponse?.access_token}`
          },
          body: JSON.stringify(body)
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
}
