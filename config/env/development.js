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
      password: '',
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
  COINBASE_COMMERCE_API_KEY: 'bd19cdda-046a-47dc-b76b-94224ea1a3ac',
  COINBASE_COMMERCE_SHARED_SECRET: '4e5660f6-28d3-47a2-9f77-6b494841d725',

  hookTimeout: 120000,

  COMMUNITY_NAME: 'triforce tokens',
  SLACK_URL: 'triforcetokens.slack.com',
  SLACK_TOKEN: 'xoxp-190493269351-236060420833-241212037735-1f2fb485aab99b212c88e8b1f0a2ff1d',


  log: {
    level: 'verbose'
  },
  MANDRILL_KEY: 'EHaaGsImRCQrLW9vrWSedA',
  AUTH_SECRET: '84EF59432FB2E6C4A53838F72F1DA',

  LOGIN_TOKEN_EXPIRY: '30 days',
  ACCOUNT_ACTIVATION_TOKEN_EXPIRY: '12 hours',

  SMTP_PORT: 2525,

  COINPAYMENT_OPTS : {
    key: '31d5299bc71b0bdfd62f4be017e90f2eb5fa2e7aed263005e5fac309e1f58e7e',
    secret: 'cab6aAC0fc606603d4a4e834f8C1C1296aED3D15E249239b5538D9486545e694'
  },
  MERCHANT_ID : '3708286360a4e4d788a24a97dd093cba',

  MAILER: 'triforcetokens.io',
  BASE_URL: 'http://localhost:1337/',
  APP_URL: 'http://localhost:1337/',
  API_URL: 'http://localhost:1337/',

  blockchain: {
    icoLaunch: new Date('2018-01-20T12:30:00.329Z'),
    icoClose: new Date('2018-03-16T12:30:00.329Z'),
    connection: {
      // ws: 'ws://localhost:8646',
      ws: 'https://rinkeby.infura.io/7RU8T58C7rBMPgXjluUm',
      rpc: '',
      ipc: ''
    },
    /**
     * insert all contract addresses here.
     * System will use these contract addresses to connect to contracts and watch events/perform actions
     */
    contracts: {
      WhiteList: '0x8fc1aac5a4083e5466ed6def32b119e704c7b8bf',
      Token: '0x794eb1f985f472c0b44c4041b4198478366f9940',
      //WhiteList: '0x04b91588ea2465d7A696742f45cC72afC681E52B',
      // WhiteList: '0x5913a4b42BbB8150e016905EdA08C84dE869D203',
      // TriForceNetworkCrowdsale: '0x8b2043FCe78bF09A87b9a149EE3DDcc1fA5D408D'
      // TriForceNetworkCrowdsale: '0x5f58988f9325e8255f8E6A4Bce50dDe300B027F7'
      TriForceNetworkCrowdsale: '0xc0e95ed492fa0520f191d954e040c684f04259f2'
    },
    owner: '0x96E3F15894944FFd32DeFc2016da209dD4f8d69b',
    privateKey: '303c5abc397464fc13f8d99d0a97afc11f5f20ed88a13b5d2c8a6c6548d3ee8b'
  },

  contacts: {
    team: ['pete@triforcetokens.io', 'jake@triforcetokens.io']
  },
  
  /** Twitter - service  Keys */
  twitterService: {
    consumer_key: 'Ief0uelYEH3sHIBusJmaXrUyK',
    consumer_secret: '08fWVfdyGZiHX0vF31zm7O3ZtoZ8tS9WyJizp7ITckvJtMz6yK',
  },

  RECAPTCHA: {
    PUBLIC_KEY: '6LejfD8UAAAAAIuIZcStpaeaazsQH5brs32sDWza',
    PRIVATE_KEY: '6LejfD8UAAAAAKmBbSB5Jss5CiQQ5fOhh1QRvCfD'
  },

  MAILCHIMP_KEY: '17718b6328f312bc750f542d8fbefd5c-us16',

  RUNCPA_API_KEY: 'KsukkSrO3yL5-Dm5Kl0NqA16MJ58V4A9/cpl44516',
};
