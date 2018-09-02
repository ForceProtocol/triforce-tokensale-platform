
const validator = require('validator');

module.exports = {

	login: async (email, password, withoutPassword)=>{
	
		let user = await User.findOne({email, isDeleted: false});

		if(!user){
      throw new CustomError('Invalid email or password', {status: 401});
    }

		const isValidPassword = withoutPassword ? true : await user.validatePassword(password);

		if(!isValidPassword){
      throw new CustomError('Invalid email or password', {status: 401});
    }

		if([Status.PENDING, Status.ACTIVE].indexOf(user.statusId) === -1){
		  throw new CustomError('This account is not active. Please contact support for help', {status: 401});
    }

		const rsp = {
		  user: user,
  		token: jwToken.issue({
  		  user: user.toJSON()
		  }, sails.config.LOGIN_TOKEN_EXPIRY)
		};

		user.lastLogin = new Date();
		delete user.password;
		user.save();

		return rsp;
	},
	

  sendActivationEmail: async (email)=>{

    if(!email || !validator.isEmail(email))
      throw new CustomError('Please provide a valid email address', {status: 400});
    let user = await User.findOne({
      email: email,
      isDeleted: false
    });

    if(!user)
      throw new CustomError('Could not find any inactive user with your provided details', {status: 400});

    let activationToken = jwToken.issue({
      route: sails.config.BASE_URL + 'user/activate',
      user:user.toJSON()
    }, sails.config.ACCOUNT_ACTIVATION_TOKEN_EXPIRY);

    let msg = `Hello and welcome to TriForce Tokens. Please click on the link below to activate your account
      <br><br>
      <a href="${sails.config.APP_URL}verify-email?token=${activationToken}">Activate Your Account</a>
      <br>
     <br />
      Kind Regards,<br />
      Support @ TriForce Tokens
    `;

    return await EmailService.sendEmail({
      fromEmail: 'support',
      fromName: 'Support',
      toEmail: user.email,
      toName: `${user.firstName} ${user.lastName}`,
      subject: 'Welcome to TriforceTokens',
      body: msg
    })

  },


  sendEtherVerifyEmail: async (user, etherAddress)=>{

    let activationToken = jwToken.issue({
      route: sails.config.BASE_URL + 'user/verify-ether-request',
      user:user.toJSON()
    }, sails.config.ACCOUNT_ACTIVATION_TOKEN_EXPIRY);

    let msg = `Hello ${user.firstName},
      <br>You have made a request to change your ethereum address. Please click on the link below to confirm that you want to change your ethereum address to ${etherAddress}  
      <br><br>
      <a href="${sails.config.APP_URL}verify-ether-request?token=${activationToken}">Confirm</a>
      <br><br>
      If you can't visit the link above, please copy and paste the following URL into your browser address bar:<br />
	  ${sails.config.APP_URL}verify-ether-request?token=${activationToken}
	  
      <br>
     <br />
      Kind Regards,<br />
      Support @ TriForce Tokens
    `;

    return await EmailService.sendEmail({
      fromEmail: 'support',
      fromName: 'Support',
      toEmail: user.email,
      toName: `${user.firstName} ${user.lastName}`,
      subject: 'Adress Update Request - TriforceTokens',
      body: msg
    })

  },

  sendResetPasswordEmail: async(email)=>{
    if(!email || !validator.isEmail(email))
      throw new CustomError('Please provide a valid email address', {status: 400});
    let user = await User.findOne({
      email: email,
      statusId: [Status.PENDING, Status.ACTIVE, Status.LIVE],
      isDeleted: false
    });

    if(!user)
      throw new CustomError('Could not find any user with your provided details', {status: 400});

    let activationToken = jwToken.issue({
      route: sails.config.BASE_URL + 'user/reset',
      user: user.toJSON()
    }, sails.config.ACCOUNT_ACTIVATION_TOKEN_EXPIRY);

    let msg = `You have made a request to reset your password. Please visit the link below to enter a new password
		for your account.
      <br><br>
      <a href="${sails.config.APP_URL}reset-password/${activationToken}">Reset Your Password</a>
      <br><br />
	  If you can't visit the link above, please copy and paste the following URL into your browser address bar:<br />
	  ${sails.config.APP_URL}reset-password/${activationToken}
	  <br />
	  <br />
      If you experience any difficulty resetting your password, please either email pete@triforcetokens.io or join our telegram https://t.me/triforcetokens
	  <br />
      <br />
      Kind Regards,<br />
	  Support @ TriForce Tokens`;

    return await EmailService.sendEmail({
      fromEmail: 'support',
      fromName: 'Support',
      toEmail: user.email,
      toName: `${user.firstName} ${user.lastName}`,
      subject: 'Reset password requested for your TriForce Tokens account',
      body: msg
    })
  },

  verifyTOTP: async (tfaToken, userId)=> {
    if (!_.isString(tfaToken)) {
      throw new CustomError('Invalid token provided');
    }
    const speakeasy = require('speakeasy');
    const user = await User.findOne({id: userId, statusId: [Status.PENDING, Status.LIVE, Status.ACTIVE]});

    if(!user) throw new CustomError('Could not find any user with your provided details', {status: 404});

    if(!user.tfaSecret){
      user.tfaEnabled = false;
      delete user.password;
      user.save();
      throw new CustomError('Please request to enable 2FA first');
    }

    const verified = speakeasy.totp.verify({
      secret: user.tfaSecret, //secret of the logged in user
      encoding: 'base32',
      token: tfaToken
    });
    if (verified) {
      user.tfaEnabled = true;
      delete user.password;
      user.save();
      return 'Two-factor auth enabled';
    }

    throw new CustomError('Invalid token, verification failed', {status: 400});
  }
};
