var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

var contribute = {
  processing: false,
  getAddress: function (coin, el) {
    if(contribute.processing){
		alert('Please wait...');
		return;
	}

    contribute.processing = true;

	$(el).button('loading');

    $.get( API_URL + 'user-crypto?currency='+coin+'&token='+TOKEN, function( data ) {
      $(el).hide();
      $(el).after('<pre>'+data.address+'</pre>');
    })
      .fail(function() {
      alert( "Error occurred while processing your request. Please reload page. If problem persists, contact support" );
    })
      .always(function () {
        contribute.processing = false;
		$(el).button('reset');
      })
    ;
  },

  btnDisable: function (el) {
    if(contribute.processing) {
      alert('Please wait...');
      return false;
    }

    contribute.processing = true;
    return false;

  },

  enableTFA: function (el) {
    if(contribute.processing){
      alert('Please wait...');
      return;
    }

    contribute.processing = true;

    $.get( API_URL + 'user/enable-tfa?token='+TOKEN, function( data ) {
      $(el).hide();
      $(el).after(data+'<br /><p>Please scan the barcode with google authenticator app and enter the code below</p>' +
        '<form action="/verify-tfa?token='+TOKEN+'" method="post"><div class="form-group"><input style="color:#000" type="number" name="tfa_token"></div><input class="btn btn-primary" type="submit" value="Submit"></form>');

    })
      .fail(function(er) {
        alert( er.responseText || "Error occurred while processing your request. Please reload page. If problem persists, contact support" );
      })
      .always(function () {
        contribute.processing = false;
      })
  },

	requestAddressChange: function (el) {
		if(contribute.processing){
			alert('Please wait...');
			return;
		}

		var inputId = $(el).attr("etherAddressInput");

		// var rawAdd = $('.ether_address:eq(' + inputId + ')').val();
		var rawAdd = $(el).closest('form').find('input').val();

		if(!rawAdd || typeof rawAdd !== 'string' || !rawAdd.length){
			console.log('no address to process');
			return;
		}

    contribute.processing = true;

    var encodedString = Base64.encode(rawAdd);

    $.post( API_URL + 'user/setup-ether-address?ether_address='+encodedString+'&token='+TOKEN, function( data ) {
      $(el).closest('form').html('<div class="alert alert-success"><p>Please check your email address for a confirmation email</p></div>');
    })
      .fail(function() {
        alert( "Error occurred while processing your request. Please reload page. If problem persists, contact support" );
      })
      .always(function () {
        contribute.processing = false;
      })
    ;
  },

  /**
   * show success/error message
   * @param msg
   * @param [msgType] - success or danger. defaults to success
   * @param parentEl - parent element where we want to show error
   * @param [duration] - in ms. default to unlimited (untill refresh)
   * @returns newly created msg
   */
  showMessage: function (msg, msgType, parentEl, duration) {
    var tmpId = 'msg-'+new Date().getTime();
    msg = '<div class="alert alert-'+msgType+'" id="'+tmpId+'"><p class="error"><i class="fa fa-exclamation-triangle"></i> &nbsp;&nbsp;'
      + msg
      + '</p></div>';
    $(parentEl).prepend(msg);

    if(Array.isArray(this.msgs))
      this.msgs.push(tmpId);
    else this.msgs = [tmpId];

    if(duration){
      setTimeout(function () {
        $('#'+tmpId).slideUp(function () {
          $('#'+tmpId).remove();
        });
      }, duration);
    }

    return $('#'+tmpId);
  },
  removeAllMessages : function () {
    if(Array.isArray(this.msgs))
      this.msgs.forEach(function(_id){$('#'+_id).remove()});
  }

};
