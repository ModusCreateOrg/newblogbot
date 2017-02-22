# New Blog Bot

Simple AWS Lambda Bot that posts new blog entries to Slack.  Works by polling an RSS feed at a configurable interval, and checking for entries published in the time period since the last run.  This will only detect entries published in the time since the last run, as it doesn't use persistent storage to remember the timestamp of the newest article from previous runs.

We built this to learn more about the technologies involved.  If you want a no coding solution to consuming an RSS 
feed within Slack, check out their [built in RSS reader functionality](https://get.slack.help/hc/en-us/articles/218688467-Add-RSS-feeds-to-Slack).

## Setup (Slack)

You need to set up an incoming webhook in Slack that points to the channel that you want notifications to appear on.  To do this:

* Login with your Slack account credentials at https://<yourslackteam>.slack.com/apps/manage/custom-integrations
* Click 'Custom Integrations'
* Click 'Incoming Webhooks'
* Click 'Add Configuration'
* Select the channel that you want the posts to appear in from the drop down list
* Click 'Add Incoming WebHooks Integration'
* Make a note of the resulting Webhook URL that Slack displays, which will be something like `https://hooks.slack.com/services/TXXXXXXSY/B47XXXXXX/oapXXXXXXXXXXjJG4LqO3lzP`

You can also check out Slack's own guide to [Incoming Webhooks](https://api.slack.com/incoming-webhooks).

## Setup (AWS)

* Clone this repo
* Run `npm install`
* Zip up the following:
    * `index.js`
    * `node_modules`
* Create a new Lambda function, uploading your zip file as the source package
* Set the function to be triggered hourly (or some other interval of your choosing) using a cron expression in a CloudWatch Event (see example screenshot below)
* Set environment variables as described below

![CloudWatch Event Setup](screenshots/cloudwatch_cron_event.png)

## Environment Variables

This Lambda function requires the following environment variables:

* `RUN_INTERVAL` - set to the number of minutes between runs of the function (needs to agress with the cron expression you set up in CloudWatch to trigger the function (example: if cron fires every hour, set this to 60)
* `SLACK_HOOK_URL` - set to the full URL for your incoming webhook to Slack (example: `https://hooks.slack.com/services/T025XXXXX/B42XXXXXB/YXXXXXzoTAdVqzGjXXXXXXXX`)
* `BLOG_FEED_URL` - set to the URL of the RSS feed to monitor (example: `http://moduscreate.com/feed/`)

## Example Output

This will produce output similar to this when a new blog post is detected:

![Example New Blog Published](screenshots/new_blog_entry_detected.png)

If multiple posts have been published since the last run and within the configured time limit, each one will be reported as a separate bullet point in the list.  The bot posts a single message to Slack in either case, and the title of the blog is a clickable link in Slack.  Slack deals with determining what, if any, preview to show.

## How it Works

This works by first of all grabbing the RSS feed for the blog (in our case from here `http://moduscreate.com/feed/`), then parsing it to an XML object using the [xml2js module](https://www.npmjs.com/package/xml2js).

This returns an object whose structure broadly reflects that of the RSS feed, with one difference being that xml2js parses child elements into arrays, so to access the nodes at `rss/channel/item` we need to use:

```
rss.channel[0].item
```

Having read the RSS feed, the code then loops over each item in it and checks to see if the `pubDate` for that item is within the time since the last time that the function ran (By using the environment variable `RUN_INTERVAL` to determine how often the function is set to run.  This isn't ideal as this needs to be set so that it agrees with the CloudWatch cron expression that actually runs the function, but I was unable to find a way for a running AWS Lambda function to query the time it was last invoked without using persistent database storage or serializing a JSON object to S3, so figured this was good enough).  Each "new since the last run" blog posts it put in the `newBlogEntries` array.  The code stops looking in the RSS feed when it finds an entry that is older than the last run time of the function.

If there are new blog entries since the last run, the code then loops over `newBlogEntries` and constructs a Slack message for each, consisting of the title of the blog (which is also a link to the article), and the author's name.  These are then posted to a Slack Web Hook URL as a single message.

## Useful Links

* [AWS Lambda coding with Node](http://docs.aws.amazon.com/lambda/latest/dg/programming-model.html)
* [Triggering Lambda functions using cron expressions with CloudWatch](http://docs.aws.amazon.com/lambda/latest/dg/with-scheduled-events.html)
* [Slack Incoming WebHooks](https://api.slack.com/incoming-webhooks)
* [Slack Message Formatting](https://api.slack.com/docs/message-formatting)
* [Node `xml2js` module documentation](https://www.npmjs.com/package/xml2js)
* [Node `request` module documentation](https://www.npmjs.com/package/request)