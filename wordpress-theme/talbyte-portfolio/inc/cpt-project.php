<?php
/**
 * Projects custom post type.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', 'talbyte_register_project_cpt' );

/**
 * Register portfolio_project CPT.
 */
function talbyte_register_project_cpt() {
	register_post_type(
		'portfolio_project',
		array(
			'labels'       => array(
				'name'          => __( 'Projects', 'talbyte-portfolio' ),
				'singular_name' => __( 'Project', 'talbyte-portfolio' ),
				'add_new_item'  => __( 'Add New Project', 'talbyte-portfolio' ),
				'edit_item'     => __( 'Edit Project', 'talbyte-portfolio' ),
				'menu_name'     => __( 'Projects', 'talbyte-portfolio' ),
			),
			'public'       => true,
			'has_archive'  => false,
			'show_in_rest' => true,
			'menu_icon'    => 'dashicons-portfolio',
			'supports'     => array( 'title', 'thumbnail', 'page-attributes' ),
			'rewrite'      => array( 'slug' => 'project' ),
		)
	);
}
