import mongoose from 'mongoose';
import * as Config from './config.json';
import { BotClient, IClientData } from './utils/BotClient';

// Connect to the database
mongoose.connect(`mongodb+srv://${Config.database.user}:${Config.database.password}@cluster0.kivlf.mongodb.net/cacti?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Load models
require('./models/tag');
require('./models/infraction');

// Register Bot
var clientData: IClientData = {
  token: Config.token,
  name: Config.name,
  prefix: Config.prefix,
  embedColor: Config.embedColor,
  loadingEmote: Config.loadingEmote,
  youtubeKey: Config.youtube_key
};

var botClient: BotClient = new BotClient(clientData);
botClient.data.btnManager = require('discord-buttons')(botClient);

process.on('unhandledRejection', (error) => {
  console.warn('Unhandled promise rejection:', error);
});
