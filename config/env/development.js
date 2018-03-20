/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  PRE_ICO_ENABLED: false,

  connections: {
    mysqlDbProd: {
      adapter: 'sails-mysql',
      host: '178.62.109.184',
      user: 'triforcer236',
      password: 'ji4Zr56Bu72FY',
      database: 'triforcetokens_live'
    },
    mysqlDbDev: {
      adapter: 'sails-mysql',
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'triforcetokens_dev'
    },
    localDiskDb: {
      adapter: 'sails-disk'
    },
  },
  models: {
    connection: 'mysqlDbDev',
    migrate: 'alter'
  },


  mandrillApiKey: 'pScbI1GG5IjISeRbQIvzXg',		// PRODUCTION KEY
  mandrillTestApiKey: '57Ev-Hbw1O4KoVnCT3UfnQ', 	// TEST KEY

  hookTimeout: 120000,

  COMMUNITY_NAME: 'triforce tokens',
  SLACK_URL: 'triforcetokens.slack.com',
  SLACK_TOKEN: 'xoxp-190493269351-236060420833-241212037735-1f2fb485aab99b212c88e8b1f0a2ff1d',

  //API_URL: 'https://437ef17d.ngrok.io/'
  API_URL: 'http://localhost:1337/',

  models: {
    connection: 'mysqlDbDev',
    migrate: 'alter'
  },

  log: {
    level: 'verbose'
  },
  MANDRILL_KEY: 'EHaaGsImRCQrLW9vrWSedA',
  // MANDRILL_KEY: '57Ev-Hbw1O4KoVnCT3UfnQ',
  AUTH_SECRET: '84EF59432FB2E6C4A53838F72F1DA',

  LOGIN_TOKEN_EXPIRY: '30 days',
  ACCOUNT_ACTIVATION_TOKEN_EXPIRY: '12 hours',

  SMTP_PORT: 2525,
  /*
   Public Key: 31d5299bc71b0bdfd62f4be017e90f2eb5fa2e7aed263005e5fac309e1f58e7e
   Private Key: cab6aAC0fc606603d4a4e834f8C1C1296aED3D15E249239b5538D9486545e694
   merchantId: 3708286360a4e4d788a24a97dd093cba
   ipn secret: ^ihT6R/vLbn'b=C
   */

  COINPAYMENT_OPTS : {
    key: '31d5299bc71b0bdfd62f4be017e90f2eb5fa2e7aed263005e5fac309e1f58e7e',
    secret: 'cab6aAC0fc606603d4a4e834f8C1C1296aED3D15E249239b5538D9486545e694'
  },
  MERCHANT_ID : '3708286360a4e4d788a24a97dd093cba',

  // SMTP_PORT: 2525,

  MAILER: 'triforcetokens.io',
  // BASE_URL: 'https://093d86c7.ngrok.io/',
  BASE_URL: 'http://localhost:1337/',
  APP_URL: 'http://localhost:1338/',



  blockchain: {
    icoLaunch: new Date('2018-01-20T12:30:00.329Z'),
    icoClose: new Date('2018-03-16T12:30:00.329Z'),
    connection: {
      // ws: 'ws://localhost:8646',
      ws: 'https://ropsten.infura.io/7RU8T58C7rBMPgXjluUm',
      rpc: '',
      ipc: ''
    },
    /**
     * insert all contract addresses here.
     * System will use these contract addresses to connect to contracts and watch events/perform actions
     */
    contracts: {
      WhiteList: '0x04b91588ea2465d7A696742f45cC72afC681E52B',
      // WhiteList: '0x5913a4b42BbB8150e016905EdA08C84dE869D203',
      // TriForceNetworkCrowdsale: '0x8b2043FCe78bF09A87b9a149EE3DDcc1fA5D408D'
      TriForceNetworkCrowdsale: '0x5f58988f9325e8255f8E6A4Bce50dDe300B027F7'
    },

    owner: '0x71Dac043a1E056b23491Fa514132DaE040C7f19e',
    privateKey: 'b2ea2591f45943e74b2e7487bc7ed1749fedb005087601b76cce9f024c3862a5'
  },

  contacts: {
    team: ['raza@triforcetokens.io', 'pete@triforcetokens.io', 'jake@triforcetokens.io']
  }

};
