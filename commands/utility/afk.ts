import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, PermissionLevel} from '../../utils/Command';
import {GuildEmoji, MessageEmbed} from 'discord.js';

class afk extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'afk',
      description: 'Send a message to anyone who pings you to tell them you are unavailable',
      category: 'Utility',
      permissionLevel: PermissionLevel.Default,
      permissions: ['MANAGE_MESSAGES'],
      arguments: [
        {
          name: 'reason',
          description: 'What message should be added to the reply when people message you',
          required: false,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    if (event.client.afk.has(event.message.author.id)) {
      event.client.afk.delete(event.message.author.id);
      event.message.channel.send(new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription('You are no longer flagged as away!'));
    } else {
      event.client.afk.set(event.message.author.id, event.arguments.length > 0 ? event.unparsedArguments.join(' ').replace(/[\\`]/g, '') : null);

      var desc: string = 'You have been flagged as away!';
      if (event.client.afk.get(event.message.author.id) != null) desc += '\nReason: `' + event.client.afk.get(event.message.author.id) + '`';

      var embed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription(desc);

      var thumbnail: Array<string> | null = event.message.content.match(event.client.EMOTE_REGEX);
      if (thumbnail != null && thumbnail.length > 0) {
        desc = desc.replace(thumbnail[0], '').trim().replace('` ', '`');
        if (desc.includes('Reason: ``')) {
          event.message.channel.send(':x: Invalid afk reason');
          return event.client.afk.delete(event.message.author.id);
        }
        var id: string = thumbnail[0].replace(event.client.EMOTE_REGEX, '$1');
        var emote: GuildEmoji | null = await event.client.emojis.resolve(id);
        if (emote != null) {
          embed.setImage(emote.url);
          embed.setDescription(desc);
        }
      }

      embed.setDescription(embed.description?.trim());
      event.message.channel.send(embed);
    }
  };
}

module.exports = (client: BotClient) => {
  return new afk(client);
};
