<?php
/**
 * Talbyte Portfolio theme bootstrap.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

define( 'TALBYTE_THEME_VERSION', '1.0.0' );

require_once get_template_directory() . '/inc/helpers.php';
require_once get_template_directory() . '/inc/cpt-project.php';
require_once get_template_directory() . '/inc/acf-fields.php';
require_once get_template_directory() . '/inc/seed.php';

add_action( 'after_setup_theme', 'talbyte_theme_setup' );
add_action( 'wp_enqueue_scripts', 'talbyte_enqueue_assets' );
add_filter( 'document_title_parts', 'talbyte_document_title' );
add_action( 'wp_head', 'talbyte_meta_description', 1 );

/**
 * Theme supports.
 */
function talbyte_theme_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
}

/**
 * Enqueue design CSS/JS + CDN libs.
 */
function talbyte_enqueue_assets() {
	$uri = get_template_directory_uri();
	$ver = TALBYTE_THEME_VERSION;

	wp_enqueue_style( 'boxicons', 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css', array(), '2.1.4' );
	wp_enqueue_style( 'aos', 'https://unpkg.com/aos@next/dist/aos.css', array(), null );
	wp_enqueue_style( 'talbyte-portfolio', $uri . '/assets/style.css', array( 'boxicons', 'aos' ), $ver );

	wp_enqueue_script( 'talbyte-main', $uri . '/assets/main.js', array(), $ver, array( 'strategy' => 'defer', 'in_footer' => true ) );
	wp_enqueue_script( 'aos', 'https://unpkg.com/aos@next/dist/aos.js', array(), null, array( 'strategy' => 'defer', 'in_footer' => true ) );
	wp_enqueue_script( 'talbyte-aos-init', $uri . '/assets/aos-init.js', array( 'aos' ), $ver, array( 'strategy' => 'defer', 'in_footer' => true ) );

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
