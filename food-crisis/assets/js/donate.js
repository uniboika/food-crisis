(function () {
  'use strict';

  var API_BASE = window.DONATE_API_URL || 'https://server.brainstorm.ng/foodcrisis-backend/api/donations';
  if (window.location.protocol === 'file:' && !window.DONATE_API_URL) {
    API_BASE = 'https://server.brainstorm.ng/foodcrisis-backend/api/donations';
  }

  var MERCHANT_CODE = window.ISW_MERCHANT_CODE || 'MX250773';
  var PAY_ITEM_ID = window.ISW_PAY_ITEM_ID || 'Default_Payable_MX250773';
  var WEBPAY_URL = window.ISW_WEBPAY_URL || 'https://sandbox.interswitchng.com/collections/w/pay';
  var MODE = window.ISW_MODE || 'QA';

  if (window.opener && !window.opener.closed) {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('donation_ref');
    var resp = params.get('resp');
    if (ref) {
      if (resp === '00') {
        fetch(API_BASE + '/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentReference: ref }),
        }).catch(function () {});
      }
      var targetOrigin = window.location.origin;
      if (!targetOrigin || targetOrigin === 'null') {
        targetOrigin = '*';
      }
      window.opener.postMessage({
        type: 'DONATION_RESULT',
        donationRef: ref,
        resp: resp,
      }, targetOrigin);
    }
    window.close();
    return;
  }

  function showToast(isSuccess, ref, customMessage) {
    var toast = document.createElement('div');
    if (isSuccess) {
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;background:#2a7a2a;color:#fff;padding:20px 32px;border-radius:12px;font-size:16px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);text-align:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
      toast.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">&#10004;</div><strong>Thank You for Your Donation!</strong><br><span style="font-size:14px;opacity:0.9;">Reference: ' + ref + '</span><br><span style="font-size:13px;opacity:0.8;">A receipt will be sent to your email if provided.</span>';
    } else {
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;background:#c0392b;color:#fff;padding:20px 32px;border-radius:12px;font-size:16px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);text-align:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
      toast.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">&#10008;</div><strong>Payment was not completed.</strong><br><span style="font-size:14px;opacity:0.9;">' + (customMessage || 'Please try again or contact support.') + '</span>';
    }
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 10000);
  }

  function loadScript(url, callback) {
    if (window.webpayCheckout) {
      callback();
      return;
    }
    var existingScript = document.querySelector('script[src="' + url + '"]');
    if (existingScript) {
      existingScript.onload = callback;
      return;
    }
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    script.onerror = function () {
      alert('Failed to load payment checkout SDK. Please check your connection.');
      if (modalContent) {
        modalContent.querySelector('.donate-step-info').style.display = 'block';
        modalContent.querySelector('.donate-loading').style.display = 'none';
      }
    };
    document.body.appendChild(script);
  }

  window.addEventListener('message', function (event) {
    if (window.location.origin !== 'null' && event.origin !== window.location.origin) {
      return;
    }
    if (!event.data || event.data.type !== 'DONATION_RESULT') return;
    if (event.data.resp === '00') {
      showToast(true, event.data.donationRef);
    } else if (event.data.resp && event.data.resp !== '00') {
      showToast(false, event.data.donationRef);
    }
  });

  var modalOverlay = null;
  var modalContent = null;
  function createModal() {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'donate-modal-overlay';

    modalContent = document.createElement('div');
    modalContent.className = 'donate-modal';

    modalContent.innerHTML =
      '<div class="donate-modal-header">' +
        '<h2>Make a Donation</h2>' +
        '<button class="donate-modal-close">&times;</button>' +
      '</div>' +
      '<div class="donate-modal-body">' +
        '<div class="donate-step-amount">' +
          '<label>Select Amount (NGN)</label>' +
          '<div class="donate-amount-presets">' +
            '<button data-amount="5000">&#8358;5,000</button>' +
            '<button data-amount="10000">&#8358;10,000</button>' +
            '<button data-amount="25000">&#8358;25,000</button>' +
            '<button data-amount="50000">&#8358;50,000</button>' +
            '<button data-amount="100000">&#8358;100,000</button>' +
            '<button data-amount="custom">Custom</button>' +
          '</div>' +
          '<div class="donate-custom-amount" style="display:none">' +
            '<input type="number" id="donate-custom-input" min="100" placeholder="Enter amount in NGN" />' +
          '</div>' +
          '<div class="donate-selected-amount" style="display:none"></div>' +
        '</div>' +
        '<div class="donate-step-info" style="display:none">' +
          '<label>Your Name (optional)</label>' +
          '<input type="text" id="donor-name" placeholder="Full Name" />' +
          '<label>Email Address (optional)</label>' +
          '<input type="email" id="donor-email" placeholder="email@example.com" />' +
          '<button class="donate-submit-btn">Continue to Payment</button>' +
        '</div>' +
        '<div class="donate-loading" style="display:none">' +
          '<div class="donate-spinner"></div>' +
          '<p>Redirecting to payment gateway...</p>' +
        '</div>' +
      '</div>' +
      '<div class="donate-modal-footer">' +
        '<p>Secured by Interswitch. Your information is safe.</p>' +
      '</div>';

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    modalContent.querySelector('.donate-modal-close').addEventListener('click', closeModal);

    var presetButtons = modalContent.querySelectorAll('.donate-amount-presets button');
    presetButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var amount = this.getAttribute('data-amount');
        if (amount === 'custom') {
          modalContent.querySelector('.donate-custom-amount').style.display = 'block';
          modalContent.querySelector('.donate-selected-amount').style.display = 'none';
          modalContent.querySelectorAll('.donate-amount-presets button').forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
        } else {
          selectAmount(parseInt(amount));
        }
      });
    });

    var customInput = modalContent.querySelector('#donate-custom-input');
    customInput.addEventListener('input', function () {
      var val = parseInt(this.value);
      if (val >= 100) {
        selectAmount(val);
      }
    });

    modalContent.querySelector('.donate-submit-btn').addEventListener('click', submitDonation);
  }

  function selectAmount(amount) {
    modalContent.querySelector('.donate-custom-amount').style.display = 'none';
    modalContent.querySelector('.donate-selected-amount').style.display = 'block';
    modalContent.querySelector('.donate-selected-amount').innerHTML =
      'Amount: <strong>&#8358;' + amount.toLocaleString() + '</strong>';
    modalContent.querySelector('.donate-step-amount').dataset.selected = amount;

    modalContent.querySelectorAll('.donate-amount-presets button').forEach(function (b) { b.classList.remove('active'); });
    var matched = Array.from(modalContent.querySelectorAll('.donate-amount-presets button')).find(function (b) {
      return parseInt(b.getAttribute('data-amount')) === amount;
    });
    if (matched) matched.classList.add('active');

    modalContent.querySelector('.donate-step-amount').style.display = 'none';
    modalContent.querySelector('.donate-step-info').style.display = 'block';
  }

  function getSelectedAmount() {
    return parseInt(modalContent.querySelector('.donate-step-amount').dataset.selected);
  }

  function getCampaign() {
    return modalContent.dataset.campaign || 'general';
  }

  function submitDonation() {
    var amount = getSelectedAmount();
    if (!amount || isNaN(amount) || amount < 100) {
      alert('Minimum donation amount is ₦100. Please enter or select an amount of ₦100 or more.');
      return;
    }

    var donorName = modalContent.querySelector('#donor-name').value.trim();
    var donorEmail = modalContent.querySelector('#donor-email').value.trim();

    if (donorEmail && !donorEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    modalContent.querySelector('.donate-step-info').style.display = 'none';
    modalContent.querySelector('.donate-loading').style.display = 'block';

    var popup = window.open('', 'InterswitchPayment',
      'width=800,height=650,scrollbars=yes,resizable=yes');
    if (!popup) {
      alert('Popup was blocked. Please allow popups for this site and try again.');
      closeModal();
      return;
    }

    popup.document.write('<!DOCTYPE html><html><head><title>Initiating Payment...</title>' +
      '<style>body{font-family:-apple-system,sans-serif;text-align:center;padding-top:80px;margin:0;background:#f5f5f5;}' +
      '.spinner{border:4px solid #e0e0e0;border-top:4px solid #3753a4;border-radius:50%;width:48px;height:48px;' +
      'animation:spin .8s linear infinite;margin:0 auto 20px;}' +
      '@keyframes spin{to{transform:rotate(360deg)}}</style></head><body>' +
      '<div style="background:#fff;border-radius:12px;max-width:380px;margin:0 auto;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
      '<div class="spinner"></div><p style="font-size:16px;color:#555;margin:0;">Initiating payment...</p></div></body></html>');
    popup.document.close();

    var campaign = getCampaign();

    fetch(API_BASE + '/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        donor_name: donorName || null,
        donor_email: donorEmail || null,
        campaign: campaign,
      }),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.success) {
        if (!popup.closed) popup.close();
        alert(data.message || 'Failed to initiate donation');
        closeModal();
        return;
      }

      closeModal();

      var redirectUrl = window.location.href.split('?')[0] +
        '?donation_ref=' + data.paymentReference;

      var formHtml = '<form id="iswForm" method="post" action="' + data.webpayUrl + '">' +
        '<input type="hidden" name="merchant_code" value="' + (data.merchantCode || MERCHANT_CODE) + '">' +
        '<input type="hidden" name="pay_item_id" value="' + (data.payItemId || PAY_ITEM_ID) + '">' +
        '<input type="hidden" name="txn_ref" value="' + data.paymentReference + '">' +
        '<input type="hidden" name="amount" value="' + Math.round(data.amount * 100) + '">' +
        '<input type="hidden" name="currency" value="566">' +
        '<input type="hidden" name="site_redirect_url" value="' + redirectUrl + '">' +
        '<input type="hidden" name="cust_name" value="' + (donorName || 'Anonymous Donor') + '">' +
        '<input type="hidden" name="cust_email" value="' + (donorEmail || '') + '">' +
        '<input type="hidden" name="pay_method" value="both">' +
        '<input type="hidden" name="mode" value="' + (data.mode || MODE) + '">' +
        '</form>';

      popup.document.clear();
      popup.document.write('<!DOCTYPE html><html><head><title>Redirecting to Payment Gateway...</title></head><body>' +
        formHtml +
        '<p style="text-align:center;font-family:sans-serif;padding-top:40px;">Redirecting to payment gateway...</p>' +
        '<script>document.getElementById("iswForm").submit();</scr' + 'ipt>' +
        '</body></html>');
      popup.document.close();
    })
    .catch(function (err) {
      if (popup && !popup.closed) popup.close();
      console.error('Donation initiation failed:', err);
      alert('Failed to initiate donation. Please try again.');
      closeModal();
    });
  }

  function openModal(campaignSlug) {
    if (!modalOverlay) createModal();
    modalContent.dataset.campaign = campaignSlug || 'general';
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    modalContent.querySelector('.donate-step-amount').style.display = 'block';
    modalContent.querySelector('.donate-step-info').style.display = 'none';
    modalContent.querySelector('.donate-loading').style.display = 'none';
    modalContent.querySelector('.donate-selected-amount').style.display = 'none';
    modalContent.querySelector('.donate-custom-amount').style.display = 'none';
    modalContent.querySelector('#donor-name').value = '';
    modalContent.querySelector('#donor-email').value = '';
    modalContent.querySelectorAll('.donate-amount-presets button').forEach(function (b) { b.classList.remove('active'); });
    delete modalContent.querySelector('.donate-step-amount').dataset.selected;
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  window.DonateWidget = {
    open: openModal,
    close: closeModal,
  };

  var style = document.createElement('style');
  style.textContent =
    '.donate-modal-overlay {' +
      'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;' +
      'background: rgba(0,0,0,0.6); z-index: 999999; justify-content: center; align-items: center;' +
    '}' +
    '.donate-modal {' +
      'background: #fff; border-radius: 12px; max-width: 480px; width: 90%; max-height: 90vh; overflow-y: auto;' +
      'box-shadow: 0 20px 60px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;' +
    '}' +
    '.donate-modal-header {' +
      'display: flex; justify-content: space-between; align-items: center;' +
      'padding: 20px 24px 0; border-bottom: 1px solid #eee;' +
    '}' +
    '.donate-modal-header h2 { margin: 0 0 16px; font-size: 22px; color: #333; }' +
    '.donate-modal-close {' +
      'background: none; border: none; font-size: 28px; cursor: pointer; color: #999; padding: 0 0 16px; line-height: 1;' +
    '}' +
    '.donate-modal-close:hover { color: #333; }' +
    '.donate-modal-body { padding: 24px; }' +
    '.donate-modal-body label { display: block; font-size: 14px; font-weight: 600; color: #555; margin-bottom: 6px; }' +
    '.donate-modal-body input[type="text"], .donate-modal-body input[type="email"], .donate-modal-body input[type="number"] {' +
      'width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px;' +
      'margin-bottom: 16px; box-sizing: border-box; outline: none;' +
    '}' +
    '.donate-modal-body input:focus { border-color: #3753a4; }' +
    '.donate-amount-presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }' +
    '.donate-amount-presets button {' +
      'padding: 14px; border: 2px solid #e0e0e0; border-radius: 10px; background: #fafafa;' +
      'font-size: 16px; font-weight: 600; color: #333; cursor: pointer; transition: all 0.2s;' +
    '}' +
    '.donate-amount-presets button:hover { border-color: #3753a4; background: #f0f2ff; }' +
    '.donate-amount-presets button.active { border-color: #3753a4; background: #3753a4; color: #fff; }' +
    '.donate-custom-amount { margin-bottom: 16px; }' +
    '.donate-selected-amount { padding: 14px; background: #f0f8f0; border-radius: 10px; margin-bottom: 16px; font-size: 16px; }' +
    '.donate-submit-btn {' +
      'width: 100%; padding: 14px; background: #3753a4; color: #fff; border: none; border-radius: 10px;' +
      'font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 8px;' +
    '}' +
    '.donate-submit-btn:hover { background: #2a3f7a; }' +
    '.donate-loading { text-align: center; padding: 40px 0; }' +
    '.donate-spinner {' +
      'width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top: 4px solid #3753a4;' +
      'border-radius: 50%; animation: donate-spin 0.8s linear infinite; margin: 0 auto 16px;' +
    '}' +
    '@keyframes donate-spin { to { transform: rotate(360deg); } }' +
    '.donate-modal-footer { padding: 12px 24px 20px; text-align: center; font-size: 12px; color: #999; }' +
    '.donate-btn {' +
      'display: inline-block; padding: 14px 32px; background: #3753a4; color: #fff !important;' +
      'border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;' +
      'text-decoration: none !important; transition: background 0.2s;' +
    '}' +
    '.donate-btn:hover { background: #2a3f7a; }' +
    '.donate-float-btn {' +
      'position: fixed; bottom: 24px; right: 24px; z-index: 99999;' +
      'background: #3753a4; color: #fff; border: none; border-radius: 50px;' +
      'padding: 16px 28px; font-size: 15px; font-weight: 700; cursor: pointer;' +
      'box-shadow: 0 4px 20px rgba(55,83,164,0.4); transition: all 0.2s;' +
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;' +
    '}' +
    '.donate-float-btn:hover { background: #2a3f7a; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(55,83,164,0.5); }';

  document.head.appendChild(style);

  var floatBtn = document.createElement('button');
  floatBtn.className = 'donate-float-btn';
  floatBtn.textContent = 'Donate Now';
  floatBtn.onclick = function () { DonateWidget.open('general'); };
  document.body.appendChild(floatBtn);

  setTimeout(function () {
    document.querySelectorAll('a[href*="donate-now"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var campaign = link.getAttribute('data-campaign') || 'general';
        DonateWidget.open(campaign);
      });
    });
    document.querySelectorAll('[data-donate]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        DonateWidget.open(el.getAttribute('data-campaign') || 'general');
      });
    });
  }, 500);

  var urlParams = new URLSearchParams(window.location.search);
  var donationRef = urlParams.get('donation_ref');
  var resp = urlParams.get('resp');

  if (donationRef) {
    if (resp === '00') {
      fetch(API_BASE + '/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentReference: donationRef }),
      }).then(function () {}).catch(function () {});

      var toast = document.createElement('div');
      toast.style.cssText =
        'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;' +
        'background:#2a7a2a;color:#fff;padding:20px 32px;border-radius:12px;' +
        'font-size:16px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);text-align:center;' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
      toast.innerHTML =
        '<div style="font-size:32px;margin-bottom:8px;">&#10004;</div>' +
        '<strong>Thank You for Your Donation!</strong><br>' +
        '<span style="font-size:14px;opacity:0.9;">Reference: ' + donationRef + '</span>' +
        '<br><span style="font-size:13px;opacity:0.8;">A receipt will be sent to your email if provided.</span>';
      document.body.appendChild(toast);
      setTimeout(function () { toast.remove(); }, 10000);

      if (window.history && window.history.replaceState) {
        var cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } else if (resp && resp !== '00') {
      var toast = document.createElement('div');
      toast.style.cssText =
        'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;' +
        'background:#c0392b;color:#fff;padding:20px 32px;border-radius:12px;' +
        'font-size:16px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);text-align:center;' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
      toast.innerHTML =
        '<div style="font-size:32px;margin-bottom:8px;">&#10008;</div>' +
        '<strong>Payment was not completed.</strong><br>' +
        '<span style="font-size:14px;opacity:0.9;">Please try again or contact support.</span>';
      document.body.appendChild(toast);
      setTimeout(function () { toast.remove(); }, 10000);
    }
  }
})();
