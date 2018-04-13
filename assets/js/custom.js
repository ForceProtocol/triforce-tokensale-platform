
// Google Recaptcha Callback
var recaptchaEnabled = false;
function recaptchaCallback() {
	recaptchaEnabled = true;
};


$(document).ready(function () {

	var api_url = $('#environmentApi').val();

	web3Obj.init();

	$(window).scroll(function () {
		if (!$(this).scrollTop()) {
			$('.scrollable-nav').css("background-color", "rgba(255, 255, 255, 0.5)");
		} else {
			$('.scrollable-nav').css("background-color", "rgba(255, 255, 255, 1)");
		}
	});

	$(window).on('load', function () {
		// Animate loader off screen
		$(".se-pre-con").fadeOut("fast");
	});

	$('#load').on('click', function () {
		var $this = $(this);
		$this.button('loading');
		setTimeout(function () {
			$this.button('reset');
		}, 8000);
	});

	new WOW().init();


	$('.panel-chart').easyPieChart({
		easing: 'easeOutQuart',
		size: 86,
		lineWidth: 5,
		scaleColor: false,
		animate: 1000,
		barColor: '#c79a18',
		trackColor: '#61626a'
	});

	$('.panel-chart-lg').easyPieChart({
		easing: 'easeOutQuart',
		size: 150,
		lineWidth: 5,
		scaleColor: false,
		animate: 1000,
		barColor: '#c79a18',
		trackColor: '#61626a'
	});

	$().timelinr({
		autoPlay: 'false',
		autoPlayDirection: 'forward',
		issuesSelectedClass: 'selectedwewe',
		prevButton: '#prev',
		// value: any HTML tag or #id, default to #prev
		nextButton: '#next',
	})


	// Pre Sale Subscribe User
	$(".presale-subscribe-form").submit(function (e) {
		e.preventDefault();

		// Show form submit processing
		$(".presale-subscribe-btn").button('loading');

		$.post("/subscribe-presale", $(this).serialize(), function (data) {

			if (data.status == 'error') {
				window.location.replace("/");
			} else {
				window.location.replace("/thanks-uk");
			}

		}, "json");

	});


	/** Perform ICO Countdown Display **/
	var campaignLive = false;
	//var end = new Date(Date.UTC(2018, 1, 6, 19, 30, 0));
	var end = new Date(Date.UTC(2018, 1, 18, 12, 30, 0));
	var now = new Date();

	// Token sale is live
	if (end < now) {
		campaignLive = true;
		$('#banner').addClass("reduce-top-banner-height");
	}

	var _second = 1000;
	var _minute = _second * 60;
	var _hour = _minute * 60;
	var _day = _hour * 24;
	var timer;

	function showRemaining() {
		var now = new Date();
		var distance = end - now;

		if (distance < 2000) {
			clearInterval(timer);
			campaignLive = true;
			$('.countdown-div').hide();
			$('.countdown-div-mobile').hide();
			$('#contribution-progress').show();
			$('#banner').addClass("reduce-top-banner-height");
			$('.display-when-live').show();
			$('.hide-when-live').hide();
			$('.show-metamask').show('fast');
			clearInterval(timer);
			return;
		} else {
			$('.show-metamask').hide();
		}

		var days = Math.floor(distance / _day);
		var hours = Math.floor((distance % _day) / _hour);
		var minutes = Math.floor((distance % _hour) / _minute);
		var seconds = Math.floor((distance % _minute) / _second);

		$(".days-remain").text(days);
		$(".hours-remain").text(hours);
		$(".minutes-remain").text(minutes);
		$(".seconds-remain").text(seconds);

		var secondPercentage = 100 - Math.floor((seconds / 60) * 100);
		var minutePercentage = 100 - Math.floor((minutes / 60) * 100);
		var hourPercentage = 100 - Math.floor((hours / 24) * 100);
		var dayPercentage = 100 - Math.floor((days / 60) * 100);

		if (typeof $('.days-remain-chart').data('easyPieChart') !== 'undefined') {
			$('.days-remain-chart').data('easyPieChart').update(dayPercentage);
			$('.hours-remain-chart').data('easyPieChart').update(hourPercentage);
			$('.minutes-remain-chart').data('easyPieChart').update(minutePercentage);
			$('.seconds-remain-chart').data('easyPieChart').update(secondPercentage);
		}
	}

	timer = setInterval(showRemaining, 1000);



	/** WHITELIST KYC FORM
	**/
	var processingGif = $('.loading-window');

	// Check if proceed to step 2
	$('.whitelist-form').on('click', '#continue-step-1', function () {

		// Safe to proceed
		if ($('#agreement1').is(':checked') && $('#agreement2').is(':checked')) {
			$('.warning-message').html("");
			$('#form-step-1').hide();
			$('#form-step-2').fadeIn();
		} else {
			$('.warning-message').html("<p class='alert alert-danger'>You must accept the conditions before proceeding. Check the checkboxes to continue.</p>");
		}

	});


	// Check if proceed to step 3
	$('.whitelist-form').on('click', '#continue-step-2', function () {

		window.onbeforeunload = function (evt) {
			$('.whitelist-form').show();
			processingGif.hide();

			var message = 'Your whitelist process has not finished yet, are you sure you want to leave?';
			if (typeof evt == 'undefined') {
				evt = window.event;
			}
			if (evt) {
				evt.returnValue = message;
			}

			return message;
		}

		// Show processing sign
		// processingGif.fadeIn();
		$('.whitelist-form').hide();

		var firstName = $('#inputFName').val(),
			lastName = $('#inputLName').val(),
			email = $('#inputEmail').val(),
			password = $('#inputPassword').val(),
			passwordCheck = $('#inputPasswordCheck').val(),
			nationality = $('#inputNationalityCheck option:selected').val(),
			country = $('#inputCountryCheck option:selected').val(),
			gender = $(".input-gender:checked").val(),
			yearOfBirth = $("#inputYearOfBirth option:selected").val(),
			monthOfBirth = $("#inputMonthOfBirth option:selected").val(),
			dayOfBirth = $("#inputDayOfBirth option:selected").val();
		console.log('##############################################');
		var errMsgs = [];

		if (typeof gender == 'undefined') {
			errMsgs.push("<p>You must select your gender.</p>");
		}

		if (yearOfBirth.length < 1 || monthOfBirth < 1 || dayOfBirth < 1) {
			errMsgs.push("<p>You must enter your full date of birth.</p>");
		} else if (yearOfBirth > 2000) {
			errMsgs.push("<p>You are not old enough to participate in this token sale.</p>");
		} else {
			dateOfBirth = dayOfBirth + '/' + monthOfBirth + '/' + yearOfBirth;
		}

		if (firstName.length < 2) {
			errMsgs.push("<p>You must enter a valid first name.</p>");
		}

		if (lastName.length < 2) {
			errMsgs.push("<p>You must enter a valid last name.</p>");
		}

		if (nationality.length < 1) {
			errMsgs.push("<p>You must select your nationality.</p>");
		}

		if (country.length < 1) {
			errMsgs.push("<p>You must select your Country of Residency.</p>");
		}

		if (!validateEmail(email)) {
			errMsgs.push("<p>You must enter a valid email address.</p>");
		}

		if (password.length < 7) {
			errMsgs.push("<p>Your password must be greater than 6 characters long.</p>");
		} else if (!/\d/.test(password)) {
			errMsgs.push("<p>Your password must contain at least one number/digit.</p>");
		}

		if (password != passwordCheck) {
			errMsgs.push("<p>The passwords you entered do not match.</p>");
		}

		if (!recaptchaEnabled) {
			errMsgs.push("<p>You must check the 'I'm not a Robot' captcha.</p>");
		}


		// This step had too many errors
		if (errMsgs.length > 0) {
			processingGif.hide();
			$('.whitelist-form').show();
			$("html, body").animate({ scrollTop: $('#scroll-to-warning-message').offset().top - 80 }, 1000);
			var errMsgFull = errMsgs.join(" ");
			$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
			return;
		} else {
			$('.warning-message').html("");
		}

		// Register user with our database
		$.post("/join-whitelist-step-1", {
			firstName: firstName,
			lastName: lastName,
			gender: gender,
			dateOfBirth: dateOfBirth,
			email: email,
			nationality: nationality,
			country: country,
			password: password,
			// ethAddress: ethAddress
		}, function (data) {
			console.log('333333333333333333333333333333333333');
			// Check all went ok
			if (data.status == 'success') {
				window.onbeforeunload = function (evt) {
					return null;
				}

				// Send sign up event to google analytics
				triggerSignupEvent();

				if (typeof js_track_id !== 'undefined' && js_track_id == 'ico-512') {
					window.location = "/contributor?ref=ico-512";
				} else {
					window.location = "/contributor";
				}
			} else if (data.status == 'cleared' || data.status == 'rejected') {
				window.location = "/login";
			} else {
				$('.whitelist-form').show();
				processingGif.hide();
				if (typeof data.errMsgs == 'undefined') {
					$('.warning-message').html("<div class='alert alert-danger'>There was a problem processing the request. Please try again. If the problem persists contact us on <a href=\"https://t.me/triforcetokens\">telegram</a>.</div>");
				} else {
					var errMsgFull = data.errMsgs.join(" ");
					$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
				}
				return;
			}

		}, "json");
	});




	/** Check if we need to show the KYC final step
	*/
	if ($('#kycProgress').val() == 'false') {
		$('#completeKycModal').modal({ show: true, backdrop: 'static' });
	}

	$('#completeKycModal').on('click', '#kyc-step-2', function () {
		$('#completeKycIntro').fadeOut('fast', function () {
			$('#kycDocumentUploadSection').fadeIn('fast');
		});
	});


	$('#completeKycModal').on('click', '#kyc-step-3', function () {
		var uploadDocument = $('#inputDocument').val(),
			uploadSelfie = $('#inputSelfie').val(),
			validateToken = $('#validateToken').val();

		var errMsgs = [];

		if (uploadDocument.length < 3) {
			errMsgs.push("<p>You must upload a valid passport, national ID card or drivers licence document ID image.</p>");
		}

		// This step had too many errors
		if (errMsgs.length > 0) {
			var errMsgFull = errMsgs.join(" ");
			$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
			return;
		} else {
			$('.warning-message').html("");
		}

		$('#kycDocumentUploadSection').fadeOut('fast', function () {
			$('#kycSelfieUploadSection').fadeIn('fast');
		});
	});

	$('#completeKycModal').on('click', '#kyc-complete', function () {
		processingGif.fadeIn();

		var uploadDocument = $('#inputDocument').val(),
			uploadSelfie = $('#inputSelfie').val(),
			validateToken = $('#validateToken').val();

		var errMsgs = [];

		if (uploadDocument.length < 3) {
			errMsgs.push("<p>You must upload a valid passport, national ID card or drivers licence document ID image.</p>");
		}

		if (uploadSelfie.length < 3) {
			errMsgs.push("<p>You must upload a valid image (selfie) of yourself.</p>");
		}

		// This step had too many errors
		if (errMsgs.length > 0) {
			processingGif.hide();
			var errMsgFull = errMsgs.join(" ");
			$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
			return;
		} else {
			$('.warning-message').html("");
		}


		var form = $('#finalKycForm');
		var formdata = false;
		if (window.FormData) {
			formdata = new FormData(form[0]);
		}


		var formAction = form.attr('action');
		$.ajax({
			url: '/join-whitelist-step-2',
			data: formdata ? formdata : form.serialize(),
			cache: false,
			contentType: false,
			processData: false,
			type: 'POST',
			success: function (data) {

				$('#kycSelfieUploadSection').fadeOut('fast');

				// Check all went ok
				if (data.status == 'success' || data.status == 'cleared') {

					campaignLive && $('.show-metamask').show('fast');
					$('.whitelist-status-pending').addClass("whitelist-status").removeClass("whitelist-status-pending").html("APPROVED <i class=\"fa fa-check green\"></i>");

					$('.warning-message').html("");
					processingGif.hide(function () {
						$('#kycSuccessSection').fadeIn('fast');
					});
				} else if (data.status == 'rejected') {

					$('.whitelist-status-pending').addClass("whitelist-status-rejected").removeClass("whitelist-status-pending").html("REJECTED <i class=\"fa fa-times\"></i>");

					$('.warning-message').html("");
					processingGif.hide(function () {
						$('#kycRejectedSection').fadeIn('fast');
					});
				} else if (data.status == 'pending') {
					$('.warning-message').html("");
					processingGif.hide(function () {
						$('#kycPendingSection').fadeIn('fast');
					});
				} else {
					processingGif.hide();
					$('#kycDocumentUploadSection').fadeIn('fast');

					if (typeof data.errMsgs == 'undefined') {
						$('.warning-message').html("<div class='alert alert-danger'>There was a problem processing the request. Please try again. If the problem persists contact us on <a href=\"https://t.me/triforcetokens\">telegram</a>.</div>");
					} else {
						var errMsgFull = data.errMsgs.join(" ");
						$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
					}
					return;
				}
			},
			error: function (data) {
				processingGif.hide('fast', function () {
					$('#kycDocumentUploadSection').fadeIn('fast');
				});

				if (typeof data.errMsgs !== 'undefined') {
					var errMsgFull = data.errMsgs.join(" ");
				} else {
					errMsgFull = "<p>There was a problem with the scanned images you uploaded. Please ensure they are smaller than 4MB in size and of good quality. If the issue persists, please contact us on telegram or the chat message box below.</p>";
				}
				$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
				return;
			}
		});
	});



	/** Smooth Scroll On Links */
	$('a[href*="#"]')
		// Remove links that don't actually link to anything
		.not('[href="#"]')
		.not('[href="#0"]')
		.not('[data-parent="#accordion"]')
		.not('[data-autoscroll="#ignore"]')
		.click(function (event) {

			// On-page links
			if (
				location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
				&&
				location.hostname == this.hostname
			) {
				// Figure out element to scroll to
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
				// Does a scroll target exist?
				if (target.length) {
					// Only prevent default if animation is actually gonna happen
					event.preventDefault();
					$('html, body').animate({
						scrollTop: target.offset().top
					}, 1000, function () {
						// Callback after animation
						// Must change focus!
						var $target = $(target);
						$target.focus();
						if ($target.is(":focus")) { // Checking if the target was focused
							return false;
						} else {
							$target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
							$target.focus(); // Set focus again
						};
					});
				}
			}
		});


	// Trigger Google Analytics Goal
	function triggerSignupEvent() {
		if (typeof ga !== 'undefined') {
			ga('send', 'event', 'website', 'signup', 'signup', '1');
		}
	};

	$('.trigger-cta-clicked-event').click(function () {
		ga('send', 'event', 'website', 'signup', 'clickbtn', '1');
	});


	function validateEmail(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email.toLowerCase());
	}

	function getCookie(name) {
		var dc = document.cookie;
		var prefix = name + "=";
		var begin = dc.indexOf("; " + prefix);
		var end = null;
		if (begin == -1) {
			begin = dc.indexOf(prefix);
			if (begin != 0) return null;
			end = document.cookie.indexOf(";", begin);
		} else {
			begin += 2;
			end = document.cookie.indexOf(";", begin);
			if (end == -1) {
				end = dc.length;
			}
		}

		return decodeURI(dc.substring(begin + prefix.length, end)).replace(/"/g, '');
	}


	// Live update supply remaining
	io.socket.on('ico/summary', getSummary);

	// logged-in user's transactions live update
	setTimeout(function () {
		contribute && tfSocket && tfSocket.listen(function (txn) {
			console.log('processing txn now');
			var parentEl = $('#r-msg-home'),
				msg = '<span style="font-size:small">A <a href="https://etherscan.io/tx/' + txn.transactionHash + '" target="_blank">new transaction has been received</a> from ' + txn.beneficiary + '. Please <a href="/contributor#nav-transactions">go to dashboard to view</a></span>';

			if (!parentEl.length) {
				parentEl = $('#r-msg'); // dashboard
				msg = '<span>A <a href="https://etherscan.io/tx/' + txn.transactionHash + '" target="_blank">new transaction has been received</a> from ' + txn.beneficiary + '. Please refresh your page to see in the dashboard</span>';
			}
			if (!parentEl.length) {
				alert('A new transaction has been received from ' + txn.beneficiary + '. Please go to dashboard to see transactions');
				return;
			}
			contribute.showMessage(msg, 'success', parentEl);
		});
	}, 1000);

	$.ajax({
		url: api_url + "ico/summary",
		type: "GET",
		success: getSummary,
		error: function (jqXHR, status, err) {
			console.log("Failed to get blockchain data summary from API server");
		}
	});

	function getSummary(data) {
		var ethRaised = data.ethRaised,
			forceDistributed = data.forceDistributed,
			bonusPercent = data.bonusPercent,
			totalContributors = data.totalContributors;

		web3Obj.icoAddress = data.icoAddress;

		var maxContributors = 25000,
			maxForceSold = 15000000,
			maxPercentDiscount = 25;

		var percentContributors = totalContributors / maxContributors * 100,
			percentForceSold = forceDistributed / maxForceSold * 100,
			percentDiscount = bonusPercent / maxPercentDiscount * 100;

		$('.total-contributors').text(parseInt(totalContributors).toLocaleString());
		$('.tokens-sold').text(parseInt(forceDistributed).toLocaleString());
		$('.discount-level').html(bonusPercent + '&percnt;');

		// $('.total-contributors-chart').data('easyPieChart').update(percentContributors);
		$('.tokens-sold-chart').data('easyPieChart').update(percentForceSold);
		$('.discount-level-chart').data('easyPieChart').update(percentDiscount);

		if (campaignLive) {
			$('.ico-address').text(window.isWlAdded ? data.icoAddress : 'Please wait! Your ether address is being added to whitelist ');
		}
	}


	// detect user login from localstorage and setup session
	var _token = localStorage.getItem('token'),
		tokenAttempt = localStorage.getItem('token_attempt');

	if (getUrlParameter('logout')) {
		localStorage.clear();
	} else if (_token) {

		if (!tokenAttempt || isNaN(tokenAttempt)) {
			tokenAttempt = 1;
		} else {
			tokenAttempt++;
		}

		localStorage.setItem('token_attempt', tokenAttempt);

		$.post("/token-login?token=" + _token).done(function () {
			if (tokenAttempt >= 6) {
				localStorage.clear();
			}

			if (typeof TOKEN === 'undefined') {
				location.reload();
			}
		}).fail(function (err) {
			if (typeof err === 'object' && err.status === 401) {
				localStorage.clear();
			}
		});
	}

});

