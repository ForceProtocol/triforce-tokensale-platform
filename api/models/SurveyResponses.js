/**
* SurveyResponses.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/


module.exports = {
	attributes: {

        email: {
            type: 'email'
        },
        companyName: {
            type: 'string',
            size: 255
        },
        wallet: {
            type: 'string',
            size: 60,
            defaultsTo: ''
        },
        rewardInPound: {
            type: 'integer',
            size: 6,
            defaultsTo: '50'
        },
        paid: {
            type: 'boolean',
            defaultsTo: false
        },
        reliability: {
            type: 'integer',
            size: 1,
            defaultsTo: 0
        },
        companyType: {
            type: 'string',
            size: 60
        },
        platforms: {
            type: 'string',
            size: 80
        },
        largestRevenue: {
            type: 'string',
            size: 60
        },
        inappRevenue: {
            type: 'string',
            size: 60
        },
        switchProvider: {
            type: 'string',
            size: 60
        },
        offerOwnCurrency: {
            type: 'string',
            size: 60
        },
        offerPlayerBetting: {
            type: 'string',
            size: 60
        },
        offerPlayerItemTrading: {
            type: 'string',
            size: 60
        },
        goodIdea: {
            type: 'string',
            size: 60
        },
        hasRankingSystem: {
            type: 'boolean',
        },
        useRankingSystem: {
            type: 'string',
            size: 60
        },
        becomeSupporter: {
            type: 'string',
            size: 60
        },
        comments: {
            type: 'text'
        }


    }
};

