// Header Component Loader - Works with file:// protocol
(function() {
    // For local file:// protocol, we need to use XMLHttpRequest instead of fetch
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../includes/header.html', true);
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) { // 0 for local files
            var placeholder = document.getElementById('header-placeholder');
            if (placeholder) {
                placeholder.innerHTML = xhr.responseText;
                fixHeaderPaths();
            }
        } else {
            console.error('Error loading header:', xhr.status);
        }
    };
    
    xhr.onerror = function() {
        console.error('Error loading header file');
    };
    
    xhr.send();
    
    // Fix paths based on page depth
    function fixHeaderPaths() {
        var depth = getPageDepth();
        var prefix = depth > 0 ? '../'.repeat(depth) : './';
        
        // Fix logo path
        var logo = document.querySelector('.elementor-widget-cmsmasters-site-logo__img');
        if (logo && logo.src.startsWith('/')) {
            logo.src = prefix + logo.src.substring(1);
        }
        
        // Fix all navigation links
        var links = document.querySelectorAll('#header-placeholder a[href^="/"]');
        links.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href.startsWith('/')) {
                link.setAttribute('href', prefix + href.substring(1));
            }
        });
    }
    
    // Calculate page depth from URL
    function getPageDepth() {
        var path = window.location.pathname;
        var parts = path.split('/').filter(function(p) { return p && p !== 'index.html'; });
        return parts.length;
    }
})();
