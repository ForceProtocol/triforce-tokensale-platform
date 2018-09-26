
module.exports.Token = require('./Token.js');
module.exports.WhiteList = require('./WhiteList.js');
module.exports.TriForceNetworkCrowdsale = require('./TriForceNetworkCrowdsale.js');

module.exports.initAll = async ()=> {
  const self = this;

  self.Token.init();
  self.WhiteList.init();
  self.TriForceNetworkCrowdsale.init();

};

module.exports.getSummary = async ()=>{
  const self = this;

  let crowdsale = await self.TriForceNetworkCrowdsale.init();

  return await sails.bluebird.props({
    rate:  crowdsale.methods.rate().call(),
    startTime:  new Promise((resolve, reject)=> {
      crowdsale.methods.startTime().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    }),
    endTime:  new Promise((resolve, reject)=> {
      crowdsale.methods.endTime().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    }),
    goal: new Promise((resolve, reject)=> {
      crowdsale.methods.goal().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    }),
    weiRaised: new Promise((resolve, reject)=> {
      crowdsale.methods.weiRaised().call(function (er,supply) {
        if(er) return reject(er);
        resolve(supply);
      });
    })
  });
};
