<?php
/**
 * Theme helpers — ACF-aware getters with static defaults.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

/**
 * Read an options field (ACF) with fallback.
 *
 * @param string $key     Field name.
 * @param mixed  $default Default value.
 * @return mixed
 */
function talbyte_option( $key, $default = '' ) {
	if ( function_exists( 'get_field' ) ) {
		$value = get_field( $key, 'option' );
		if ( $value !== null && $value !== false && $value !== '' ) {
			return $value;
		}
	}
	return $default;
}

/**
 * Read a post field (ACF) with fallback.
 *
 * @param string   $key     Field name.
 * @param int|null $post_id Post ID.
 * @param mixed    $default Default value.
 * @return mixed
 */
function talbyte_field( $key, $post_id = null, $default = '' ) {
	if ( function_exists( 'get_field' ) ) {
		$value = get_field( $key, $post_id );
		if ( $value !== null && $value !== false && $value !== '' ) {
			return $value;
		}
	}
	return $default;
}

/**
 * Inline SVG icon (replaces Boxicons CDN).
 *
 * @param string $name Icon key.
 * @return string Safe SVG markup.
 */
function talbyte_icon( $name ) {
	$icons = array(
		'github'    => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>',
		'linkedin'  => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S.02 4.88.02 3.5 1.14 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.5h4.56V23H.22V8.5zM8.34 8.5h4.37v1.98h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 7V23h-4.56v-6.7c0-1.6-.03-3.66-2.23-3.66-2.23 0-2.57 1.74-2.57 3.54V23H8.34V8.5z"/></svg>',
		'envelope'  => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/></svg>',
		'mail-send' => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
		'code'      => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8.7 15.9 4.8 12l3.9-3.9L7.3 6.7 1.9 12l5.4 5.3 1.4-1.4zm6.6 0 1.4 1.4 5.4-5.3-5.4-5.3-1.4 1.4 3.9 3.9-3.9 3.9zM14.6 4.1l-1.2.4-4 15.2 1.2.3 4-15.9z"/></svg>',
		'layout'    => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z"/></svg>',
		'joystick'  => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a4 4 0 0 0-4 4v2H6a4 4 0 0 0-4 4v2a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6v-2a4 4 0 0 0-4-4h-2V6a4 4 0 0 0-4-4zm-1 9h2v2h2v2h-2v2h-2v-2H9v-2h2v-2z"/></svg>',
		'palette'   => '<svg class="tb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
	);
	return isset( $icons[ $name ] ) ? $icons[ $name ] : '';
}

/**
 * Theme asset URL.
 *
 * @param string $path Relative path under assets/.
 * @return string
 */
function talbyte_asset( $path ) {
	$path = ltrim( $path, '/' );
	$base = get_template_directory() . '/assets/';
	$uri  = get_template_directory_uri() . '/assets/';
	$webp = preg_replace( '/\.(png|jpe?g)$/i', '.webp', $path );
	$file = $base . $path;
	if ( $webp && $webp !== $path ) {
		$webp_file = $base . $webp;
		if ( file_exists( $webp_file ) ) {
			$path = $webp;
			$file = $webp_file;
		}
	}
	$url = $uri . $path;
	if ( file_exists( $file ) ) {
		$url = add_query_arg( 'v', (string) filemtime( $file ), $url );
	}
	return $url;
}

/**
 * Resolve image URL from ACF image array/ID/string or default path.
 *
 * @param mixed  $image   ACF image value.
 * @param string $fallback Relative assets path.
 * @return string
 */
function talbyte_image_url( $image, $fallback ) {
	if ( is_array( $image ) && ! empty( $image['url'] ) ) {
		return $image['url'];
	}
	if ( is_numeric( $image ) ) {
		$url = wp_get_attachment_image_url( (int) $image, 'full' );
		if ( $url ) {
			return $url;
		}
	}
	if ( is_string( $image ) && $image !== '' && filter_var( $image, FILTER_VALIDATE_URL ) ) {
		return $image;
	}
	return talbyte_asset( $fallback );
}

/**
 * Wrap highlight words in a title with <span class="gradient"> or <span class="hl">.
 *
 * @param string $title     Plain title.
 * @param string $highlight Comma-separated words/phrases to highlight.
 * @param string $class     CSS class for highlights.
 * @return string Safe HTML.
 */
function talbyte_title_html( $title, $highlight = '', $class = 'gradient' ) {
	$title = (string) $title;
	if ( $highlight === '' ) {
		return esc_html( $title );
	}
	$parts  = array_filter( array_map( 'trim', explode( ',', $highlight ) ) );
	$result = esc_html( $title );
	$class  = sanitize_html_class( $class );
	foreach ( $parts as $part ) {
		$safe = esc_html( $part );
		if ( $safe === '' ) {
			continue;
		}
		$result = preg_replace(
			'/' . preg_quote( $safe, '/' ) . '/u',
			'<span class="' . $class . '">' . $safe . '</span>',
			$result,
			1
		);
	}
	return $result;
}

