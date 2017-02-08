// TODO look at a promise library for request?
// TODO or maybe this node has that built in? -- it does
// TODO fetch api - can this use post?
// TODO validate data logic

'use strict';

const ONE_MINUTE = 60 * 1000;

const request = require('request'),
      parseXMLString = require('xml2js').parseString,
      blogFeedUrl = process.env.BLOG_FEED_URL,
      runInterval = parseInt(process.env.RUN_INTERVAL);

exports.handler = (event, context, callback) => {
  request(blogFeedUrl, (err, res, body) => {
    if (! err && res.statusCode == 200) {
      parseXMLString(body, (e, r) => {
        if (! err && r) {
          let newBlogEntries = [];

          // Loop over entries until we find one that is too old.
          for (let blogEntry of r.rss.channel[0].item) {          
            // Work out if the blog entry is new since last time we looked...
            let latestBlogTime = new Date(blogEntry.pubDate[0]),
                currentTime = new Date();
              
            if ((currentTime.getTime() - latestBlogTime.getTime()) <= (runInterval * ONE_MINUTE)) {
              // Post was published since the last check...
              newBlogEntries.push({
                author: blogEntry['dc:creator'][0],
                title: blogEntry.title[0],
                link: blogEntry.link[0]
              });              
            } else {
              // We are done as blog entries are in date order with most recent first.
              // TEMP -- this should really be a "break;"
              newBlogEntries.push({
                author: blogEntry['dc:creator'][0],
                title: blogEntry.title[0],
                link: blogEntry.link[0]
              });              
            }
          }

          if (newBlogEntries.length > 0) {
            // Post message(s) to Slack
            let messageBody = '{"text": "*New blog entr' + (newBlogEntries.length === 1 ? 'y' : 'ies') + ' published:*\n\n';

            for (let blogEntry of newBlogEntries) {
              messageBody += '• <' + blogEntry.link + '|' + blogEntry.title + '> _by ' + blogEntry.author + '_\n';
            }

            messageBody += '"}';

            request.post({
              url: process.env.SLACK_HOOK_URL,
              body: messageBody
            });
          }

          callback(null, (newBlogEntries.length === 0 ? 'No' : newBlogEntries.length) + ' new blog entries found.');
        } else {
          callback('New blog check errored - no XML or bad XML.');
        }
      });
    } else {
      callback('Blog page errored, error code ' + res.statusCode + '.');
    }
  });
};