# New Blog Bot

Simple AWS Lambda Bot that posts new blog entries to Slack.  Works by polling an RSS feed at a configurable interval, and checking for entries published in the time period since the last run.

## Setup

* Create a new Lambda function using the contents of `index.js`
* Set the function to be triggered hourly (or some other interval of your choosing) using a cron expression in a CloudWatch Event (see example screenshot below)
* Set environment variables as described below

![CloudWatch Event Setup](screenshots/cloudwatch_cron_event.png)

## Environment Variables

This Lambda function requires the following environment variables:

* `RUN_INTERVAL` - set to the number of minutes between runs of the function (needs to agress with the cron expression you set up in CloudWatch to trigger the function (example: if cron fires every hour, set this to 60)
* `SLACK_HOOK_URL` - set to the full URL for your incoming webhook to Slack (example: )
* `BLOG_FEED_URL` - set to the URL of the RSS feed to monitor (example: `http://moduscreate.com/blog/`)

## Example Output

This will produce output similar to:

TODO

Where the blog post title is a link to the blog post page.

## Useful Links

* [AWS Lambda coding with Node](http://docs.aws.amazon.com/lambda/latest/dg/programming-model.html)
* [Triggering Lambda functions using cron expressions with CloudWatch](http://docs.aws.amazon.com/lambda/latest/dg/with-scheduled-events.html)
* [Slack Incoming WebHooks](https://api.slack.com/incoming-webhooks)
* [Node `xml2js` module documentation](https://www.npmjs.com/package/xml2js)
* [Node `request` module documentation](https://www.npmjs.com/package/request)