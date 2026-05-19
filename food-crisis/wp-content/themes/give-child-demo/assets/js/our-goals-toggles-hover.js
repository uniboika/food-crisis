/**
 * Our Goals section (About Us): open toggles on hover instead of click.
 * Touch devices keep the default click behavior.
 */
(function ($) {
	'use strict';

	var WIDGET_SELECTOR = '.elementor-element-09205e7';
	var HOVER_CLASS = 'our-goals-toggles--hover';

	function canHover() {
		return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	}

	function initHoverToggles($widget) {
		if (!$widget.length || !canHover() || $widget.data('ourGoalsHover')) {
			return;
		}

		$widget.data('ourGoalsHover', true);
		$widget.addClass(HOVER_CLASS);

		var $list = $widget.find('.elementor-widget-cmsmasters-toggles__list');
		var $items = $widget.find('.elementor-widget-cmsmasters-toggles__item');

		function setOpen($openItem) {
			$items.each(function () {
				var $item = $(this);
				var $title = $item.find('.elementor-widget-cmsmasters-toggles__title').first();
				var $content = $item.find('.elementor-widget-cmsmasters-toggles__content').first();
				var isOpen = $openItem && $openItem[0] === $item[0];

				$title.toggleClass('active-toggle', isOpen);

				if (isOpen) {
					$content.stop(true, true).slideDown(200);
				} else {
					$content.stop(true, true).slideUp(200);
				}
			});
		}

		$list.off('.ourGoalsHover');
		$items.off('.ourGoalsHover');

		$items.on('mouseenter.ourGoalsHover', function () {
			setOpen($(this));
		});

		$list.on('mouseleave.ourGoalsHover', function () {
			setOpen(null);
		});

		$widget[0].addEventListener(
			'click',
			function (e) {
				if (e.target.closest('.elementor-widget-cmsmasters-toggles__title')) {
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			},
			true
		);

		// Run after the theme widget sets its default open state.
		setTimeout(function () {
			setOpen(null);
		}, 200);
	}

	function bindElementor() {
		if (typeof elementorFrontend === 'undefined') {
			return;
		}

		elementorFrontend.hooks.addAction(
			'frontend/element_ready/cmsmasters-toggles.default',
			function ($scope) {
				var $widget = $scope.hasClass('elementor-element-09205e7')
					? $scope
					: $scope.find(WIDGET_SELECTOR);
				initHoverToggles($widget);
			}
		);
	}

	$(function () {
		bindElementor();
		$(window).on('load', function () {
			initHoverToggles($(WIDGET_SELECTOR));
		});
	});
})(jQuery);
