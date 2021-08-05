import { BotClient } from '../../utils/BotClient';
import { Listener } from '../../utils/Listener';
import { Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import fetch from 'node-fetch';

export class imageFilter extends Listener {
  imageRegex: RegExp = RegExp(`(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg))`, 'i');

  constructor(client: BotClient) {
    super(client, {
      name: 'Image Filter',
      guild: '696027249002020896'
    });

    // Get log channel;
    var logChannel: TextChannel | null = null;

    client.on('message', async (message: Message) => {
      if (logChannel == null) logChannel = <TextChannel>await client.channels.fetch('861767697418944572');
      if (message.guild?.id != '696027249002020896' || message.author.bot || logChannel == null || message.attachments.size == 0) return;

      message.attachments.forEach(async (attachment: MessageAttachment) => {
        if (this.imageRegex.test(attachment.url)) {
          // Check if image is NSFW
          var req = await fetch('https://api.santio.me/filter/image?url=' + attachment.url);
          var data = await req.json();
          if (data.flags.includes('Porn') || data.flags.includes('Hentai')) {
            var embed: MessageEmbed = new MessageEmbed()
              .setTitle(' ')
              .setColor('#ff0000')
              .setDescription(`Image was flagged as NSFW [Flags: ${data.flags.join(', ')}]\nPost by: **${message.author.tag}** *(${message.author.id})*`)
              .setImage(attachment.url);

            if (logChannel != null) logChannel.send(embed);
          }
        }
      });
    });
  }
}

module.exports = (client: BotClient) => {
  return new imageFilter(client);
};
