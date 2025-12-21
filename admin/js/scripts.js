
    (function($) {
    "use strict";

    // Add active state to sidbar nav links
    var pathname = window.location.pathname; // Use pathname instead of href for better matching
    var filename = pathname.split('/').pop() || 'index.html'; // Get filename from path, default to index.html
    var currentUrl = window.location.href;
    
    console.log("=== Setting active sidebar link ===");
    console.log("Current pathname:", pathname);
    console.log("Current filename:", filename);
    console.log("Current URL:", currentUrl);
    
    // Remove active class from ALL nav links first (CRITICAL - must remove all!)
    $("#layoutSidenav_nav .sb-sidenav a.nav-link").removeClass("active");
    
    // Wait a bit to ensure all other scripts have finished
    setTimeout(function() {
        // Remove active again to be safe
        $("#layoutSidenav_nav .sb-sidenav a.nav-link").removeClass("active");
        
        // Find and activate ONLY ONE matching nav link
        var foundMatch = false;
        $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
            if (foundMatch) return false; // Stop if already found
            
            var $link = $(this);
            var linkHref = $link.attr("href");
            
            if (linkHref) {
                var linkFilename = linkHref.split('/').pop();
                var linkUrl = $link[0].href; // Full resolved URL
                
                // Multiple matching strategies - but only exact match
                var matches = false;
                
                // Strategy 1: Exact filename match (most reliable)
                if (linkFilename === filename) {
                    matches = true;
                    console.log("✅ Match found by exact filename:", linkFilename);
                }
                // Strategy 2: Special case for index.html
                else if ((filename === '' || filename === 'index.html') && linkFilename === 'index.html') {
                    matches = true;
                    console.log("✅ Match found: index.html");
                }
                // Strategy 3: Check if current URL exactly matches (fallback)
                else if (linkUrl === currentUrl || currentUrl.endsWith(linkHref)) {
                    matches = true;
                    console.log("✅ Match found by exact URL:", linkHref);
                }
                
                if (matches && !foundMatch) {
                    // Remove active from ALL links again before adding
                    $("#layoutSidenav_nav .sb-sidenav a.nav-link").removeClass("active");
                    
                    $link.addClass("active");
                    foundMatch = true;
                    console.log("✅ Activated link:", linkHref);
                    
                    // Also expand parent collapse if it exists
                    var parentCollapse = $link.closest('.collapse');
                    if (parentCollapse.length) {
                        parentCollapse.addClass('show');
                        parentCollapse.prev('.nav-link').removeClass('collapsed').attr('aria-expanded', 'true');
                    }
                    
                    return false; // Break the loop
                }
            }
        });
        
        if (!foundMatch) {
            console.warn("⚠️ No matching sidebar link found for:", filename);
        } else {
            // Verify only one is active
            var activeCount = $("#layoutSidenav_nav .sb-sidenav a.nav-link.active").length;
            if (activeCount > 1) {
                console.error("❌ ERROR: Multiple active links found! Fixing...");
                var firstActive = $("#layoutSidenav_nav .sb-sidenav a.nav-link.active").first();
                $("#layoutSidenav_nav .sb-sidenav a.nav-link.active").not(firstActive).removeClass("active");
            }
        }
    }, 100);

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });

    
})(jQuery);
