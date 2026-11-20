<?php
/**
 * Theme header.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d            = talbyte_defaults();
$brand_first  = talbyte_option( 'brand_first', $d['brand_first'] );
$brand_last   = talbyte_option( 'brand_last', $d['brand_last'] );
$logo         = talbyte_image_url( talbyte_option( 'logo', null ), $d['logo_fallback'] );
$github_url   = talbyte_option( 'github_url', $d['github_url'] );
$linkedin_url = talbyte_option( 'linkedin_url', $d['linkedin_url'] );
?><!DOCTYPE html>
<html <?php language_attributes(); ?> data-mode="dark">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" id="theme-color" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3ET%3C/text%3E%3C/svg%3E" />
  <script>
    try {
      var mq = window.matchMedia;
      var params = new URLSearchParams(window.location.search);
      var forceLoader = params.has("loader") || params.has("replay");
      var seenIntro = !forceLoader && sessionStorage.getItem("talbyte_loader_seen") === "1";
      var reduceMotion = mq("(prefers-reduced-motion: reduce)").matches;
      var saveData = !!(navigator.connection && (navigator.connection.saveData || /2g|slow-2g/i.test(navigator.connection.effectiveType || "")));
      var lite =
        reduceMotion ||
        mq("(max-width: 1100px), (update: slow)").matches ||
        !mq("(pointer: fine)").matches ||
        saveData ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
        (navigator.deviceMemory && navigator.deviceMemory < 4);
      if (lite) document.documentElement.classList.add("is-lite");
      if (seenIntro || ((reduceMotion || saveData) && !forceLoader)) {
        document.documentElement.dataset.intro = "done";
      } else {
        document.documentElement.dataset.intro = "pending";
      }
    } catch (err) {
      document.documentElement.dataset.mode = "dark";
      document.documentElement.classList.add("is-lite");
      document.documentElement.dataset.intro = "done";
    }
  </script>
  <style id="intro-critical">
    html[data-intro="pending"] body{overflow:hidden}
    #site-intro{position:fixed;inset:0;z-index:99999;background:#050505;display:none}
    html[data-intro="pending"] #site-intro{display:flex}
  </style>
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
  <div id="site-intro" class="site-intro" aria-live="polite" aria-label="Loading portfolio">
    <button type="button" class="site-intro__skip" id="site-intro-skip" aria-label="Skip intro loader" title="Skip to portfolio (Esc)">
      <span>SKIP</span><kbd>ESC</kbd>
    </button>
    <div class="site-intro__tag mono" aria-hidden="true"></div>
    <div class="site-intro__board" id="site-intro-board" role="img" aria-label="Name on a split-flap board"></div>
    <div class="site-intro__meta">
      <div class="site-intro__msg mono" id="site-intro-msg">Shuffling letters</div>
      <div class="site-intro__num"><span id="site-intro-pct">0</span><small>%</small></div>
    </div>
    <div class="site-intro__bar" aria-hidden="true"><b id="site-intro-bar"></b></div>
  </div>

  <div class="interactive-grid" aria-hidden="true"></div>

  <header class="navbar" id="site-navbar">
    <nav class="navbar__container" aria-label="Primary">
      <a class="navbar__logo" href="#home" aria-label="<?php echo esc_attr( $brand_first . ' ' . $brand_last . ' Home' ); ?>">
        <img src="<?php echo esc_url( $logo ); ?>" alt="" width="36" height="36" decoding="async" fetchpriority="high" />
      </a>
      <ul class="navbar__links">
        <li><a class="navbar__link" href="#about">ABOUT</a></li>
        <li><a class="navbar__link" href="#skills">SKILLS</a></li>
        <li><a class="navbar__link" href="#projects">PROJECTS</a></li>
        <li><a class="navbar__link" href="#services">SERVICES</a></li>
        <li><a class="navbar__link" href="#contact">CONTACT</a></li>
      </ul>
      <button class="navbar__burger" id="menu-icon" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links-panel">
        <span></span><span></span><span></span>
      </button>
    </nav>
  </header>

  <div class="site-shell">
