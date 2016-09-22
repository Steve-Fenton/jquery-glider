/*
    jQuery Glider Plugin
    by Steve Fenton
    https://github.com/Steve-Fenton/jquery-glider
 */

(function ($) {
    var resizeTimer;
    var $window = $(window);
    $window.on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            $window.trigger('gliderResizeDone');
        }, 100);
    });

    var idIndex = 0;

    function Glider($this, settings) {

        this.id = 'glider-' + idIndex++;
        this.settings = settings;

        // Default link function
        this.linkFunction = function (idx) {
            return '<span class="glider-circle-icon">&nbsp;</span>';
        };

        // Direction
        this.direction = $this.attr('dir') || 'ltr';

        this.container = $this.attr('data-glider-id', this.id).addClass('glider glider-' + this.direction + ' ' + settings.animation);
        this.list = $(settings.list, $this).first().addClass('glider-list');
        this.items = $(settings.item, this.list).addClass('glider-item');

        this.currentSlide = 0;

        // Boolean attributes
        this.hasMultiple = $this[0].hasAttribute('data-glider-multiple');
        this.hasAutoplay = $this[0].hasAttribute('data-glider-autoplay');
        this.hasControls = $this[0].hasAttribute('data-glider-controls');
        this.hasLinks = $this[0].hasAttribute('data-glider-links');

        // Place controls at the bottom by default, or use the attribute
        this.controlLocation = $this.attr('data-glider-controls') || 'glider-bottom';

        // Place links at the bottom by default, or use the attribute
        this.linkLocation = $this.attr('data-glider-links') || 'glider-bottom';

        // Show one slide by default, or use the attribute
        this.fixedSlideWidth = "100%";
        this.widthInfo = [];
        this.slidesToShow = 1;

        var multipleAttribute = $this.attr('data-glider-multiple') || '1';

        if (multipleAttribute.indexOf('%') > -1 || multipleAttribute.indexOf('px') > -1) {
            this.fixedSlideWidth = multipleAttribute;
            this.setWidthInformation();
        } else {
            var multipleValue = parseInt(multipleAttribute, 10);
            this.slidesToShow = (isNaN(multipleValue)) ? 1 : multipleValue;
        }

        this.interval = null;
        this.classTimer = null;

        // Determine where controls should be placed        
        this.controlElement = $this;
        if (this.settings.controls) {
            this.controlElement = $this.parent().closest(this.settings.controls).css('position', 'relative').attr('dir', this.direction);
        }

        this.controlElement.addClass('glider-controls-' + this.direction);

        if (this.hasControls) {
            this.controlElement.append(this.getBackControl(this.controlLocation, this.settings.backIcon));
            this.controlElement.append(this.getNextControl(this.controlLocation, this.settings.nextIcon));
        }

        if (this.hasLinks) {
            this.controlElement.append($('<div>').append(this.getLinkControl(this.linkLocation, this.linkFunction)));
        }

        var _this = this;
        $window.on('gliderResizeDone', function () { _this.resize() });
        this.setUp();
    }

    Glider.prototype = {
        constructor: Glider,
        setUp: function () {
            var _this = this;
            if (this.hasAutoplay) {
                this.interval = window.setInterval(function () {
                    _this.next();
                }, 5000);
            }

            this.goto(0);
            this.resize();
        },
        setWidthInformation: function () {
            if (this.fixedSlideWidth.charAt(0) === '[') {
                // Parses DSL for responsive sizes, i.e. [1200:300px,0:200px]
                var data = this.fixedSlideWidth.replace(/[\[\]]/g, '').split(',');
                for (var i = 0; i < data.length; i++) {
                    var info = data[i].split(':');
                    this.widthInfo.push({
                        p: parseInt(info[0], 10),
                        w: info[1]
                    });
                }

                this.widthInfo.sort(function (a, b) {
                    return (b.p - a.p);
                });
            } else {
                this.widthInfo = [{ p: 0, w: this.fixedSlideWidth }];
            }
        },
        getParentWidth: function () {
            var width = this.container.width();
            return (width > 0) ? width : 0;
        },
        getPhysicalSize: function (rawValue) {
            // Converts % or px values into plain pixel number
            if (rawValue.indexOf('%') > -1) {
                var parentWidth = this.getParentWidth();
                return (parentWidth / 100) * parseInt(rawValue);
            } else {
                return parseInt(rawValue.replace('px', ''));
            }
        },
        getSlideWidth: function () {
            var parentWidth = this.getParentWidth();

            // Take into account the number of slides
            var slideWidth = parentWidth / this.slidesToShow;

            if (this.fixedSlideWidth !== '100%') {
                // Multiple Attribute specified widths
                for (var i = 0; i < this.widthInfo.length; i++) {
                    if (parentWidth >= this.widthInfo[i].p) {
                        slideWidth = this.getPhysicalSize(this.widthInfo[i].w);
                        break;
                    }
                }
            }

            return Math.floor(slideWidth);
        },
        positionSlider: function () {
            var parentWidth = this.getParentWidth();
            var slideWidth = this.getSlideWidth();

            $('.glider-link', this.container).removeClass('selected');
            $('.glider-link-' + this.currentSlide, this.container).addClass('selected');

            if (this.direction === 'ltr') {
                this.list.css({ 'left': '-' + (slideWidth * this.currentSlide) + 'px' });
            } else {
                this.list.css({ 'right': '-' + (slideWidth * this.currentSlide) + 'px' });
            }

            // For multi-slide layouts, hide the next control if the last slide is visible
            if (this.hasMultiple && this.settings.navigationMode === 'stop') {
                var visibility = 'visible';
                if (((this.items.length - this.currentSlide) * slideWidth) <= parentWidth) {
                    visibility = 'hidden'
                }

                $('.glider-control-next', this.controlElement).css({ 'visibility': visibility });
            }
        },
        resize: function () {
            var parentWidth = this.getParentWidth();
            var slideWidth = this.getSlideWidth();

            // Set width of slider and items
            this.list.css({ width: (slideWidth * (this.items.length + this.slidesToShow)) + 'px' });
            this.items.css({ width: slideWidth + 'px' });

            // Don't show controls if all slides are visible
            var visibility = 'visible';
            if ((slideWidth * this.items.length) <= parentWidth) {
                visibility = 'hidden';
            }

            $('.glider-control-back, .glider-control-next, .glider-control-link', this.controlElement).css({ 'visibility': visibility });

            // Set controls and links placed in the middle to half way vertically
            var slideHeight = this.items.eq(0).height();
            if (slideHeight > 200) {
                $('.glider-middle', this.parent).each(function () {
                    var $control = $(this);
                    var height = $control.height();

                    var h = (slideHeight - height) / 2;
                    $control.css('top', h + 'px');
                });
            }

            this.positionSlider();
        },
        next: function () {
            return this.goto(this.currentSlide + this.slidesToShow);
        },
        back: function () {
            return this.goto(this.currentSlide - this.slidesToShow);
        },
        goto: function (index) {
            window.clearTimeout(this.classTimer);

            var oldSlide = this.currentSlide;
            this.currentSlide = index;

            if (this.currentSlide >= this.items.length) {
                this.currentSlide = 0;
            }

            if (this.currentSlide < 0) {
                this.currentSlide = this.items.length - 1;
            }

            // Determine whether to show the back button based on index
            if (this.settings.navigationMode === 'stop' && this.currentSlide === 0) {
                $('.glider-control-back', this.controlElement).hide();
            } else {
                $('.glider-control-back', this.controlElement).show();
            }

            // Determine whether to show the next button based on index
            if (this.settings.navigationMode === 'stop' && this.currentSlide === (this.items.length - 1)) {
                $('.glider-control-next', this.controlElement).hide();
            } else {
                $('.glider-control-next', this.controlElement).show();
            }

            var parentWidth = this.getParentWidth();
            var slideWidth = this.getSlideWidth();

            var selectedGroup = [];
            var leavingGroup = [];
            var arrivingGroup = [];

            var oldStart = slideWidth * oldSlide;
            var newStart = slideWidth * this.currentSlide;

            this.items.removeClass('selected leaving arriving');

            for (var i = 0; i < this.items.length; i++) {
                var slideStartPosition = i * slideWidth;

                var isVisibleBefore = (slideStartPosition >= oldStart && slideStartPosition < (oldStart + parentWidth));
                var isVisibleAfter = (slideStartPosition >= newStart && slideStartPosition < (newStart + parentWidth));

                if (isVisibleBefore && isVisibleAfter) {
                    selectedGroup.push(this.items.eq(i));
                }

                if (isVisibleBefore && !isVisibleAfter) {
                    leavingGroup.push(this.items.eq(i));
                }

                if (!isVisibleBefore && isVisibleAfter) {
                    arrivingGroup.push(this.items.eq(i));
                }
            }

            var _this = this;

            for (var i = 0; i < leavingGroup.length; i++) {
                leavingGroup[i].removeClass('selected leaving arriving').addClass('leaving');
                $window.trigger('gliderSlideLeaving', [_this, leavingGroup[i]]);
            }

            for (var i = 0; i < arrivingGroup.length; i++) {
                arrivingGroup[i].removeClass('selected leaving arriving').addClass('arriving');
                $window.trigger('gliderSlideArriving', [_this, arrivingGroup[i]]);
            }

            this.positionSlider();


            this.classTimer = window.setTimeout(function () {
                for (var i = 0; i < leavingGroup.length; i++) {
                    leavingGroup[i].removeClass('selected leaving arriving');
                }

                for (var i = 0; i < arrivingGroup.length; i++) {
                    arrivingGroup[i].removeClass('selected leaving arriving').addClass('selected');
                    $window.trigger('gliderSlideSelected', [_this, arrivingGroup[i]]);
                }

                for (var i = 0; i < selectedGroup.length; i++) {
                    selectedGroup[i].removeClass('leaving arriving').addClass('selected');
                    //$window.trigger('gliderSlideSelected', [_this, arrivingGroup[i]]);
                }
            }, 1000);

            return false;
        },
        getBackControl: function (location, text) {
            var _this = this;
            return $('<div>')
                .addClass('glider-control-back')
                .addClass(location)
                .click(function () {
                    window.clearInterval(_this.interval);
                    _this.back();
                })
                .html(text);
        },
        getNextControl: function (location, text) {
            var _this = this;
            return $('<div>')
                .addClass('glider-control-next')
                .addClass(location)
                .click(function () {
                    window.clearInterval(_this.interval);
                    _this.next();
                })
                .html(text);
        },
        getLinkControl: function (location, textFunction) {
            var _this = this;
            var linkControl = $('<ul>')
                .addClass('glider-control-link')
                .addClass(location);

            var getListItem = function (idx) {
                return $('<li>')
                    .addClass('glider-link glider-link-' + idx)
                    .click(function () {
                        window.clearInterval(_this.interval)
                        _this.goto(idx);
                    })
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
            controls: '',
            animation: 'ease',
            nextIcon: '&gt;',
            backIcon: '&lt;',
            navigationMode: 'cycle'
        }, options);

        var gliders = [];

        this.each(function () {
            gliders.push(new Glider($(this), settings));
        });

        return gliders;
    };
}(jQuery));