import { BotClient } from '../../utils/BotClient';
import { Listener } from '../../utils/Listener';
import { Message, MessageAttachment, MessageEmbed, TextChannel} from 'discord.js';
import fetch from 'node-fetch';

export class imageFilter extends Listener {
  imageRegex: RegExp = RegExp(`(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg))`, 'i');
  linkRegex: RegExp = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

  constructor(client: BotClient) {
    super(client, {
      name: 'Image Filter',
      guild: '696027249002020896'
    });

    // Get log channel;
    var logChannel: TextChannel | null = null;

    client.on('message', async (message: Message) => {
      try {
        if (logChannel == null) logChannel = <TextChannel>await client.channels.fetch('929195618134544384');
        if (message.guild?.id != '696027249002020896' || message.author.bot || logChannel == null) return;
      } catch (_ignored) {}

      message.attachments.forEach((attachment: MessageAttachment) => {
        if (this.imageRegex.test(attachment.url)) runFilter(message, attachment.url);
      });

      message.content.match(this.linkRegex)?.forEach((url: string) => {
        if (this.imageRegex.test(url)) runFilter(message, url);
      });
    });
    async function runFilter(message: Message, url: string) {
      var req = await fetch('https://api.santio.me/filter/image?url=' + url);
      var data = await req.json();
      if (data.flags.includes('Porn') || data.flags.includes('Hentai')) {
        var embed: MessageEmbed = new MessageEmbed()
          .setTitle(' ')
          .setColor('#ff0000')
          .setDescription(`Image was flagged as NSFW [Flags: ${data.flags.join(', ')}]\nPost by: **${message.author.tag}** *(${message.author.id})*\n\n[Jump to message](${message.url})`)
          .setImage(url);

        if (logChannel != null) logChannel.send(embed);
      }
    }
  }
}

module.exports = (client: BotClient) => {
  return new imageFilter(client);
};
