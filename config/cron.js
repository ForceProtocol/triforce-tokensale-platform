const Coinpayments = require('coinpayments'),
  moment = require('moment'),
  Dropbox = require('dropbox');


module.exports.cron = {


  // getCurrencyRates: {
  //   schedule: '*/15 * * * *',  // every 15 minute
  //
  //   onTick: function () {
  //     let acceptedCurrency = Transaction.allowedCurrencies;
  //     acceptedCurrency.push('USD');
  //
  //     let client = new Coinpayments(sails.config.COINPAYMENT_OPTS);
  //     client.rates({accepted: 1}, function (err, result) {
  //
  //       if (err) {
  //         sails.log.error(err);
  //         return;
  //       }
  //
  //       const processReq = async () => {
  //         for (let currency in result) {
  //           // skip loop if the property is from prototype
  //           if (!result.hasOwnProperty(currency)) continue;
  //           if (acceptedCurrency.indexOf(currency) === -1) continue;
  //           let record = result[currency];
  //
  //
  //           let _price = await CryptoPrice.update({
  //             currency: currency
  //           }, {
  //             rate_btc: record.rate_btc,
  //             rateAt: moment.unix(record.last_update).toDate()
  //           });
  //
  //           if (!_price || !_price.length)
  //             await CryptoPrice.create({
  //               currency: currency,
  //               rate_btc: record.rate_btc,
  //               rateAt: moment.unix(record.last_update).toDate(),
  //               name: record.name,
  //               is_fiat: record.is_fiat
  //             });
  //         }
  //         return true;
  //       };
  //
  //       processReq()
  //         .catch(_err => sails.log.error('error while processing latest rate', _err));
  //
  //
  //     })
  //   }
  // },
  /**
   * Run the Backup Cron task after every 4 hours
   * and store the dumped sql file to Dropbox
   */
  backUpCronTask: {
    schedule: '0 0 5,12,22 * * *', //runs after every 20min
    onTick: function () {
      const config = sails.config;
      const dbCon = config.connections[config.models.connection];
      const mysqlDump = require('mysqldump'), fs = require('fs');
      const backUpFile = 'mysql-backup-' + moment().format('YYYY-MM-DD-HH-mm-ss') + '.sql';

      mysqlDump({
        host: dbCon.host,
        user: dbCon.user,
        password: dbCon.password,
        database: dbCon.database,
        ifNotExist: true, // Create table if not exist
        dest: './.tmp/' + backUpFile // destination file
      }, (err) => {
        try {
          if (err) {
            fs.unlinkSync('./.tmp/' + backUpFile);
            throw new CustomError('Database backup for site has finished. Following response/errors(if any) reported: ',{err});
          } else {
            const dbx = new Dropbox({accessToken: 'dpN7aXEL3xUAAAAAAAAX47hNQw2DYxea1DIfFoLLe4QUC5lD1MiH7S_aEfrjyQvx'});
            fs.readFile('./.tmp/' + backUpFile, 'utf8', (err, stream) => {
              if (err)
                throw new CustomError('Database backup for site has finished. Following response/errors(if any) reported: ',{err});

              dbx.filesUpload({path: '/' + backUpFile, contents: stream})
                .then((response) => {
                  if (response) {
                    sails.log(`BACKUP CRON TASK RUN : SAVED THIS ${backUpFile} TO DROPBOX`);
                  }
                  fs.unlinkSync('./.tmp/' + backUpFile);
                })
                .catch(error => {
                  error = error.error ? error.error : error;
                  sails.log.error('db backup error', error);
                  fs.unlinkSync('./.tmp/' + backUpFile);
                });
            });
          }
        } catch (ex) {
          fs.unlinkSync('./.tmp/' + backUpFile);
          sails.log.error(ex);
        }
      });
    }
  },


	kycCheck: {
		schedule: '*/30 * * * *',  // every 30 minutes

		onTick: function () {
			ArtemisApiService.checkIndividualStatus()
			.then(rsp=> {
				sails.log.info(new Date(), 'successfully processed KYC cron', rsp);
			})
			.catch(err=> {
				sails.log.error(new Date(),'KYC CHECK cron task failed', err);
			});
		}
	},


  icoPendingTxns: {
    schedule: '*/1 * * * *',

    onTick: function () {
	
		/**

		  sails.log.info(new Date(), 'started processing pending ICO txns cron task');

		  BlockchainService.contracts.TriForceNetworkCrowdsale.processOldEvents()
			.catch(_err => sails.log.error('error while processing ico pending txns ', _err));
			
		**/
    }
  },

	// addPendingToWhitelist: {
	// 	schedule: '*/3 * * * *',
	// 	onTick: function() {
	// 		sails.log.info(new Date(), 'started adding pending users to whitelist');

  //     let processed = 0;
  //     const processReq = async () => {

  //       let users = await User.find({
  //         approvalStatus: ['CLEARED', 'APPROVED', 'ACCEPTED'],
  //         wlStatus: {'!': 3},
  //         select: ['id', 'whitelistEthAddress']
  //       }).sort('updatedAt DESC').limit(150);
  //       sails.log.info(`found ${users.length} users. started adding them to whitelist`);
  //       for (let user of users) {
  //         let bcRsp = false;
  //         if(!user.whitelistEthAddress) {
  //           sails.log.info(`id: ${user.id}'s wallet address is not right. ignoring`);
  //           continue;
  //         }
  //         try {
  //           bcRsp = await BlockchainService.contracts.WhiteList.addWhiteListed(user.whitelistEthAddress);
  //           sails.log.info(`whitelist BC rsp for user ${user.id}: `, bcRsp);
  //           processed++;

  //         }catch(e){
  //           sails.log.error(`error while adding user to whitelist using crontask user ${user.id}: `, e.message);
  //         }
  //         user.wlStatus = bcRsp === true ? 3 : 2;
  //         await user.save();
  //       }

  //       return true;
  //     };

  //     processReq().then(() => {
  //       sails.log.info(`successfully processed ${processed} whitelist users`);
  //     })
  //       .catch(err => {
  //         sails.log.info('successfully processed few: ', processed);
  //         sails.log.error('error while adding user to whitelist using crontask: ', err.message);

  //       })

	// 	}
	// },

  // //check for pending again which we requested in previous crontask
	// addPendingToWhitelist2: {
	// 	schedule: '*/7 * * * *',
	// 	onTick: function() {
	// 		sails.log.info(new Date(), 'started adding pending users to whitelist2');

  //     let processed = 0;
  //     const processReq = async () => {

  //       let users = await User.find({
  //         approvalStatus: ['CLEARED', 'APPROVED', 'ACCEPTED'],
  //         wlStatus: 2,
  //         select: ['id', 'whitelistEthAddress']
  //       }).sort('updatedAt DESC').limit(200);

  //       for (let user of users) {
  //         let bcRsp = false;
  //         if(!user.whitelistEthAddress) continue;
  //         try {
  //           bcRsp = await BlockchainService.contracts.WhiteList.addWhiteListed(user.whitelistEthAddress);
  //           sails.log.info(`whitelist BC rsp for user ${user.id}: `, bcRsp);
  //           processed++;

  //         }catch(e){
  //           sails.log.error(`error while adding user to whitelist using crontask user ${user.id}: `, e.message);
  //         }
  //         user.wlStatus = bcRsp === true ? 3 : 2;
  //         await user.save();
  //       }

  //       return true;
  //     };

  //     processReq().then(() => {
  //       sails.log.info(`successfully processed ${processed} whitelist users`);
  //     })
  //       .catch(err => {
  //         sails.log.info('successfully processed few: ', processed);
  //         sails.log.error('error while adding user to whitelist using crontask: ', err.message);

  //       })

	// 	}
	// },


};