var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

var web3Obj = {
	init: function () {
		if (typeof web3 === 'undefined') {
			$('.metamask-buy-btn').remove();
			$('.metamask-download-btn').show();
			web3Obj.metamaskAvailable = false;
		} else {
			web3Obj.metamaskAvailable = true;
		}
	},

	send: function () {
		if (!web3Obj.metamaskAvailable) {
			alert('Please download metamask to use this functionality');
			return;
		}

		if (!web3Obj.icoAddress) {
			alert('Could not get access to metamask. Please transfer manually');
			return;
		}

		var ethAmount = +$('#ether_amount').val();
		if (!ethAmount || ethAmount < 0.1) {
			alert('Please enter a valid value. Minimum contribution is 0.1 ETH');
			return;
		}


		try {
			web3.eth.sendTransaction({
				from: web3.eth.coinbase,
				to: web3Obj.icoAddress,
				gas: 300000,
				value: web3.toWei(ethAmount, 'ether')
			}, function (error, result) {
				if (!error) {
					// contribute.removeAllMessages();
					contribute.showMessage('Your transaction has been sent.<br>' +
						'<small><a href="https://etherscan.io/tx/' + result + '" target="_blank">Check transaction status here</a></small>',
						'success', '#mm-msg', 10000);
				} else {
					contribute.showMessage('Couldn\'t process your request. Make sure you got enough funds and click on "SUBMIT" on Metamask popup',
						'danger', '#mm-msg', 10000);
				}
			})
		} catch (er) {
			contribute.removeAllMessages();
			contribute.showMessage('Couldn\'t process your request.<br> Make sure Metamask is enabled and unlocked and then try again!',
				'danger', '#mm-msg', 10000);
		}

	},

	gotoMetamask: function () {
		window.open('https://metamask.io/', '_blank');
	}
};

