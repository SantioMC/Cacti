import { BotClient } from './BotClient';

export class Listener {
  public data: IListenerData;
  public client: BotClient;
  public execute: Function = () => {
    throw new Error('This command was not given an executive function!');
  };

  constructor(client: BotClient, data: IListenerData) {
    this.data = data;
    this.client = client;
    client.events.push(data);
  }
}

export interface IListenerData {
  name: string;
  guild?: string;
}
