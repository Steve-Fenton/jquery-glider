# jQuery Glider

A global slider plugin for jQuery, which support left-to-right and right-to-left languages.

[View the jQuery Glider Wiki](https://github.com/Steve-Fenton/jquery-glider/wiki)

## Quick Start

You'll need the optional stylesheet, the jQuery library, and the glider library.

    <!-- in your head -->
    <link rel="stylesheet" href="glider.css" />

    <!-- your content -->
    <div class="slide">
        <ul>
            <li>One</li>
            <li>Two</li>
            <li>Three</li>
        </ul>
    </div>

    <!-- at the end of your body -->
    <script src="jquery.min.js"></script>
    <script src="glider.js"></script>
    <script>
        var gliders = $('.slide').glider();	
    </script>

## Issues

If you have any trouble, please create a basic example of your problem using the `test.html` file and add it to any issue you raise.

The most common cause of issues will be that you have a conflicting style applied to the glider, not that there is a problem with the glider itself.
