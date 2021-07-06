import { BotClient } from '../utils/BotClient';
import { Listener } from '../utils/Listener';
import { Channel, Guild, Message, MessageReaction, TextChannel, User } from 'discord.js';

export class afkListener extends Listener {
  constructor(client: BotClient) {
    super(client, {
      name: 'Cache Handler'
    });

    client.on('raw', async (packet) => {
      if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

      const channel: TextChannel | undefined = <TextChannel | undefined>await this.client.channels.fetch(packet.d.channel_id);
      if (channel == null) return;

      if (channel.messages.cache.has(packet.d.message_id)) return;
      channel.messages.fetch(packet.d.message_id).then((message: Message) => {
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;

        const reaction: MessageReaction | undefined = message.reactions.cache.get(emoji);
        if (reaction == null) return;

        const user: User | undefined = client.users.cache.get(packet.d.user_id);
        if (user == null) return;

        if (reaction) reaction.users.cache.set(packet.d.user_id, user);
        if (packet.t === 'MESSAGE_REACTION_ADD') client.emit('messageReactionAdd', reaction, user);
        if (packet.t === 'MESSAGE_REACTION_REMOVE') client.emit('messageReactionRemove', reaction, user);
      });
    });
  }
}

module.exports = (client: BotClient) => {
  return new afkListener(client);
};
