import { BotClient } from '../utils/BotClient';
import { Listener } from '../utils/Listener';
import { GuildEmoji, GuildMember, Message, MessageEmbed } from 'discord.js';

export class afkListener extends Listener {
  constructor(client: BotClient) {
    super(client, {
      name: 'AFK Listener'
    });

    client.on('message', async (message: Message) => {
      if (this.client.afk.has(message.author.id)) {
        this.client.afk.delete(message.author.id);
        // @ts-ignore
        message.lineReplyNoMention(new MessageEmbed().setTitle(' ').setColor(this.client.data.embedColor).setDescription('You are no longer flagged as away!'));
      }

      var mentions: string[] | undefined = message.mentions.members
        ?.array()
        .filter((member: GuildMember) => this.client.afk.has(member.id))
        .map((member: GuildMember) => `<@` + member.id + '>');
      if (mentions == null || mentions.length < 1) return;

      var desc: string = mentions.join(' ') + (mentions.length > 1 ? ' are ' : ' is ') + 'currently away!';

      if (mentions.length == 1 && this.client.afk.get(mentions[0].substring(2, mentions[0].length - 1)) != null)
        desc += '\nReason: `' + this.client.afk.get(mentions[0].substring(2, mentions[0].length - 1)) + '`';

      var embed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor(this.client.data.embedColor).setDescription(desc);

      var thumbnail: Array<string> | null = desc.match(this.client.EMOTE_REGEX);
      if (thumbnail != null && thumbnail.length > 0) {
        desc = desc.replace(thumbnail[0], '').trim().replace('` ', '`');
        var id: string = thumbnail[0].replace(this.client.EMOTE_REGEX, '$1');
        var emote: GuildEmoji | null = await this.client.emojis.resolve(id);
        if (emote != null) {
          embed.setImage(emote.url);
          embed.setDescription(desc);
        }
      }

      message.channel.send(embed);
    });
  }
}

module.exports = (client: BotClient) => {
  return new afkListener(client);
};
