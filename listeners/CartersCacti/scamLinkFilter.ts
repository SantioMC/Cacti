import { BotClient } from '../../utils/BotClient';
import { Listener } from '../../utils/Listener';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import fetch from 'node-fetch';

export class scamLinkFilter extends Listener {
  linkRegex: RegExp = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  trustedWebsites = [
    /[A-Z0-9]+\.discord\.com\//i,
    /[A-Z0-9]+\.discordapp\.com\//i,
    /[A-Z0-9]+\.epicgames\.com\//i,
    /[A-Z0-9]+\.reddit\.com\//i
  ]

  constructor(client: BotClient) {
    super(client, {
      name: 'Scam Link Filter',
      guild: '696027249002020896'
    });

    // Get log channel;
    var logChannel: TextChannel | null = null;

    client.on('message', async (message: Message) => {
      try {
        if (logChannel == null) logChannel = <TextChannel>await client.channels.fetch('929195618134544384');
        if (message.guild?.id != '696027249002020896' || message.author.bot || logChannel == null) return;
      } catch (_ignored) {}

      message.content.match(this.linkRegex)?.forEach(async (uri: string) => {
        var flags = await scanWebsite(uri)
        if (flags.length != 0) {
          if (message.deleted) return
          message.delete()
          var embed: MessageEmbed = new MessageEmbed()
            .setTitle(' ')
            .setColor('#ff0000')
            .setDescription(`A link sent by <@${message.author.id}> *(${message.author.tag})* contained a suspicious link and was automatically deleted!
            \n\n**Link:** ${uri}
            \n**Flags:**\n- ${flags.join("\n- ")}`);

          if (logChannel != null) logChannel.send(embed);
        }
      });

    });

    const scanWebsite = async (uri: string): Promise<Array<String>> => {
      var flags: Array<String> = []

      // Get website source and info
      var request = await fetch(uri)
      var source = await request.text()
      var title = getTitle(source).toLowerCase()
      var embedDescription = getMeta(source, "description")
      if (embedDescription == "") embedDescription = getMeta(source, "og:description")

      // Skip if the site is trusted
      for (var website in this.trustedWebsites) if (uri.match(this.trustedWebsites[website])) return []

      // Checks
      //  - Title Check
      if (title.includes("free") && title.includes("nitro") && title.includes("steam")) flags.push(`Title Check *(${title})*`)
      //  - Meta Check
      if (embedDescription.toLowerCase().includes("free")
        && embedDescription.toLowerCase().includes("nitro")
        && embedDescription.toLowerCase().includes("steam")) flags.push(`Description Meta Check *(${embedDescription})*`)
      if (getMeta(source, "og:image") == "https://discord.com/assets/652f40427e1f5186ad54836074898279.png") flags.push("Usage of discord promotional art in meta on non-discord site")
      //  - Grammar Checks
      if (source.toLowerCase().includes("upgrade your emoji")) flags.push("Improper Grammar (emoji)")
      //  - Keyword Check
      if (source.toLowerCase().includes("nitro") && source.toLowerCase().includes("free from steam")) flags.push("Invalid Keywords *('nitro' + 'free from steam')*")

      return flags
    }

    function getTitle(source: string): string {
      var title = source.match(/<title( .+)?>([^<]*)<\/title>/i)
      if (!title || title.length != 3 || typeof title[2] !== 'string') return ""
      else return title[2]
    }

    function getMeta(source: string, property: string): string {
      var regex = new RegExp(`<meta( .+)? (property|name)=\"${property}\" content=\"(.+)\"\\/>`, 'i')
      var meta = source.match(regex)
      if (!meta || meta.length != 4 || typeof meta[3] !== 'string') return ""
      else return meta[3]
    }
  }
}

module.exports = (client: BotClient) => {
  return new scamLinkFilter(client);
};
