<?php
/**
 * Talbyte Portfolio theme bootstrap.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

define( 'TALBYTE_THEME_VERSION', '1.0.6' );

require_once get_template_directory() . '/inc/helpers.php';
require_once get_template_directory() . '/inc/cpt-project.php';
require_once get_template_directory() . '/inc/acf-fields.php';
require_once get_template_directory() . '/inc/seed.php';

add_action( 'after_setup_theme', 'talbyte_theme_setup' );
add_action( 'wp_enqueue_scripts', 'talbyte_enqueue_assets' );
add_action( 'wp_enqueue_scripts', 'talbyte_dequeue_bloat', 100 );
add_action( 'wp_footer', 'talbyte_dequeue_bloat', 1 );
add_filter( 'document_title_parts', 'talbyte_document_title' );
add_action( 'wp_head', 'talbyte_meta_description', 1 );
add_filter( 'emoji_svg_url', '__return_false' );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );

/**
 * Theme supports.
 */
function talbyte_theme_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
}

/**
 * Prefer minified dist assets from `npm run build` when present.
 *
 * @param string $source Relative path under assets/ (e.g. style.css).
 * @param string $built  Relative path under assets/dist/ (e.g. style.min.css).
 * @return string Relative assets path to enqueue.
 */
function talbyte_asset_file( $source, $built ) {
	$built_path = get_template_directory() . '/assets/' . ltrim( $built, '/' );
	if ( file_exists( $built_path ) ) {
		return ltrim( $built, '/' );
	}
	return ltrim( $source, '/' );
}

/**
 * Enqueue design CSS/JS + CDN libs.
 */
function talbyte_enqueue_assets() {
	$uri = get_template_directory_uri() . '/assets';
	$ver = TALBYTE_THEME_VERSION;

	$css      = talbyte_asset_file( 'style.css', 'dist/style.min.css' );
	$js_main  = talbyte_asset_file( 'main.js', 'dist/main.min.js' );
	$js_aos   = talbyte_asset_file( 'aos-init.js', 'dist/aos-init.min.js' );

	// jsDelivr is usually faster/cached than unpkg for first paint.
	wp_enqueue_style( 'boxicons', 'https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css', array(), '2.1.4' );
	wp_enqueue_style( 'aos', 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css', array(), '2.3.4' );
	wp_enqueue_style( 'talbyte-portfolio', $uri . '/' . $css, array( 'boxicons', 'aos' ), $ver );

	wp_enqueue_script( 'talbyte-main', $uri . '/' . $js_main, array(), $ver, array( 'strategy' => 'defer', 'in_footer' => true ) );
	wp_enqueue_script( 'aos', 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js', array(), '2.3.4', array( 'strategy' => 'defer', 'in_footer' => true ) );
	wp_enqueue_script( 'talbyte-aos-init', $uri . '/' . $js_aos, array( 'aos' ), $ver, array( 'strategy' => 'defer', 'in_footer' => true ) );

	$d     = talbyte_defaults();
	$email = talbyte_option( 'email', $d['email'] );

	wp_localize_script(
		'talbyte-main',
		'talbytePortfolio',
		array(
			'contactEmail' => $email,
		)
	);
}

/**
 * Faster first connection to CDN + preload theme CSS.
 */
add_action( 'wp_head', 'talbyte_resource_hints', 1 );

/**
 * Print preconnect / preload hints.
 */
function talbyte_resource_hints() {
	$css  = talbyte_asset_file( 'style.css', 'dist/style.min.css' );
	$href = get_template_directory_uri() . '/assets/' . $css . '?ver=' . rawurlencode( TALBYTE_THEME_VERSION );
	$hero = talbyte_image_url( talbyte_option( 'hero_photo', null ), talbyte_defaults()['hero_photo'] );
	echo '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />' . "\n";
	echo '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />' . "\n";
	echo '<link rel="preload" href="' . esc_url( $href ) . '" as="style" />' . "\n";
	if ( $hero ) {
		$type = str_ends_with( strtolower( wp_parse_url( $hero, PHP_URL_PATH ) ?: '' ), '.webp' ) ? 'image/webp' : 'image/jpeg';
		echo '<link rel="preload" href="' . esc_url( $hero ) . '" as="image" type="' . esc_attr( $type ) . '" fetchpriority="high" />' . "\n";
	}
}

/**
 * Strip WordPress / Hostinger front-end bloat that causes jank.
 */
function talbyte_dequeue_bloat() {
	if ( is_admin() ) {
		return;
	}

	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'classic-theme-styles' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'wc-blocks-style' );

	wp_dequeue_script( 'wp-embed' );
	wp_deregister_script( 'wp-embed' );

	// Hostinger Reach chat embed — heavy and unrelated to the portfolio UI.
	wp_dequeue_script( 'hostinger-reach-tracking' );
	wp_dequeue_script( 'hostinger-reach' );
	wp_dequeue_script( 'hostinger-reach-frontend' );
	wp_dequeue_style( 'hostinger-reach' );

	wp_dequeue_script( 'hostinger-frontend' );
	wp_dequeue_style( 'hostinger-frontend' );
}

/**
 * SEO title from options.
 *
 * @param array $parts Title parts.
 * @return array
 */
function talbyte_document_title( $parts ) {
	if ( is_front_page() ) {
		$d = talbyte_defaults();
		$parts['title'] = talbyte_option( 'seo_title', $d['seo_title'] );
		unset( $parts['tagline'], $parts['site'] );
	}
	return $parts;
}

/**
 * Meta description.
 */
function talbyte_meta_description() {
	if ( ! is_front_page() ) {
		return;
	}
	$d = talbyte_defaults();
	$desc = talbyte_option( 'seo_description', $d['seo_description'] );
	echo '<meta name="description" content="' . esc_attr( $desc ) . '" />' . "\n";
	echo '<meta name="theme-color" content="#050816" id="theme-color" />' . "\n";
}

/**
 * Project meta with ACF or post_meta fallback.
 *
 * @param int    $post_id Post ID.
 * @param string $key     Meta key.
 * @param mixed  $default Default.
 * @return mixed
 */
function talbyte_project_meta( $post_id, $key, $default = '' ) {
	$value = talbyte_field( $key, $post_id, null );
	if ( $value !== null && $value !== '' ) {
		return $value;
	}
	$meta = get_post_meta( $post_id, $key, true );
	return $meta !== '' ? $meta : $default;
}