(function ($) {

	'use strict';

	$(document).on('show.bs.tab', '.nav-tabs-responsive [data-toggle="tab"]', function (e) {
		var $target = $(e.target);
		var $tabs = $target.closest('.nav-tabs-responsive');
		var $current = $target.closest('li');
		var $parent = $current.closest('li.dropdown');
		$current = $parent.length > 0 ? $parent : $current;
		var $next = $current.next();
		var $prev = $current.prev();
		var updateDropdownMenu = function ($el, position) {
			$el
				.find('.dropdown-menu')
				.removeClass('pull-xs-left pull-xs-center pull-xs-right')
				.addClass('pull-xs-' + position);
		};

		$tabs.find('>li').removeClass('next prev');
		$prev.addClass('prev');
		$next.addClass('next');

		updateDropdownMenu($prev, 'left');
		updateDropdownMenu($current, 'center');
		updateDropdownMenu($next, 'right');
	});

})(jQuery);

$(document).ready(function () {
	$('#whitelist-my-address').on('click', function () {

		let walletAddress = $('#inputEthAddress').val();
		const errMsg = "<p>You must enter a valid sending Ethereum wallet address.</p>";
		if (walletAddress.length < 38) {
			$("html, body").animate({ scrollTop: $('#scroll-to-warning-message').offset().top - 80 }, 1000);
			$('.warning-message').html("<div class='alert alert-danger'>" + errMsg + "</div>");
			$('#whitelistForm #whitelist-my-address').removeClass('nextBtn');
			return;
		}

		$.post(API_URL + 'whitelist-address?walletAddress=' + walletAddress + '&token=' + TOKEN)
			.done(data => {
				console.log(data);
				$("html, body").animate({ scrollTop: $('#scroll-to-warning-message').offset().top - 80 }, 1000);
				$('.warning-message').html("<div class='alert alert-success'>" + data.msg + "</div>");
				$('#whitelistForm #whitelist-my-address').removeClass('nextBtn');
				$('#whitelistForm #whitelist-my-address').addClass('nextBtn');
				location.reload();
			})
			.fail(err => {
				$('#whitelistForm #whitelist-my-address').removeClass('nextBtn');
				$("html, body").animate({ scrollTop: $('#scroll-to-warning-message').offset().top - 80 }, 1000);
				$('.warning-message').html("<div class='alert alert-danger'>" + err.statusText + "</div>");
			}) 
	})
})

