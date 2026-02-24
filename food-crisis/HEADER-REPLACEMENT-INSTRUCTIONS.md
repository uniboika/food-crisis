# Header Replacement Instructions

## Step 1: Add Header Placeholder and Script

In each HTML file, find this line:
```html
<body id="cmsmasters_body" class="...">
```

Right after the `<body>` tag, ADD these 2 lines:
```html
<!-- Header Component -->
<div id="header-placeholder"></div>
```

## Step 2: Remove Old Header

DELETE everything from:
```html
<div data-elementor-type="cmsmasters_header" data-elementor-id="87"...
```

Until you reach:
```html
<main id="main" class="cmsmasters-main site-main">
```

Keep the `<main>` tag - don't delete it!

## Step 3: Add Script Before Closing Body Tag

Before the `</body>` closing tag, ADD:
```html
<script src="../includes/header-loader.js"></script>
```

Note: Adjust the path based on page depth:
- Root pages (index.html): `src="includes/header-loader.js"`
- 1 level deep (/contacts/): `src="../includes/header-loader.js"`  
- 2 levels deep (/campaigns/stop-hunger/): `src="../../includes/header-loader.js"`

## Example for Contacts Page:

### BEFORE:
```html
<body id="cmsmasters_body" class="...">
<div data-elementor-type="cmsmasters_header" data-elementor-id="87"...
  [HUGE HEADER CODE]
</div>
<main id="main" class="cmsmasters-main site-main">
```

### AFTER:
```html
<body id="cmsmasters_body" class="...">
<!-- Header Component -->
<div id="header-placeholder"></div>
<main id="main" class="cmsmasters-main site-main">
```

And before `</body>`:
```html
<script src="../includes/header-loader.js"></script>
</body>
```

## Files to Update:
1. ✅ food-crisis/contacts/index.html (START HERE)
2. food-crisis/about-us/index.html
3. food-crisis/index.html
4. All other pages...
