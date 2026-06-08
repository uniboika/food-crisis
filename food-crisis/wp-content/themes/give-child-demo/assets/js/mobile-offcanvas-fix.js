/**
 * Mobile offcanvas fallback for header templates where CMSMasters does not init.
 */
(function () {
	'use strict';

	var FALLBACK_CONFIGS = [
		{
			root: '.elementor-87',
			contentSelector: '.cmsmasters-offcanvas-content-4155cbe5',
			openHtmlClass: 'cmsmasters-offcanvas-content-open-4155cbe5',
			forceFallback: true
		},
		{
			root: '.elementor-150',
			contentSelector: '.cmsmasters-offcanvas-content-2e988dd6',
			openHtmlClass: 'cmsmasters-offcanvas-content-open-2e988dd6',
			forceFallback: true
		},
		{
			root: '.elementor-104',
			contentSelector: '.cmsmasters-offcanvas-content-1be1052a',
			openHtmlClass: 'cmsmasters-offcanvas-content-open-1be1052a',
			forceFallback: false
		}
	];

	function removeBrokenGiveNotice() {
		Array.prototype.forEach.call(
			document.querySelectorAll('#give_error_warning, .elementor-element-447ee346'),
			function (node) {
				node.remove();
			}
		);
	}

	function cmsmastersInitialized(widget) {
		return typeof jQuery !== 'undefined' && !!jQuery(widget).data('cmsmasters-offcanvas');
	}

	function setOpen(widget, open, config) {
		var content = widget.querySelector(config.contentSelector) ||
			widget.querySelector('.elementor-widget-cmsmasters-offcanvas__content');
		var overlay = widget.querySelector('.elementor-widget-cmsmasters-offcanvas__container__overlay');
		var trigger = widget.querySelector('.elementor-widget-cmsmasters-offcanvas__trigger');

		if (!content || !trigger) {
			return;
		}

		content.classList.toggle('active', open);
		if (overlay) {
			overlay.classList.toggle('active', open);
		}
		trigger.classList.toggle('trigger-active', open);
		document.documentElement.classList.toggle('cmsmasters-offcanvas-content-open', open);
		document.documentElement.classList.toggle('cmsmasters-offcanvas-content-left', open);
		if (config.openHtmlClass) {
			document.documentElement.classList.toggle(config.openHtmlClass, open);
		}

		if (open) {
			content.style.setProperty('left', '0', 'important');
			content.style.setProperty('right', 'auto', 'important');
		} else {
			content.style.removeProperty('left');
			content.style.removeProperty('right');
		}
	}

	function bindSubmenus(widget) {
		Array.prototype.forEach.call(
			widget.querySelectorAll('.menu-item-has-children > a[aria-label="Menu item"]:not([href])'),
			function (link) {
				link.addEventListener('click', function (event) {
					event.preventDefault();
					link.parentElement.classList.toggle('cmsmasters-active');
				});
			}
		);

		Array.prototype.forEach.call(
			widget.querySelectorAll('.elementor-widget-cmsmasters-nav-menu__arrow'),
			function (arrow) {
				arrow.addEventListener('click', function (event) {
					event.preventDefault();
					event.stopPropagation();
					var item = arrow.closest('.menu-item-has-children');
					if (item) {
						item.classList.toggle('cmsmasters-active');
					}
				});
			}
		);
	}

	function initWidget(widget, config) {
		if (!widget || widget.dataset.sdhdiOffcanvasInit) {
			return;
		}

		if (!config.forceFallback && cmsmastersInitialized(widget)) {
			return;
		}

		widget.dataset.sdhdiOffcanvasInit = '1';

		var trigger = widget.querySelector('.elementor-widget-cmsmasters-offcanvas__trigger');
		var closeBtn = widget.querySelector('.elementor-widget-cmsmasters-offcanvas__close');
		var overlay = widget.querySelector('.elementor-widget-cmsmasters-offcanvas__container__overlay');
		var content = widget.querySelector(config.contentSelector) ||
			widget.querySelector('.elementor-widget-cmsmasters-offcanvas__content');

		if (!trigger || !content) {
			return;
		}

		trigger.addEventListener('click', function (event) {
			event.preventDefault();
			setOpen(widget, !content.classList.contains('active'), config);
		});

		if (closeBtn) {
			closeBtn.addEventListener('click', function (event) {
				event.preventDefault();
				setOpen(widget, false, config);
			});
		}

		if (overlay) {
			overlay.addEventListener('click', function () {
				setOpen(widget, false, config);
			});
		}

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && content.classList.contains('active')) {
				setOpen(widget, false, config);
			}
		});

		bindSubmenus(widget);
	}

	function initConfig(config) {
		Array.prototype.forEach.call(document.querySelectorAll(config.root + ' .elementor-widget-cmsmasters-offcanvas'), function (widget) {
			initWidget(widget, config);
		});
	}

	function init() {
		removeBrokenGiveNotice();
		FALLBACK_CONFIGS.forEach(initConfig);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
