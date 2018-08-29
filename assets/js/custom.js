function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}
function deleteCookies() {   
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if(name != 'complianceCookie'){
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
}
function loadCookies() {
  gtag('js', new Date());
  gtag('config', 'UA-104636616-3');
  (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/ucmtxxel';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()
}

$(document).ready(function(){
  var dropCookie = true;
  var cookieDuration = 28; 
  var cookieName = 'complianceCookie';
  var cookieValue = 'off'; // dont set cookies untill user allows them
  var privacyMessage = "";

  // Check if user wants cookies disabled or not
  var complianceCookie = getCookie(cookieName);

  $('.cc-allow').click(function(){
    cookieValue = 'on';
    setCookie(cookieName,cookieValue,28);
    loadCookies();
    $('#cookie-notice').hide();
  });

  $('.cc-deny').click(function(){
    cookieValue = 'off';
    setCookie(cookieName,cookieValue,28);
    deleteCookies();
    $('#cookie-notice').hide();
  });

  // Cookie is set
  if(complianceCookie){
    $('#cookie-notice').hide();
    if(complianceCookie == 'off'){
    }else{
      loadCookies();
    }
  }else{
    $('#cookie-notice').show();
  }
});