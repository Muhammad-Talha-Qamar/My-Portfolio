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
$bg_video     = talbyte_option( 'bg_video', '' );
if ( ! $bg_video ) {
	$bg_video = talbyte_asset( $d['bg_video'] );
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?> data-mode="dark">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%91%BE%3C/text%3E%3C/svg%3E" />
  <script>
    try {
      var savedMode = localStorage.getItem("talha-mode");
      if (savedMode === "light" || savedMode === "dark") {
        document.documentElement.dataset.mode = savedMode;
      }
    } catch (err) {
      document.documentElement.dataset.mode = "dark";
    }
  </script>
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
  <div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>
  <div class="cursor-orb" aria-hidden="true"></div>
  <div class="cursor-ring" aria-hidden="true"></div>
  <div class="bg-layer" aria-hidden="true">
    <video class="back-vid" data-parallax="0.08" data-src="<?php echo esc_url( $bg_video ); ?>" loop muted playsinline preload="none"></video>
    <canvas class="bg-canvas" id="bg-canvas"></canvas>
    <div class="bg-aurora"></div>
    <div class="bg-glow"></div>
  </div>
  <div class="container">

    <header class="site-header">
      <nav class="nav-inner" aria-label="Primary">
        <a class="left" href="#home">
          <img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $brand_first . ' logo' ); ?>" />
          <h2><span><?php echo esc_html( $brand_first ); ?> </span><?php echo esc_html( $brand_last ); ?></h2>
        </a>

        <ul class="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div class="box-icons">
          <button class="theme-toggle" id="mode-toggle" type="button" aria-label="Switch to light mode" title="Toggle light / dark mode">
            <i class="bx bx-sun icon-sun"></i>
            <i class="bx bx-moon icon-moon"></i>
          </button>
          <a href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
            <i class="bx bxl-github"></i>
          </a>
          <a href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
            <i class="bx bxl-linkedin-square"></i>
          </a>
        </div>

        <button class="menu-icon" id="menu-icon" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="sidebar">
          <i class="bx bx-menu"></i>
        </button>
      </nav>
    </header>

    <div class="nav-overlay" id="nav-overlay" hidden></div>

    <aside class="sidebar" id="sidebar" aria-label="Mobile menu" aria-hidden="true">
      <div class="sidebar-top">
        <a class="left sidebar-brand" href="#home">
          <img src="<?php echo esc_url( $logo ); ?>" alt="" />
          <h2><span><?php echo esc_html( $brand_first ); ?></span><?php echo esc_html( $brand_last ); ?></h2>
        </a>
        <button class="close-icon" id="close-icon" type="button" aria-label="Close menu">
          <i class="bx bx-x"></i>
        </button>
      </div>

      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div class="social-sidebar">
        <a href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
          <i class="bx bxl-github"></i>
        </a>
        <a href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
          <i class="bx bxl-linkedin-square"></i>
        </a>
      </div>
    </aside>