/**
 * Highlight comma-separated phrases inside a paragraph.
 *
 * @param string $text      Plain text.
 * @param string $highlight Comma-separated phrases.
 * @return string Safe HTML.
 */
function talbyte_highlight_html( $text, $highlight = '' ) {
	return talbyte_title_html( $text, $highlight, 'hl' );
}

/**
 * Default portfolio content — ashithmk.dev structure, Talha data.
 *
 * @return array<string,mixed>
 */
function talbyte_defaults() {
	return array(
		'seo_title'       => 'Muhammad Talha Qamar — Developer',
		'seo_description' => 'Muhammad Talha Qamar — Full Stack Developer building polished websites, product landings, clones, and interactive web apps.',
		'brand_first'     => 'TALHA',
		'brand_last'      => 'Q.',
		'display_name'    => 'Muhammad Talha Qamar',
		'email'           => 'qamitalha42@gmail.com',
		'github_url'      => 'https://github.com/Muhammad-Talha-Qamar',
		'github_label'    => 'Muhammad-Talha-Qamar',
		'linkedin_url'    => 'https://www.linkedin.com/in/m-talha-qamar-96765b435/',
		'linkedin_label'  => 'Talha Qamar',
		'logo_fallback'   => 'images/tq-mark.png',
		'bg_video'        => '',

		'intro_text'      => 'TALHA Q.',
		'hero_role'       => 'DEVELOPER',
		'hero_name_line1' => 'TALHA',
		'hero_name_line2' => 'Q.',
		'hero_subtitle'   => 'FULL STACK DEVELOPER',
		'hero_bio'        => "I'm Muhammad Talha Qamar — a Full Stack Developer passionate about building modern, interactive, and responsive websites with HTML, CSS, and JavaScript.",
		'hero_cta_label'  => 'EXPLORE MY WORK',
		'hero_cta_href'   => '#projects',
		'hero_talk_label' => "LET'S TALK",
		'hero_talk_href'  => '#contact',
		'hero_photo'      => 'images/main.jpg',
		'hero_stats'      => array(
			array( 'num' => '10+', 'label' => 'PROJECTS BUILT' ),
			array( 'num' => '13', 'label' => 'GITHUB REPOS' ),
			array( 'num' => '10+', 'label' => 'LIVE SITES' ),
			array( 'num' => '∞', 'label' => 'IDEAS' ),
		),

		'about_tag'       => 'ABOUT',
		'about_headline'  => 'I turn ideas into',
		'about_slot_words'=> 'products,websites,interfaces,experiences,games',
		'about_para_1'    => "Hi, I'm Muhammad Talha Qamar, a Full Stack Developer shipping polished web products. I turn ideas into working websites and interactive apps using HTML, CSS, JavaScript, and TypeScript.",
		'about_para_1_hl' => 'Full Stack Developer,websites and interactive apps,HTML, CSS, JavaScript, and TypeScript',
		'about_para_2'    => 'From EV product landings and brand clones to recipe sites, ordering flows, and a split-screen driving game, I focus on clean layouts, fast performance, and interfaces that feel simple to use. Have a project in mind? Let’s talk and build it.',
		'about_para_2_hl' => 'clean layouts,fast performance,talk and build it',
		'about_facts'     => array(
			array( 'label' => 'Role', 'value' => 'Full Stack Developer' ),
			array( 'label' => 'Focus', 'value' => 'Web & Interfaces' ),
			array( 'label' => 'Main stack', 'value' => 'HTML · CSS · JS · WP' ),
			array( 'label' => 'Profiles', 'value' => 'GitHub · LinkedIn' ),
		),

		'projects_title'  => 'THE BUILD LOG',
		'projects_lead'   => 'Open a project to explore the live build — clones, product sites, apps, and games on talbyte.com.',
		'projects_lead_highlight' => 'talbyte.com',

		'skills_title'    => 'TECH ARSENAL',
		'skills_groups'   => array(
			array(
				'num'   => '01',
				'title' => 'LANGUAGES',
				'items' => array( 'HTML5', 'CSS', 'JavaScript', 'TypeScript' ),
			),
			array(
				'num'   => '02',
				'title' => 'PLATFORM',
				'items' => array( 'WordPress', 'Responsive UI', 'DOM APIs', 'REST basics' ),
			),
			array(
				'num'   => '03',
				'title' => 'TOOLS',
				'items' => array( 'Git', 'GitHub', 'VS Code', 'Hostinger' ),
			),
		),
		'skills_tagline'  => 'IDEA → BUILD → SHIP.',

		'services_title'  => 'WHAT I BUILD',
		'services'        => array(
			array(
				'num'   => '01',
				'title' => 'FULL STACK DEVELOPMENT',
				'note'  => 'Modern, responsive and scalable web apps.',
			),
			array(
				'num'   => '02',
				'title' => 'LANDING PAGES & CLONES',
				'note'  => 'High-fidelity marketing sites and brand recreations that convert.',
			),
			array(
				'num'   => '03',
				'title' => 'INTERACTIVE WEB APPS',
				'note'  => 'Games, dashboards, and product UIs with real interaction.',
			),
			array(
				'num'   => '04',
				'title' => 'INTERFACE DESIGN',
				'note'  => 'Simple, user-friendly layouts that look sharp on every screen.',
			),
		),

		'contact_title'   => "LET'S BUILD SOMETHING",
		'contact_lead'    => 'Have a project in mind, a question, or just want to connect? Feel free to drop a message!',
		'contact_aside'   => 'SEND MESSAGE',
		'form_name_label' => 'Your Name',
		'form_email_label'=> 'Your Email',
		'form_message_label' => 'Your Message',
		'form_submit'     => 'SEND MESSAGE',
	);
}

