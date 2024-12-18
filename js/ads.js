// ads.js

// Define dataLayer and the gtag function
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}

// Set default consent to 'denied' as a placeholder
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied'
});

// Load Google tag (gtag.js)
(function () {
  const script = document.createElement('script');
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-VLBY4JREBD";
  script.async = true;
  document.head.appendChild(script);

  script.onload = function () {
    gtag('js', new Date());
    gtag('config', 'G-VLBY4JREBD');
  };
})();

// Grant consent for ads-related storage
function consentGrantedAdStorage() {
  gtag('consent', 'update', {
    'ad_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted',
    'analytics_storage': 'granted'
  });
}

// Deny consent for ads-related storage
function consentDeniedAdStorage() {
  gtag('consent', 'update', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
  });
}
