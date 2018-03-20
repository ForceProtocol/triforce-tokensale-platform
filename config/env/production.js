

/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

	PRE_ICO_ENABLED: false,

    connections : {
        mysqlDbProd: {
            adapter: 'sails-mysql',
            host: '178.62.109.184',
            user: 'triforcer236',
            password: 'ji4Zr56Bu72FY',
            database: 'triforcetokens_live'
        }
    },
    models: {
        connection: 'mysqlDbProd'
    },


    mandrillApiKey: 'pScbI1GG5IjISeRbQIvzXg',		// PRODUCTION KEY
    mandrillTestApiKey: '57Ev-Hbw1O4KoVnCT3UfnQ', 	// TEST KEY

    hookTimeout: 120000,

    COMMUNITY_NAME: 'triforce tokens',
    SLACK_URL:'triforcetokens.slack.com',
    SLACK_TOKEN:'xoxp-190493269351-236060420833-241212037735-1f2fb485aab99b212c88e8b1f0a2ff1d',
	
	API_URL: 'https://api.triforcetokens.io/',

};
