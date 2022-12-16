import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import dotenv from "dotenv";

import fs from "fs";
import { getTweets } from "./functions.js";

dotenv.config();

const loadJSON = (path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));

const users = loadJSON("./users.json");

const port = process.env.PORT || "8080";

const token = process.env.TELEGRAM_KEY;
// Default chat id
const chatId = -1001875292115;
// Test chat id
// const chatId = -1001847605123;

const bot = new TelegramBot(token, { polling: true });
const url = "https://www.binance.com";

let userID = "";

setInterval(async () => {
  console.log("api running....");
  // Loop through users from users.json, get their tweets and send them to the channel
  for (let i = 0; i < users.length; i++) {
    // Get the user's id
    const userID = users[i].id;

    // Generate the twitter url for this user
    const twitterURL =
      "https://api.twitter.com/2/users/" +
      userID +
      "/tweets?tweet.fields=text,entities&exclude=replies&max_results=5";

    // Get latest 10 tweets of the user
    const data = await getTweets(twitterURL);
    // Get the latest tweet.

    // Get the latest tweet's id
    if (data.data == null) {
      break;
    }
    const latestTweetIDFromData = data.data[0].id;

    // Compare the latest tweet's id with the id in users.json file.
    // If not equal
    if (latestTweetIDFromData != users[i].latestTweetID) {
      const newTweetID = data.data[0].id;
      if (newTweetID === users[i].latestTweetID) {
        break;
      }

      // Change every t.co url to expanded url in the text.
      let tweetText = data.data[0].text;
      if (data.data[0].entities != null) {
        if (data.data[0].entities.urls != null) {
          if (data.data[0].entities.urls.length > 0) {
            data.data[0].entities.urls.map((url) => {
              tweetText = tweetText.replace(url.url, url.expanded_url);
            });
          }
        }
      }

      bot.sendMessage(
        chatId,
        `*${users[i].username}* tweeted! \n \n${tweetText} \n \n 
          `,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "View on Twitter",
                  url: `https://twitter.com/${users[i].username}/status/${newTweetID}`,
                },
                {
                  text: "Ads Here",
                  url: "https://t.me/newtweetalert",
                },
              ],
            ],
          },
          // disable_web_page_preview: true,
        }
      );
      users[i].latestTweetID = latestTweetIDFromData;
      fs.writeFileSync("./users.json", JSON.stringify(users));
    }
  }
}, 40000);
