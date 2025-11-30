
    (function($) {
    "use strict";

    // Add active state to sidbar nav links
    var pathname = window.location.pathname; // Use pathname instead of href for better matching
    var filename = pathname.split('/').pop(); // Get filename from path
    
    // Remove active class from all nav links first
    $("#layoutSidenav_nav .sb-sidenav a.nav-link").removeClass("active");
    
    // Add active class to matching nav link
    $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
        var linkHref = $(this).attr("href");
        if (linkHref) {
            var linkFilename = linkHref.split('/').pop();
            // Match by filename or full pathname
            if (linkFilename === filename || linkHref === pathname || this.href === window.location.href) {
                $(this).addClass("active");
                // Also expand parent collapse if it exists
                var parentCollapse = $(this).closest('.collapse');
                if (parentCollapse.length) {
                    parentCollapse.addClass('show');
                    parentCollapse.prev('.nav-link').removeClass('collapsed').attr('aria-expanded', 'true');
                }
            }
        }
    });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });

    
})(jQuery);
