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
  <link rel="icon" href="<?php echo esc_url( talbyte_asset( 'images/favicon-32.png' ) ); ?>?v=<?php echo esc_attr( TALBYTE_THEME_VERSION ); ?>" type="image/png" sizes="32x32" />
  <link rel="icon" href="<?php echo esc_url( talbyte_asset( 'images/favicon.png' ) ); ?>?v=<?php echo esc_attr( TALBYTE_THEME_VERSION ); ?>" type="image/png" sizes="512x512" />
  <link rel="apple-touch-icon" href="<?php echo esc_url( talbyte_asset( 'images/apple-touch-icon.png' ) ); ?>?v=<?php echo esc_attr( TALBYTE_THEME_VERSION ); ?>" sizes="180x180" />
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

  <canvas class="interactive-grid-canvas" id="interactive-grid" aria-hidden="true"></canvas>
  <div class="interactive-grid" aria-hidden="true"></div>

  <header class="navbar" id="site-navbar">
    <div class="navbar__container">
      <a class="navbar__logo" href="#home" aria-label="<?php echo esc_attr( $brand_first . ' ' . $brand_last . ' Home' ); ?>" title="Home">
        <img src="<?php echo esc_url( $logo ); ?>" alt="" width="28" height="28" decoding="async" fetchpriority="high" />
        <span class="navbar__name"><?php echo esc_html( $brand_first . ' ' . $brand_last ); ?></span>
      </a>
      <span class="navbar__divider" aria-hidden="true"></span>
      <nav class="navbar__nav" id="nav-links-panel" aria-label="Primary">
        <ul class="navbar__links">
          <li class="navbar__item"><a class="navbar__link" href="#about">ABOUT</a></li>
          <li class="navbar__item"><a class="navbar__link" href="#skills">SKILLS</a></li>
          <li class="navbar__item"><a class="navbar__link" href="#projects">PROJECTS</a></li>
          <li class="navbar__item"><a class="navbar__link" href="#services">SERVICES</a></li>
          <li class="navbar__item"><a class="navbar__link" href="#contact">CONTACT</a></li>
        </ul>
      </nav>
      <button class="navbar__mobile-toggle" id="menu-icon" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links-panel">
        <span class="navbar__burger" aria-hidden="true"></span>
      </button>
    </div>
  </header>

  <div class="site-shell">