/**
 * Default projects for seeding / fallback carousel.
 *
 * @return array<int,array<string,string>>
 */
function talbyte_default_projects() {
	return array(
		array(
			'title'       => 'LIFEPILOT',
			'highlight'   => '',
			'tag'         => 'App',
			'description' => 'Private tasks and checklists app with account-based sign-in — a personal productivity companion.',
			'url'         => 'https://lifepilot.talbyte.com/',
			'thumb'       => 'images/thumbs/lifepilot.jpg',
			'alt'         => 'LifePilot homepage',
			'tech'        => 'TypeScript,HTML,CSS',
			'cta'         => 'LIVE DEMO',
		),
		array(
			'title'       => 'BYD DOLPHIN SURF',
			'highlight'   => '',
			'tag'         => 'Product',
			'description' => 'Ocean Series EV landing with hero storytelling, model pages, and product-focused motion.',
			'url'         => 'https://byd.talbyte.com/',
			'thumb'       => 'images/thumbs/byd.jpg',
			'alt'         => 'BYD Dolphin Surf homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE SITE',
		),
		array(
			'title'       => 'FOODPANDA',
			'highlight'   => '',
			'tag'         => 'Clone',
			'description' => 'Food delivery UI with address search, categories, and partner flows rebuilt from scratch.',
			'url'         => 'https://foodpanda.talbyte.com/',
			'thumb'       => 'images/thumbs/foodpanda.jpg',
			'alt'         => 'foodpanda homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE DEMO',
		),
		array(
			'title'       => 'SMIT PORTAL',
			'highlight'   => '',
			'tag'         => 'Education',
			'description' => 'Saylani Mass IT Training site with courses, enrollment flow, and a clean institutional layout.',
			'url'         => 'https://smit.talbyte.com/',
			'thumb'       => 'images/thumbs/smit.jpg',
			'alt'         => 'SMIT homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE SITE',
		),
		array(
			'title'       => 'SAFFRON KITCHEN',
			'highlight'   => '',
			'tag'         => 'Recipes',
			'description' => 'Recipe website for appetizers, mains, drinks, and desserts with a warm, food-first UI.',
			'url'         => 'https://saffron-kitchen.talbyte.com/',
			'thumb'       => 'images/thumbs/saffron-kitchen.jpg',
			'alt'         => 'Saffron Kitchen homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE SITE',
		),
		array(
			'title'       => 'KFC ORDERING',
			'highlight'   => '',
			'tag'         => 'Web App',
			'description' => 'Menu browsing, buckets, merch, and reorder-style checkout UI for a fast-food experience.',
			'url'         => 'https://kfc.talbyte.com/',
			'thumb'       => 'images/thumbs/kfc.jpg',
			'alt'         => 'KFC web app homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE DEMO',
		),
		array(
			'title'       => 'MIRAGE WORKS',
			'highlight'   => '',
			'tag'         => 'Business',
			'description' => 'Accounting and outsourcing brand site with solutions, insight pages, and corporate polish.',
			'url'         => 'https://mirage-works.talbyte.com/',
			'thumb'       => 'images/thumbs/mirage-works.jpg',
			'alt'         => 'Mirage Works homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE SITE',
		),
		array(
			'title'       => 'OLX CLONE',
			'highlight'   => '',
			'tag'         => 'Marketplace',
			'description' => 'Buy and sell classifieds — categories, search, and listing flows for a marketplace UI.',
			'url'         => 'https://olx.talbyte.com/',
			'thumb'       => 'images/thumbs/olx.jpg',
			'alt'         => 'OLX homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE DEMO',
		),
		array(
			'title'       => 'SYSTEMS LIMITED',
			'highlight'   => '',
			'tag'         => 'Corporate',
			'description' => 'IT consulting and AI transformation corporate landing experience with enterprise tone.',
			'url'         => 'https://systems-website.talbyte.com/',
			'thumb'       => 'images/thumbs/systems-website.jpg',
			'alt'         => 'Systems Limited homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE SITE',
		),
		array(
			'title'       => 'DUAL COP',
			'highlight'   => '',
			'tag'         => 'Web Game',
			'description' => 'Getaway driving game with nitro, heat meters, and split-screen play — built as a full browser experience.',
			'url'         => 'https://dual-cop.talbyte.com/',
			'thumb'       => 'images/thumbs/dual-cop.jpg',
			'alt'         => 'Dual Cop Game homepage',
			'tech'        => 'HTML,CSS,JavaScript',
			'cta'         => 'LIVE DEMO',
		),
	);
}
