<?php
/**
 * Seed default projects on theme activation.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

add_action( 'after_switch_theme', 'talbyte_seed_content' );

/**
 * Create default project posts once.
 */
function talbyte_seed_content() {
	if ( get_option( 'talbyte_seeded_v1' ) ) {
		return;
	}

	$existing = get_posts(
		array(
			'post_type'      => 'portfolio_project',
			'posts_per_page' => 1,
			'post_status'    => 'any',
			'fields'         => 'ids',
		)
	);

	if ( ! empty( $existing ) ) {
		update_option( 'talbyte_seeded_v1', 1 );
		return;
	}

	$order = 0;
	foreach ( talbyte_default_projects() as $project ) {
		$post_id = wp_insert_post(
			array(
				'post_type'   => 'portfolio_project',
				'post_title'  => $project['title'],
				'post_status' => 'publish',
				'menu_order'  => $order++,
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			continue;
		}

		if ( function_exists( 'update_field' ) ) {
			update_field( 'project_tag', $project['tag'], $post_id );
			update_field( 'project_highlight', $project['highlight'], $post_id );
			update_field( 'project_description', $project['description'], $post_id );
			update_field( 'project_url', $project['url'], $post_id );
			update_field( 'project_alt', $project['alt'], $post_id );
		} else {
			update_post_meta( $post_id, 'project_tag', $project['tag'] );
			update_post_meta( $post_id, 'project_highlight', $project['highlight'] );
			update_post_meta( $post_id, 'project_description', $project['description'] );
			update_post_meta( $post_id, 'project_url', $project['url'] );
			update_post_meta( $post_id, 'project_alt', $project['alt'] );
		}

		// Store theme-relative thumb path for fallback rendering.
		update_post_meta( $post_id, '_talbyte_thumb', $project['thumb'] );
	}

	$d = talbyte_defaults();
	if ( function_exists( 'update_field' ) ) {
		foreach ( array(
			'seo_title',
			'seo_description',
			'brand_first',
			'brand_last',
			'display_name',
			'email',
			'github_url',
			'github_label',
			'linkedin_url',
			'linkedin_label',
			'hero_badge',
			'hero_title',
			'hero_highlight',
			'hero_bio',
			'hero_cta_label',
			'hero_cta_href',
			'about_title',
			'projects_title',
			'projects_lead',
			'projects_lead_highlight',
			'skills_title',
			'designer_title',
			'designer_body',
			'designer_skills',
			'coder_title',
			'coder_body',
			'coder_skills',
			'contact_title',
			'contact_lead',
			'contact_aside',
			'form_name_label',
			'form_email_label',
			'form_message_label',
			'form_submit',
		) as $key ) {
			if ( isset( $d[ $key ] ) ) {
				update_field( $key, $d[ $key ], 'option' );
			}
		}
		// Leave media fields empty so templates use theme asset defaults until uploaded in Media Library.
	}

	update_option( 'show_on_front', 'posts' );
	update_option( 'talbyte_seeded_v1', 1 );
}

/**
 * One-time: move Dual Cop to the end of the projects carousel order.
 */
add_action( 'init', 'talbyte_reorder_projects_v1', 19 );

/**
 * Sync portfolio_project menu_order to the current default project list.
 */
function talbyte_reorder_projects_v1() {
	if ( get_option( 'talbyte_projects_order_v1' ) ) {
		return;
	}

	$defaults = talbyte_default_projects();
	$order    = 0;
	$matched  = array();

	foreach ( $defaults as $project ) {
		$title = isset( $project['title'] ) ? $project['title'] : '';
		if ( $title === '' ) {
			continue;
		}

		$posts = get_posts(
			array(
				'post_type'              => 'portfolio_project',
				'post_status'            => 'any',
				'title'                  => $title,
				'posts_per_page'         => 1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		// Fallback for older WP / title query quirks.
		if ( empty( $posts ) ) {
			$all = get_posts(
				array(
					'post_type'              => 'portfolio_project',
					'post_status'            => 'any',
					'posts_per_page'         => -1,
					'fields'                 => 'ids',
					'no_found_rows'          => true,
					'update_post_meta_cache' => false,
					'update_post_term_cache' => false,
				)
			);
			foreach ( $all as $pid ) {
				if ( strcasecmp( get_the_title( $pid ), $title ) === 0 ) {
					$posts = array( $pid );
					break;
				}
			}
		}

		if ( empty( $posts ) ) {
			continue;
		}

		$post_id = (int) $posts[0];
		wp_update_post(
			array(
				'ID'         => $post_id,
				'menu_order' => $order,
			)
		);
		$matched[ $post_id ] = true;
		$order++;
	}

	// Any leftover custom projects keep going after the defaults.
	$leftovers = get_posts(
		array(
			'post_type'              => 'portfolio_project',
			'post_status'            => 'any',
			'posts_per_page'         => -1,
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'orderby'                => array(
				'menu_order' => 'ASC',
				'date'       => 'ASC',
			),
		)
	);

	foreach ( $leftovers as $pid ) {
		if ( isset( $matched[ (int) $pid ] ) ) {
			continue;
		}
		wp_update_post(
			array(
				'ID'         => (int) $pid,
				'menu_order' => $order++,
			)
		);
	}

	update_option( 'talbyte_projects_order_v1', 1 );
}

/**
 * One-time refresh of copy for the ashithmk-inspired redesign.
 */
add_action( 'init', 'talbyte_upgrade_design_v2', 20 );

/**
 * Push new default strings into ACF options (and clear obsolete card blobs).
 */
function talbyte_upgrade_design_v2() {
	if ( get_option( 'talbyte_design_v2' ) ) {
		return;
	}

	$d    = talbyte_defaults();
	$keys = array(
		'seo_title',
		'seo_description',
		'brand_first',
		'brand_last',
		'intro_text',
		'hero_role',
		'hero_name_line1',
		'hero_name_line2',
		'hero_subtitle',
		'hero_cta_label',
		'hero_cta_href',
		'hero_talk_label',
		'hero_talk_href',
		'about_tag',
		'about_headline',
		'about_slot_words',
		'about_para_1',
		'about_para_1_hl',
		'about_para_2',
		'about_para_2_hl',
		'projects_title',
		'projects_lead',
		'projects_lead_highlight',
		'skills_title',
		'skills_tagline',
		'services_title',
		'contact_title',
		'contact_lead',
		'contact_aside',
		'form_name_label',
		'form_email_label',
		'form_message_label',
		'form_submit',
	);

	foreach ( $keys as $key ) {
		if ( ! isset( $d[ $key ] ) ) {
			continue;
		}
		if ( function_exists( 'update_field' ) ) {
			update_field( $key, $d[ $key ], 'option' );
		} else {
			update_option( 'options_' . $key, $d[ $key ] );
		}
	}

	if ( function_exists( 'update_field' ) ) {
		update_field( 'hero_stats', $d['hero_stats'], 'option' );
		update_field( 'about_facts', $d['about_facts'], 'option' );
		update_field( 'skills_groups', $d['skills_groups'], 'option' );
		update_field( 'services', $d['services'], 'option' );
	}

	update_option( 'talbyte_design_v2', 1 );
}

/**
 * Admin notice pointing to Portfolio Settings.
 */
add_action( 'admin_notices', 'talbyte_admin_edit_guide' );

/**
 * Show a short edit guide once.
 */
function talbyte_admin_edit_guide() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	if ( get_user_meta( get_current_user_id(), 'talbyte_guide_dismissed', true ) ) {
		return;
	}
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || $screen->base !== 'dashboard' ) {
		return;
	}
	echo '<div class="notice notice-info is-dismissible"><p><strong>Talbyte Portfolio:</strong> Edit site copy under <a href="' . esc_url( admin_url( 'admin.php?page=talbyte-portfolio-settings' ) ) . '">Portfolio Settings</a>. Manage carousel items under <a href="' . esc_url( admin_url( 'edit.php?post_type=portfolio_project' ) ) . '">Projects</a> (drag order via Order / menu_order).</p></div>';
}
