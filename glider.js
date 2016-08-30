// TODO:
// animate slide contents (i.e. contents appear after slide)
// events... onslide etc
// thumbnail control

(function ($) {
	var resizeTimer;
	$window = $(window);
	$window.on('resize', function () {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			$window.trigger('gliderResizeDone');
		}, 100);
	});
	
	var idIndex = 0;

	function Glider($this, settings) {

		this.id = 'glider-' + idIndex++;
		this.nextIcon = '&gt;';
		this.backIcon = '&lt;';
		this.linkFunction = function(idx) {
			return '<span class="glider-circle-icon">&nbsp;</span>';
		};

		this.direction = $this.attr('dir') || 'ltr';

		this.container = $this.attr('data-glider-id', this.id).addClass('glider glider-' + this.direction + ' ' + settings.animation);
		this.list = $(settings.list, $this).first().addClass('glider-list');
		this.items = $(settings.item, this.list).addClass('glider-item');
		
		this.currentSlide = 0;

		// Boolean attributes
		this.multiple = $this[0].hasAttribute('data-glider-multiple');
		this.autoplay = $this[0].hasAttribute('data-glider-autoplay');
		this.controls = $this[0].hasAttribute('data-glider-controls');
		this.links = $this[0].hasAttribute('data-glider-links');

		// Place controls at the bottom by default, or use the attribute
		this.controlLocation = $this.attr('data-glider-controls') || 'glider-bottom';

		// Place links at the bottom by default, or use the attribute
		this.linkLocation = $this.attr('data-glider-links') || 'glider-bottom';

		// Show one slide by default, or use the attribute
		this.fixedSlideWidth = "100%";
		this.slidesToShow = 1;

		var multipleAttribute = $this.attr('data-glider-multiple') || '1';

		if (multipleAttribute.indexOf('%') > -1 || multipleAttribute.indexOf('px') > -1) {
			this.fixedSlideWidth = multipleAttribute;
		} else {
			var multipleValue = parseInt(multipleAttribute, 10);
			this.slidesToShow = (isNaN(multipleValue)) ? 1 : multipleValue;
		}

		this.interval = null;
		this.classTimer = null;

		var _this = this;

		if (this.controls) {
			$this.append(this.getBackControl(this.controlLocation, this.backIcon));
			$this.append(this.getNextControl(this.controlLocation, this.nextIcon));
		}

		if (this.links) {
			$this.append($('<div>').append(this.getLinkControl(this.linkLocation, this.linkFunction)));
		}

		if (this.autoplay) {
			this.interval = window.setInterval(function () {
				_this.next();
			}, 5000);
		}

		_this.goto(0);
		_this.resize();
		$window.on('gliderResizeDone', function () { _this.resize() });
	}

	Glider.prototype = {
		constructor: Glider,
		getSlideWidth: function () {
			var parentWidth = this.container.width();

			// Take into account the number of slides
			var slideWidth = parentWidth / this.slidesToShow;

			if (this.fixedSlideWidth !== '100%') {
				
				if (this.fixedSlideWidth.indexOf('%') > -1) {
					slideWidth = (parentWidth / 100) * parseInt(this.fixedSlideWidth);
				} else {
					slideWidth = parseInt(this.fixedSlideWidth.replace('px', ''));
				}

				slideWidth = Math.floor(slideWidth);
			}

			return slideWidth;
		},
		positionSlider: function() {
			var slideWidth = this.getSlideWidth();

			$('.glider-link', this.container).removeClass('selected');
			$('.glider-link-' + this.currentSlide, this.container).addClass('selected');

			if (this.direction === 'ltr') {
				this.list.css({'left': '-' + (slideWidth * this.currentSlide) + 'px'});
			} else {
				this.list.css({'right': '-' + (slideWidth * this.currentSlide) + 'px'});
			}
		},
		resize: function() {
			//var parentWidth = this.container.width();
			var slideWidth = this.getSlideWidth();

			// Set width of slider and items
			this.list.css({ width: (slideWidth * (this.items.length + this.slidesToShow))  + 'px' });
			this.items.css({ width: slideWidth + 'px' });

			// Set controls and links placed in the middle to half way vertically
			var slideHeight = this.items.eq(0).height();
			$('.glider-middle', this.container).each(function () {
				$control = $(this);
				var height = $control.height();

				var h = (slideHeight - height) / 2;
				$control.css('top', h + 'px');
			});

			this.positionSlider();
		},
		next: function() {
			return this.goto(this.currentSlide + this.slidesToShow);
		},
		back: function() {
			return this.goto(this.currentSlide - this.slidesToShow);
		},
		goto: function(index) {
			var oldSlide = this.currentSlide;
			this.currentSlide = index;

			if (this.currentSlide >= this.items.length) {
				this.currentSlide = 0;
			}

			if (this.currentSlide < 0) {
				this.currentSlide = this.items.length -1;
			}

			window.clearTimeout(this.classTimer);

			var $oldSlide = this.items.eq(oldSlide);
			var $newSlide = this.items.eq(this.currentSlide);
			var _this = this;
			
			$oldSlide.removeClass('selected leaving arriving').addClass('leaving');
			$newSlide.removeClass('selected leaving arriving').addClass('arriving');
			$window.trigger('gliderSlideLeaving', [_this, $oldSlide]);
			$window.trigger('gliderSlideArriving', [_this, $newSlide]);

			this.positionSlider();

			this.classTimer = window.setTimeout(function () {
				$oldSlide.removeClass('selected leaving arriving');
				$newSlide.removeClass('selected leaving arriving').addClass('selected');
				$window.trigger('gliderSlideSelected', [_this, $newSlide]);
			}, 1000);

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
					.addClass('glider-link glider-link-' + idx)
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