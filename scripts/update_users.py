import json
import requests
from decouple import config

f = open("../users.json")

data = json.load(f)

for i in data:
    headers = {'Authorization': 'Bearer ' + config('TWITTER_BEARER_TOKEN')}
    res = requests.get('https://api.twitter.com/2/users/' +
                       i['id'] + '/tweets?tweet.fields=text,entities&exclude=replies,retweets&max_results=5', headers=headers)
    response = res.json()
    if (response.get('data')[0].get('id') != i['latestTweetID']):
        i['latestTweetID'] = response.get('data')[0].get('id')

f2 = open("../users.json", "w")
f2.write(json.dumps(data))

f2.close()
f.close()
