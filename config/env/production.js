/**
 * Production environment settings
 */

module.exports = {
  PRE_ICO_ENABLED: false,

  connections : {
    mysqlDbProd: {
      adapter: 'sails-mysql',
      host: '178.62.109.184',
      user: 'triforcer236',
      password: 'ji4Zr56Bu72FY',
      database: 'triforce_live'
    },
  },
  models: {
    connection: 'mysqlDbProd'
  },

  port: 8080,

  hookTimeout: 120000,

  log: {
    level: "info"
  },

  mandrillApiKey: 'pScbI1GG5IjISeRbQIvzXg',             // PRODUCTION KEY
  mandrillTestApiKey: '57Ev-Hbw1O4KoVnCT3UfnQ',         // TEST KEY

  COINBASE_COMMERCE_API_KEY: 'bd19cdda-046a-47dc-b76b-94224ea1a3ac',
  COINBASE_COMMERCE_SHARED_SECRET: '4e5660f6-28d3-47a2-9f77-6b494841d725',

  MANDRILL_KEY: 'EHaaGsImRCQrLW9vrWSedA',
  AUTH_SECRET: '84EF59432FB2E6C4A53838F72F1DA',
  
  MAILGUN_KEY: '6cb643a51eaee9afb8aa268986269852-a4502f89-42963f1a',

  LOGIN_TOKEN_EXPIRY: '30 days',
  ACCOUNT_ACTIVATION_TOKEN_EXPIRY: '12 hours',

  COMMUNITY_NAME: 'triforce tokens',
  SLACK_URL:'triforcetokens.slack.com',
  SLACK_TOKEN:'xoxp-190493269351-236060420833-241212037735-1f2fb485aab99b212c88e8b1f0a2ff1d',

  API_URL: 'https://forceprotocol.com/',

  COINPAYMENT_OPTS : {
    key: 'b703dffaa0dfedb1695ceb7e6b3c90638c34ea6a73393e2a72a8ad6e8b7067be',
    secret: 'cc722305803bAEEdCD2D91f921E07e6cFBB019D6576aAf9d8D444b7a15bD08Cc'
  },
  MERCHANT_ID : 'de44fbc0e7ce2316fd8907d52d91026d',

  MAILER: 'forceprotocol.com',
  BASE_URL: 'https://forceprotocol.com/',
  CONTRIBUTOR_URL: 'https://forceprotocol.com/',
  APP_URL: 'https://forceprotocol.com/',


  blockchain: {
    icoLaunch: new Date('2018-02-20T12:30:00.329Z'),
    icoClose: new Date('2018-03-06T12:30:00.329Z'),
    connection: {
      ws: 'https://mainnet.infura.io/I8oNDkKazzdQHr0u1IPp',
      rpc: '',
      ipc: ''
    },
    contracts: {
      WhiteList: '0xd242ce207159d083e806f7a01af06068682c01b0',
      TriForceNetworkCrowdsale: '0x9c71c71b8ce745f3a5c073b73d6ca7d36aa7524b'
    },

    owner: '0x13F4dB79694b742C2E18c64A857c68afd1333A88',
    privateKey: '5615135407c2196d525892f4c9794988b64de98bf245e99cdf700f0a06de184b'
  },

  contacts: {
    team: ['pete@forceprotocol.io', 'jake@forceprotocol.io']
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


