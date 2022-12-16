import fetch from "node-fetch";

async function getTweets(twitterURL) {
  const response = await fetch(twitterURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
    },
  });

  const data = await response.json();
  return data;
}

export { getTweets };
