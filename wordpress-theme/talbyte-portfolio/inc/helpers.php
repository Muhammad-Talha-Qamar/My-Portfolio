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
 * Theme asset URL.
 *
 * @param string $path Relative path under assets/.
 * @return string
 */
function talbyte_asset( $path ) {
	$path = ltrim( $path, '/' );
	$webp = preg_replace( '/\.(png|jpe?g)$/i', '.webp', $path );
	if ( $webp && $webp !== $path ) {
		$webp_file = get_template_directory() . '/assets/' . $webp;
		if ( file_exists( $webp_file ) ) {
			return get_template_directory_uri() . '/assets/' . $webp;
		}
	}
	return get_template_directory_uri() . '/assets/' . $path;
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
 * Wrap highlight words in a title with <span class="gradient">.
 *
 * @param string $title     Plain title.
 * @param string $highlight Comma-separated words/phrases to highlight.
 * @return string Safe HTML.
 */
function talbyte_title_html( $title, $highlight = '' ) {
	$title = (string) $title;
	if ( $highlight === '' ) {
		return esc_html( $title );
	}
	$parts = array_filter( array_map( 'trim', explode( ',', $highlight ) ) );
	$result = esc_html( $title );
	foreach ( $parts as $part ) {
		$safe = esc_html( $part );
		if ( $safe === '' ) {
			continue;
		}
		$result = preg_replace(
			'/' . preg_quote( $safe, '/' ) . '/u',
			'<span class="gradient">' . $safe . '</span>',
			$result,
			1
		);
	}
	return $result;
}

/**
 * Default portfolio content (matches the pre-WordPress static site).
 *
 * @return array<string,mixed>
 */
function talbyte_defaults() {
	return array(
		'seo_title'       => 'Muhammad Talha Qamar | Portfolio',
		'seo_description' => 'Muhammad Talha Qamar — frontend developer portfolio.',
		'brand_first'     => 'Talha',
		'brand_last'      => 'Qamar',
		'display_name'    => 'Muhammad Talha Qamar',
		'email'           => 'm.talha.qamar.1st@gmail.com',
		'github_url'      => 'https://github.com/Muhammad-Talha-Qamar',
		'github_label'    => 'Muhammad-Talha-Qamar',
		'linkedin_url'    => 'https://www.linkedin.com/in/m-talha-qamar-96765b435/',
		'linkedin_label'  => 'Talha Qamar',
		'logo_fallback'   => 'images/main.jpg',
		'bg_video'        => 'videos/galaxy.mp4',

		'hero_badge'      => 'Front-end Developer Portfolio',
		'hero_title'      => 'Providing the best Project Experience',
		'hero_highlight'  => 'the best,Experience',
		'hero_bio'        => "I'm Muhammad Talha Qamar — a frontend developer passionate about building modern, interactive, and responsive websites with HTML, CSS, and JavaScript.",
		'hero_cta_label'  => 'Contact Me',
		'hero_cta_href'   => '#contact',
		'hero_photo'      => 'images/main.jpg',

		'about_title'     => 'Hello, There',
		'about_cards'     => array(
			array(
				'title' => "Hi there, I'm Talha",
				'body'  => 'Frontend developer focused on clean layouts, responsive design, and interactive web experiences built with HTML, CSS, and JavaScript.',
				'cta'   => 'Contact Me',
				'href'  => '#contact',
				'image' => 'images/main.jpg',
				'type'  => 'image_cta',
			),
			array(
				'title' => 'Tech Stack',
				'body'  => 'I work with semantic HTML5, modern CSS (Flexbox, Grid, animations), JavaScript ES6+, and Git & GitHub for version control.',
				'image' => 'images/grid2.png',
				'type'  => 'image',
			),
			array(
				'title' => 'Open to learning, building & shipping',
				'body'  => 'Always exploring new frontend techniques and ready to collaborate on creative web projects.',
				'video' => 'videos/glob.mp4',
				'type'  => 'video',
			),
			array(
				'title' => 'My Passion for Coding',
				'body'  => "I love solving problems and building things through code. Programming isn't just a skill — it's how I turn ideas into polished, interactive websites people enjoy using.",
				'image' => 'images/grid4.png',
				'type'  => 'passion',
			),
		),

		'projects_title'  => 'My Projects',
		'projects_lead'   => 'Live builds on talbyte.com subdomains — clones, product sites, and apps.',
		'projects_lead_highlight' => 'talbyte.com',

		'skills_title'    => 'My Skills',
		'skills_brain'    => 'images/digital-brain.png',
		'designer_title'  => 'Designer',
		'designer_body'   => 'Expertise in HTML, CSS layouts, visual hierarchy, and responsive interfaces that feel polished on every screen size.',
		'designer_skills' => "HTML & CSS\nResponsive UI\nVisual hierarchy",
		'coder_title'     => 'Coder',
		'coder_body'      => 'Skilled in JavaScript (ES6+), DOM work, Git & GitHub, and building interactive experiences that ship cleanly.',
		'coder_skills'    => "JavaScript ES6+\nDOM & interactivity\nGit & GitHub",
		'skill_icons'     => array(
			'images/1.png',
			'images/2.png',
			'images/3.webp',
			'images/4.webp',
			'images/5.png',
			'images/6.png',
			'images/7.png',
			'images/8.png',
			'images/9.png',
		),

		'contact_title'   => "Let's talk",
		'contact_lead'    => "Whether you're looking to build a new website, improve an existing platform, or bring a unique project to life — I'm here to help.",
		'contact_aside'   => 'Reach me directly',
		'form_name_label' => 'Full Name',
		'form_email_label'=> 'Email Address',
		'form_message_label' => 'Your Message',
		'form_submit'     => 'Send Message',
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
			'title'       => 'Dual Cop',
			'highlight'   => 'Dual Cop',
			'tag'         => 'Web Game',
			'description' => 'Getaway driving game with nitro, heat, and split-screen play.',
			'url'         => 'https://dual-cop.talbyte.com/',
			'thumb'       => 'images/thumbs/dual-cop.jpg',
			'alt'         => 'Dual Cop Game homepage',
		),
		array(
			'title'       => 'SMIT Portal',
			'highlight'   => 'Portal',
			'tag'         => 'Education',
			'description' => 'Saylani Mass IT Training site with courses and enrollment flow.',
			'url'         => 'https://smit.talbyte.com/',
			'thumb'       => 'images/thumbs/smit.jpg',
			'alt'         => 'SMIT homepage',
		),
		array(
			'title'       => 'BYD Dolphin Surf',
			'highlight'   => 'BYD',
			'tag'         => 'Product',
			'description' => 'Ocean Series EV landing with hero storytelling and model pages.',
			'url'         => 'https://byd.talbyte.com/',
			'thumb'       => 'images/thumbs/byd.jpg',
			'alt'         => 'BYD Dolphin Surf homepage',
		),
		array(
			'title'       => 'foodpanda',
			'highlight'   => 'foodpanda',
			'tag'         => 'Clone',
			'description' => 'Food delivery UI — address search, categories, and partner flows.',
			'url'         => 'https://foodpanda.talbyte.com/',
			'thumb'       => 'images/thumbs/foodpanda.jpg',
			'alt'         => 'foodpanda homepage',
		),
		array(
			'title'       => 'Saffron Kitchen',
			'highlight'   => 'Kitchen',
			'tag'         => 'Recipes',
			'description' => 'Recipe site for appetizers, mains, drinks, and desserts.',
			'url'         => 'https://saffron-kitchen.talbyte.com/',
			'thumb'       => 'images/thumbs/saffron-kitchen.jpg',
			'alt'         => 'Saffron Kitchen homepage',
		),
		array(
			'title'       => 'KFC Ordering',
			'highlight'   => 'KFC',
			'tag'         => 'Web App',
			'description' => 'Menu browsing, buckets, merch, and reorder-style checkout UI.',
			'url'         => 'https://kfc.talbyte.com/',
			'thumb'       => 'images/thumbs/kfc.jpg',
			'alt'         => 'KFC web app homepage',
		),
		array(
			'title'       => 'Mirage Works',
			'highlight'   => 'Works',
			'tag'         => 'Business',
			'description' => 'Accounting & outsourcing brand site with solutions and insight.',
			'url'         => 'https://mirage-works.talbyte.com/',
			'thumb'       => 'images/thumbs/mirage-works.jpg',
			'alt'         => 'Mirage Works homepage',
		),
		array(
			'title'       => 'OLX Clone',
			'highlight'   => 'OLX',
			'tag'         => 'Marketplace',
			'description' => 'Buy & sell classifieds — categories, search, and listing flows.',
			'url'         => 'https://olx.talbyte.com/',
			'thumb'       => 'images/thumbs/olx.jpg',
			'alt'         => 'OLX homepage',
		),
		array(
			'title'       => 'Systems Limited',
			'highlight'   => 'Systems',
			'tag'         => 'Corporate',
			'description' => 'IT consulting & AI transformation corporate landing experience.',
			'url'         => 'https://systems-website.talbyte.com/',
			'thumb'       => 'images/thumbs/systems-website.jpg',
			'alt'         => 'Systems Limited homepage',
		),
		array(
			'title'       => 'LifePilot',
			'highlight'   => 'LifePilot',
			'tag'         => 'App',
			'description' => 'Private tasks & checklists app with account-based sign-in.',
			'url'         => 'https://lifepilot.talbyte.com/',
			'thumb'       => 'images/thumbs/lifepilot.jpg',
			'alt'         => 'LifePilot homepage',
		),
	);
}
