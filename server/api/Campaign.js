var _ = require('lodash')
var TwitterStream = require('../campaign/TwitterStream')
var TwitterRest = require('../campaign/TwitterRest')
var CampaignResults = require('../campaign/CampaignResults')

var Campaign = require('../models/campaign');
var Source = require('../models/source')
var Target = require('../models/target')

var CampaignApi = {
    get: function(data, res) {

    },

    getAll: function(user, res) {
        
        Campaign.find({}, function(error, doc) {
            if (error) return res(error);

            return res(null, doc)
        })

        // Campaign.findByUser({}, {user._id}, function(error, doc) {
        //     if (error) return res(error);

        //     return res(null, doc)
        // })
    },

    create: function(socket, user, data, res) {
        console.log(data)
        var campaign = new Campaign(data);

        

        // var sourceIds = [];
        // var targetIds = [];

        // _.forEach(data.sources, function(source) {
        //     var source = new Source(source);
        //     source.save(function(error) {
        //         if (error) res(error);
        //         sourceIds.push(source._id)
        //     })
        // })

        // _.forEach(data.targets, function(target) {
        //     var target = new Source(target);
        //     target.save(function(error) {
        //         if (error) res(error);
        //         console.log(target);
        //         targetIds.push(target._id)
        //     })
        // })

        // data.sources = sourceIds,
        // data.targets = targetIds;

        // console.log(data)
        // console.log(sourceIds)
        // console.log(targetIds)

        campaign.save(function(error) {
            if (error) return res(null, error);

            Campaign.populate(campaign, [{path: "sources"}, {path: "targets"}], 
                function(error, doc) {
                    console.log(doc)


                    // todo: cron-like scheduler / job-queue like celery or kue
                    twitterStream = new TwitterStream(doc); 
                    twitterStream.track()

                    twitterRest = new TwitterRest(doc);
                    twitterRest.start() 

                    campaignResults = new CampaignResults(doc)

                    campaignResults.on("new-node", socket.emit);
                    campaignResults.on("new-link", socket.emit);

                    twitterRest.on("completed", function() {
                        console.log("twitter rest was completed")
                        campaignResults.start()
                    })

                })
        });
    },

    update: function(data, res) {

    },

    remove: function(data, res) {

    }
}

module.exports = CampaignApi;