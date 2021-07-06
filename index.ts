require('dotenv').config();
import mongoose from 'mongoose';
import { BotClient, IClientData } from './utils/BotClient';

// Connect to the database
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.NAME}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Load models
require('./models/tag');
require('./models/infraction');

// Register Bot
var clientData: IClientData = {
  token: process.env.TOKEN!,
  name: process.env.NAME!,
  prefix: process.env.PREFIX!,
  embedColor: '#' + process.env.EMBED_COLOR!,
  loadingEmote: process.env.LOADING_EMOTE!,
  youtubeKey: process.env.YOUTUBE_API!
};

var botClient: BotClient = new BotClient(clientData);
botClient.data.btnManager = require('discord-buttons')(botClient);

process.on('unhandledRejection', (error) => {
  console.warn('Unhandled promise rejection:', error);
});
