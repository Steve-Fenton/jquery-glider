var resizeTimer;
$window = $(window);
$window.on('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        $window.trigger('resizeDone');
    }, 100);
});

// DONE
// Height based on tallest slide
// Resize and re-position on resize
// LTR and RTL direction support
// next, back, goto
// controls < >
// control position (top middle bottom)
// autoplay, stop on interaction

// TODO:
// animate slide contents
// events... onslide etc
// thumbnail control

(function ($) {
	function Glider($this, settings) {

		this.nextIcon = '&gt;';
		this.backIcon = '&lt;';

		this.direction = $this.attr('dir') || 'ltr';

		this.container = $this.addClass('glider glider-' + this.direction + ' ' + settings.animation);
		this.list = $(settings.list, $this).first().addClass('glider-list');
		this.items = $(settings.item, this.list).addClass('glider-item');

		this.currentSlide = 0;
		this.autoplay = $this[0].hasAttribute('data-glider-autoplay');
		this.controls = $this[0].hasAttribute('data-glider-controls');
		this.controlLocation = $this.attr('data-glider-controls') || 'glider-bottom';
		this.interval = null;

		var _this = this;
		_this.resize();
		$window.on('resizeDone', function () { _this.resize() });

		// controls
		if (this.controls) {
			$this.append(this.getBackControl(this.controlLocation, this.backIcon));
			$this.append(this.getNextControl(this.controlLocation, this.nextIcon));
		}

		// autoplay
		if (this.autoplay) {
			this.interval = window.setInterval(function () {
				_this.next();
			}, 5000);
		}
		
		// TODO: should be triggered by controls if controls are enabled
		// _this.container.click(function () { _this.next(); });
	}

	Glider.prototype = {
		constructor: Glider,
		positionSlider: function() {
			var parentWidth = this.container.width();

			if (this.direction === 'ltr') {
				this.list.css({'left': '-' + (parentWidth * this.currentSlide) + 'px'});
			} else {
				this.list.css({'right': '-' + (parentWidth * this.currentSlide) + 'px'});
			}
		},
		resize: function() {
			var parentWidth = this.container.width();

			this.list.css({ width: (parentWidth * this.items.length) + 'px' });
			this.items.css({ width: parentWidth + 'px' });

			this.positionSlider();
		},
		next: function() {
			this.currentSlide++;

			if (this.currentSlide >= this.items.length) {
				this.currentSlide = 0;
			}

			this.positionSlider();
			return false;
		},
		back: function() {
			this.currentSlide--;

			if (this.currentSlide < 0) {
				this.currentSlide = this.items.length - 1;
			}

			this.positionSlider();
			return false;
		},
		goto: function(index) {
			this.currentSlide = index;

			if (this.currentSlide >= this.items.length) {
				this.currentSlide = 0;
			}

			if (this.currentSlide < 0) {
				this.currentSlide = this.items.length -1;
			}

			this.positionSlider();
			return false;
		},
		getBackControl: function (location, text) {
			var _this = this;
			return $('<div>')
				.addClass('glider-control-back')
				.addClass(location)
				.click(function () { window.clearInterval(_this.interval); _this.back(); })
				.html(text);
		},
		getNextControl: function (location, text) {
			var _this = this;
			return $('<div>')
				.addClass('glider-control-next')
				.addClass(location)
				.click(function () { window.clearInterval(_this.interval); _this.next(); })
				.html(text);
		},
		getLinkControl: function (location, textFunction) {
			var _this = this;
			var linkControl = $('<ul>')
				.addClass('glider-control-link')
				.addClass(location);
			
			var getListItem = function(idx) {
				return $('<li>')
					.click(function () { window.clearInterval(_this.interval); _this.goto(idx); })
					.html(textFunction(idx));
			}

			for (var i = 0; i < this.items.length; i++) {
				linkControl.append(getListItem(i));
			}

			return linkControl;
		}
	};

	$.fn.glider = function (options) {
		var settings = $.extend({
			list: 'ul',
			item: 'li',
			animation: 'ease'
		}, options);

		var gliders = [];

		this.each(function () {
			gliders.push(new Glider($(this), settings));
		});

		return gliders;
	};
}(jQuery));