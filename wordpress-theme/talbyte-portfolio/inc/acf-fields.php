<?php
/**
 * ACF field groups and options page.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', 'talbyte_register_acf' );

/**
 * Register ACF options page and local field groups.
 */
function talbyte_register_acf() {
	if ( ! function_exists( 'acf_add_options_page' ) ) {
		return;
	}

	acf_add_options_page(
		array(
			'page_title' => __( 'Portfolio Settings', 'talbyte-portfolio' ),
			'menu_title' => __( 'Portfolio Settings', 'talbyte-portfolio' ),
			'menu_slug'  => 'talbyte-portfolio-settings',
			'capability' => 'edit_theme_options',
			'redirect'   => false,
			'icon_url'   => 'dashicons-admin-customizer',
			'position'   => 3,
		)
	);

	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	$d = talbyte_defaults();

	acf_add_local_field_group(
		array(
			'key'    => 'group_talbyte_site',
			'title'  => 'Site & Brand',
			'fields' => array(
				array( 'key' => 'field_seo_title', 'label' => 'SEO Title', 'name' => 'seo_title', 'type' => 'text', 'default_value' => $d['seo_title'] ),
				array( 'key' => 'field_seo_description', 'label' => 'SEO Description', 'name' => 'seo_description', 'type' => 'textarea', 'rows' => 2, 'default_value' => $d['seo_description'] ),
				array( 'key' => 'field_brand_first', 'label' => 'Brand first name', 'name' => 'brand_first', 'type' => 'text', 'default_value' => $d['brand_first'] ),
				array( 'key' => 'field_brand_last', 'label' => 'Brand last name', 'name' => 'brand_last', 'type' => 'text', 'default_value' => $d['brand_last'] ),
				array( 'key' => 'field_display_name', 'label' => 'Display / copyright name', 'name' => 'display_name', 'type' => 'text', 'default_value' => $d['display_name'] ),
				array( 'key' => 'field_logo', 'label' => 'Logo / portrait', 'name' => 'logo', 'type' => 'image', 'return_format' => 'array', 'preview_size' => 'medium' ),
				array( 'key' => 'field_email', 'label' => 'Contact email', 'name' => 'email', 'type' => 'email', 'default_value' => $d['email'] ),
				array( 'key' => 'field_github_url', 'label' => 'GitHub URL', 'name' => 'github_url', 'type' => 'url', 'default_value' => $d['github_url'] ),
				array( 'key' => 'field_github_label', 'label' => 'GitHub label', 'name' => 'github_label', 'type' => 'text', 'default_value' => $d['github_label'] ),
				array( 'key' => 'field_linkedin_url', 'label' => 'LinkedIn URL', 'name' => 'linkedin_url', 'type' => 'url', 'default_value' => $d['linkedin_url'] ),
				array( 'key' => 'field_linkedin_label', 'label' => 'LinkedIn label', 'name' => 'linkedin_label', 'type' => 'text', 'default_value' => $d['linkedin_label'] ),
				array( 'key' => 'field_bg_video', 'label' => 'Background video', 'name' => 'bg_video', 'type' => 'file', 'return_format' => 'url', 'mime_types' => 'mp4,webm' ),
			),
			'location' => array(
				array(
					array( 'param' => 'options_page', 'operator' => '==', 'value' => 'talbyte-portfolio-settings' ),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'    => 'group_talbyte_hero',
			'title'  => 'Hero',
			'fields' => array(
				array( 'key' => 'field_hero_badge', 'label' => 'Badge', 'name' => 'hero_badge', 'type' => 'text', 'default_value' => $d['hero_badge'] ),
				array( 'key' => 'field_hero_title', 'label' => 'Headline', 'name' => 'hero_title', 'type' => 'text', 'default_value' => $d['hero_title'] ),
				array( 'key' => 'field_hero_highlight', 'label' => 'Highlight words (comma-separated)', 'name' => 'hero_highlight', 'type' => 'text', 'default_value' => $d['hero_highlight'], 'instructions' => 'Words wrapped in the gradient span.' ),
				array( 'key' => 'field_hero_bio', 'label' => 'Bio', 'name' => 'hero_bio', 'type' => 'textarea', 'rows' => 3, 'default_value' => $d['hero_bio'] ),
				array( 'key' => 'field_hero_cta_label', 'label' => 'CTA label', 'name' => 'hero_cta_label', 'type' => 'text', 'default_value' => $d['hero_cta_label'] ),
				array( 'key' => 'field_hero_cta_href', 'label' => 'CTA link', 'name' => 'hero_cta_href', 'type' => 'text', 'default_value' => $d['hero_cta_href'] ),
				array( 'key' => 'field_hero_photo', 'label' => 'Hero photo', 'name' => 'hero_photo', 'type' => 'image', 'return_format' => 'array' ),
			),
			'location' => array(
				array(
					array( 'param' => 'options_page', 'operator' => '==', 'value' => 'talbyte-portfolio-settings' ),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'    => 'group_talbyte_about',
			'title'  => 'About',
			'fields' => array(
				array( 'key' => 'field_about_title', 'label' => 'Section title', 'name' => 'about_title', 'type' => 'text', 'default_value' => $d['about_title'] ),
				array(
					'key'          => 'field_about_cards',
					'label'        => 'About cards',
					'name'         => 'about_cards',
					'type'         => 'repeater',
					'layout'       => 'block',
					'button_label' => 'Add card',
					'sub_fields'   => array(
						array( 'key' => 'field_card_title', 'label' => 'Title', 'name' => 'title', 'type' => 'text' ),
						array( 'key' => 'field_card_body', 'label' => 'Body', 'name' => 'body', 'type' => 'textarea', 'rows' => 3 ),
						array(
							'key'           => 'field_card_type',
							'label'         => 'Card type',
							'name'          => 'type',
							'type'          => 'select',
							'choices'       => array(
								'image_cta' => 'Image + CTA',
								'image'     => 'Image only',
								'video'     => 'Globe video',
								'passion'   => 'Passion keyboard',
							),
							'default_value' => 'image',
						),
						array( 'key' => 'field_card_cta', 'label' => 'CTA label', 'name' => 'cta', 'type' => 'text' ),
						array( 'key' => 'field_card_href', 'label' => 'CTA href', 'name' => 'href', 'type' => 'text' ),
						array( 'key' => 'field_card_image', 'label' => 'Image', 'name' => 'image', 'type' => 'image', 'return_format' => 'array' ),
						array( 'key' => 'field_card_video', 'label' => 'Video', 'name' => 'video', 'type' => 'file', 'return_format' => 'url', 'mime_types' => 'mp4,webm' ),
					),
				),
			),
			'location' => array(
				array(
					array( 'param' => 'options_page', 'operator' => '==', 'value' => 'talbyte-portfolio-settings' ),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'    => 'group_talbyte_projects_section',
			'title'  => 'Projects section',
			'fields' => array(
				array( 'key' => 'field_projects_title', 'label' => 'Section title', 'name' => 'projects_title', 'type' => 'text', 'default_value' => $d['projects_title'] ),
				array( 'key' => 'field_projects_lead', 'label' => 'Lead text', 'name' => 'projects_lead', 'type' => 'textarea', 'rows' => 2, 'default_value' => $d['projects_lead'] ),
				array( 'key' => 'field_projects_lead_highlight', 'label' => 'Lead highlight words', 'name' => 'projects_lead_highlight', 'type' => 'text', 'default_value' => $d['projects_lead_highlight'] ),
			),
			'location' => array(
				array(
					array( 'param' => 'options_page', 'operator' => '==', 'value' => 'talbyte-portfolio-settings' ),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'    => 'group_talbyte_skills',
			'title'  => 'Skills',
			'fields' => array(
				array( 'key' => 'field_skills_title', 'label' => 'Section title', 'name' => 'skills_title', 'type' => 'text', 'default_value' => $d['skills_title'] ),
				array( 'key' => 'field_skills_brain', 'label' => 'Brain image', 'name' => 'skills_brain', 'type' => 'image', 'return_format' => 'array' ),
				array( 'key' => 'field_designer_title', 'label' => 'Designer title', 'name' => 'designer_title', 'type' => 'text', 'default_value' => $d['designer_title'] ),
				array( 'key' => 'field_designer_body', 'label' => 'Designer body', 'name' => 'designer_body', 'type' => 'textarea', 'rows' => 3, 'default_value' => $d['designer_body'] ),
				array( 'key' => 'field_designer_skills', 'label' => 'Designer skills (one per line)', 'name' => 'designer_skills', 'type' => 'textarea', 'rows' => 4, 'default_value' => $d['designer_skills'] ),
				array( 'key' => 'field_coder_title', 'label' => 'Coder title', 'name' => 'coder_title', 'type' => 'text', 'default_value' => $d['coder_title'] ),
				array( 'key' => 'field_coder_body', 'label' => 'Coder body', 'name' => 'coder_body', 'type' => 'textarea', 'rows' => 3, 'default_value' => $d['coder_body'] ),
				array( 'key' => 'field_coder_skills', 'label' => 'Coder skills (one per line)', 'name' => 'coder_skills', 'type' => 'textarea', 'rows' => 4, 'default_value' => $d['coder_skills'] ),
				array(
					'key'          => 'field_skill_icons',
					'label'        => 'Skill icons',
					'name'         => 'skill_icons',
					'type'         => 'gallery',
					'return_format'=> 'array',
					'preview_size' => 'thumbnail',
				),
			),
			'location' => array(
				array(
					array( 'param' => 'options_page', 'operator' => '==', 'value' => 'talbyte-portfolio-settings' ),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'    => 'group_talbyte_contact',
			'title'  => 'Contact',
			'fields' => array(
				array( 'key' => 'field_contact_title', 'label' => 'Section title', 'name' => 'contact_title', 'type' => 'text', 'default_value' => $d['contact_title'] ),
				array( 'key' => 'field_contact_lead', 'label' => 'Lead', 'name' => 'contact_lead', 'type' => 'textarea', 'rows' => 3, 'default_value' => $d['contact_lead'] ),
				array( 'key' => 'field_contact_aside', 'label' => 'Aside title', 'name' => 'contact_aside', 'type' => 'text', 'default_value' => $d['contact_aside'] ),
				array( 'key' => 'field_form_name_label', 'label' => 'Name label', 'name' => 'form_name_label', 'type' => 'text', 'default_value' => $d['form_name_label'] ),
				array( 'key' => 'field_form_email_label', 'label' => 'Email label', 'name' => 'form_email_label', 'type' => 'text', 'default_value' => $d['form_email_label'] ),
				array( 'key' => 'field_form_message_label', 'label' => 'Message label', 'name' => 'form_message_label', 'type' => 'text', 'default_value' => $d['form_message_label'] ),
				array( 'key' => 'field_form_submit', 'label' => 'Submit button', 'name' => 'form_submit', 'type' => 'text', 'default_value' => $d['form_submit'] ),
			),
			'location' => array(
				array(
					array( 'param' => 'options_page', 'operator' => '==', 'value' => 'talbyte-portfolio-settings' ),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'    => 'group_talbyte_project',
			'title'  => 'Project details',
			'fields' => array(
				array( 'key' => 'field_project_tag', 'label' => 'Tag', 'name' => 'project_tag', 'type' => 'text' ),
				array( 'key' => 'field_project_highlight', 'label' => 'Title highlight words (comma-separated)', 'name' => 'project_highlight', 'type' => 'text' ),
				array( 'key' => 'field_project_description', 'label' => 'Description', 'name' => 'project_description', 'type' => 'textarea', 'rows' => 3 ),
				array( 'key' => 'field_project_url', 'label' => 'Project URL', 'name' => 'project_url', 'type' => 'url' ),
				array( 'key' => 'field_project_alt', 'label' => 'Thumbnail alt text', 'name' => 'project_alt', 'type' => 'text' ),
			),
			'location' => array(
				array(
					array( 'param' => 'post_type', 'operator' => '==', 'value' => 'portfolio_project' ),
				),
			),
		)
	);
}