$(document).ready(function () {
	$(document).ready(function () {
		var navListItems = $('div.setup-panel div a'),
			allWells = $('.setup-content'),
			allNextBtn = $('.nextBtn');
		activeDiv = $('.setup-content.active');
		var currentActive = $('.setup-content.active');
		allWells.hide();
		activeDiv.show();

		navListItems.click(function (e) {
			e.preventDefault();
			var $target = $($(this).attr('href')),
				$item = $(this);

			if (!$item.hasClass('disabled')) {
				navListItems.removeClass('btn-primary').addClass('btn-default');
				$item.addClass('btn-primary');
				allWells.hide();
				$target.show();
				$target.find('input:eq(0)').focus();
			}
		});

		allNextBtn.click(function (e) {
			e.preventDefault();
			var curStep = $(this).closest(".setup-content"),
				curStepBtn = curStep.attr("id"),
				nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
				curInputs = curStep.find("input[type='text'],input[type='url']"),
				isValid = true;
			$('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().removeClass('active').addClass('complete');
			$('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().removeClass('disabled').addClass('active');
			$(".form-group").removeClass("has-error");
			for (var i = 0; i < curInputs.length; i++) {
				if (!curInputs[i].validity.valid) {
					isValid = false;
					$(curInputs[i]).closest(".form-group").addClass("has-error");
				}
			}

			if (isValid) {
				nextStepWizard.removeAttr('disabled').trigger('click');
				currentActive.addClass('complete');
				nextStepWizard.addClass('active');
				currentActive = nextStepWizard;
			}
		});

		$('div.setup-panel div a.btn-primary').trigger('click');

	});
})

$(document).ready(function () {
	$('#triggerMetamaskBuy').on('click', function () {
		$("#buyDirect").collapse('hide');
	});

	$('#triggerDirectBuy').on('click', function () {
		$("#buyWithMetamask").collapse('hide');
	})

})

$(document).ready(function () {
	$('#resubmit-kyc').on('click', function () {
		$(this).hide();
		$("#resubmit-kyc-partial").show();
	})
})

$(document).ready(function () {
	$('#resubmit-continue-step-2').on('click', function () {
		let firstName = $('#inputFName').val(),
			lastName = $('#inputLName').val(),
			nationality = $('#inputNationalityCheck option:selected').val(),
			country = $('#inputCountryCheck option:selected').val(),
			gender = $(".input-gender:checked").val(),
			yearOfBirth = $("#inputYearOfBirth option:selected").val(),
			monthOfBirth = $("#inputMonthOfBirth option:selected").val(),
			dayOfBirth = $("#inputDayOfBirth option:selected").val();

		var errMsgs = [];

		if (typeof gender == 'undefined') {
			errMsgs.push("<p>You must select your gender.</p>");
		}

		if (yearOfBirth.length < 1 || monthOfBirth < 1 || dayOfBirth < 1) {
			errMsgs.push("<p>You must enter your full date of birth.</p>");
		} else if (yearOfBirth > 2000) {
			errMsgs.push("<p>You are not old enough to participate in this token sale.</p>");
		} else {
			dateOfBirth = dayOfBirth + '/' + monthOfBirth + '/' + yearOfBirth;
		}

		if (firstName.length < 2) {
			errMsgs.push("<p>You must enter a valid first name.</p>");
		}

		if (lastName.length < 2) {
			errMsgs.push("<p>You must enter a valid last name.</p>");
		}

		if (nationality.length < 1) {
			errMsgs.push("<p>You must select your nationality.</p>");
		}

		if (country.length < 1) {
			errMsgs.push("<p>You must select your Country of Residency.</p>");
		}

		// This step had too many errors
		if (errMsgs.length > 0) {
			$("html, body").animate({ scrollTop: $('#scroll-to-warning-message').offset().top - 80 }, 1000);
			var errMsgFull = errMsgs.join(" ");
			$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
			return;
		} else {
			$('.warning-message').html("");
		}

		$.post('/resubmit-kyc', {
			firstName,
			lastName,
			nationality,
			country,
			gender,
			yearOfBirth,
			monthOfBirth,
			dayOfBirth
		}, function (data) {
			if (data.status === 'success') {
				location.reload();
			}
			if (data.status === 'error') {
				if (data.errMsgs) {
					$("html, body").animate({ scrollTop: $('#scroll-to-warning-message').offset().top - 80 }, 1000);
					var errMsgFull = errMsgs.join(" ");
					$('.warning-message').html("<div class='alert alert-danger'>" + errMsgFull + "</div>");
					return;
				} else {
					$('.warning-message').html("");
				}
			}
			;
		})

	})
})