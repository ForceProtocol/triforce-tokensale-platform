
module.exports.WhiteList = require('./WhiteList.js');
module.exports.TriForceNetworkCrowdsale = require('./TriForceNetworkCrowdsale.js');

module.exports.initAll = async ()=> {
  const self = this;

  self.WhiteList.init();
  self.TriForceNetworkCrowdsale.init();

};

module.exports.getSummary = async ()=>{
  const self = this;

  let crowdsale = await self.TriForceNetworkCrowdsale.init();

  return await sails.bluebird.props({
    rate:  crowdsale.rate().call(),
    startTime:  new Promise((resolve, reject)=> {
      crowdsale.startTime().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    }),
    endTime:  new Promise((resolve, reject)=> {
      crowdsale.endTime().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    }),
    goal: new Promise((resolve, reject)=> {
      crowdsale.goal().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    }),
    weiRaised: new Promise((resolve, reject)=> {
      crowdsale.weiRaised().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    })
  });
};
