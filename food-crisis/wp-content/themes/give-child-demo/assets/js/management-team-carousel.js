/**
 * About Us — Management Team carousel (Swiper).
 */
(function () {
	'use strict';

	var ROOT_SELECTOR = '.elementor-element-11b8e37';
	var SWIPER_SRC =
		'https://give.cmsmasters.studio/food-crisis/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js?ver=8.4.5';

	function loadSwiper(callback) {
		if (typeof Swiper !== 'undefined') {
			callback();
			return;
		}

		var existing = document.getElementById('swiper-js');
		if (existing) {
			existing.addEventListener('load', callback);
			return;
		}

		var script = document.createElement('script');
		script.id = 'swiper-js';
		script.src = SWIPER_SRC;
		script.onload = callback;
		document.body.appendChild(script);
	}

	function buildCarousel(root) {
		var wrap = root.querySelector('.cmsmasters-blog__posts-wrap');
		var posts = root.querySelector('.cmsmasters-blog__posts');

		if (!wrap || !posts || wrap.classList.contains('sdhdi-team-carousel--ready')) {
			return null;
		}

		var articles = Array.prototype.slice.call(posts.querySelectorAll(':scope > article'));
		if (!articles.length) {
			return null;
		}

		posts.innerHTML = '';
		posts.classList.add('swiper-wrapper');

		articles.forEach(function (article) {
			var slide = document.createElement('div');
			slide.className = 'swiper-slide';
			slide.appendChild(article);
			posts.appendChild(slide);
		});

		var swiperEl = document.createElement('div');
		swiperEl.className = 'swiper management-team-swiper';
		wrap.insertBefore(swiperEl, posts);
		swiperEl.appendChild(posts);

		var prevBtn = document.createElement('button');
		prevBtn.type = 'button';
		prevBtn.className = 'management-team-nav management-team-nav--prev';
		prevBtn.setAttribute('aria-label', 'Previous team member');
		prevBtn.innerHTML = '<i aria-hidden="true" class="fas fa-chevron-left"></i>';

		var nextBtn = document.createElement('button');
		nextBtn.type = 'button';
		nextBtn.className = 'management-team-nav management-team-nav--next';
		nextBtn.setAttribute('aria-label', 'Next team member');
		nextBtn.innerHTML = '<i aria-hidden="true" class="fas fa-chevron-right"></i>';

		var pagination = document.createElement('div');
		pagination.className = 'swiper-pagination management-team-pagination';

		var track = document.createElement('div');
		track.className = 'management-team-track';

		wrap.appendChild(track);
		track.appendChild(prevBtn);
		track.appendChild(swiperEl);
		track.appendChild(nextBtn);
		wrap.appendChild(pagination);
		wrap.classList.add('sdhdi-team-carousel', 'sdhdi-team-carousel--ready');

		return {
			swiperEl: swiperEl,
			prevBtn: prevBtn,
			nextBtn: nextBtn,
			pagination: pagination,
		};
	}

	function clearSwiperHeights(swiper) {
		swiper.el.style.height = '';
		swiper.wrapperEl.style.height = '';
	}

	function initSwiper(parts) {
		var swiper = new Swiper(parts.swiperEl, {
			slidesPerView: 3,
			spaceBetween: 40,
			loop: false,
			speed: 450,
			watchOverflow: true,
			observer: true,
			observeParents: true,
			pagination: {
				el: parts.pagination,
				clickable: true,
			},
			navigation: {
				nextEl: parts.nextBtn,
				prevEl: parts.prevBtn,
			},
			breakpoints: {
				0: {
					slidesPerView: 1.25,
					spaceBetween: 24,
				},
				480: {
					slidesPerView: 2,
					spaceBetween: 30,
				},
				768: {
					slidesPerView: 3,
					spaceBetween: 40,
				},
			},
			on: {
				init: function () {
					clearSwiperHeights(this);
				},
				slideChangeTransitionEnd: function () {
					clearSwiperHeights(this);
				},
				resize: function () {
					clearSwiperHeights(this);
				},
			},
		});

		Array.prototype.forEach.call(parts.swiperEl.querySelectorAll('img'), function (img) {
			if (img.complete) {
				return;
			}
			img.addEventListener('load', function () {
				clearSwiperHeights(swiper);
			});
		});

		window.requestAnimationFrame(function () {
			clearSwiperHeights(swiper);
		});
	}

	function init() {
		var root = document.querySelector(ROOT_SELECTOR);
		if (!root) {
			return;
		}

		var parts = buildCarousel(root);
		if (!parts) {
			return;
		}

		loadSwiper(function () {
			initSwiper(parts);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
