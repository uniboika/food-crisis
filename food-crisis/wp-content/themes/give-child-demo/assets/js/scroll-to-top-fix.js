/**
 * Scroll-to-top for static pages where #cmsmasters-scroll-top anchor is missing
 * or CMSMasters scroll effects do not run.
 */
(function () {
	'use strict';

	document.addEventListener('click', function (event) {
		var link = event.target.closest('a[href="#cmsmasters-scroll-top"]');
		if (!link) {
			return;
		}

		event.preventDefault();

		var target = document.getElementById('cmsmasters-scroll-top');
		if (target) {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			return;
		}

		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
})();
