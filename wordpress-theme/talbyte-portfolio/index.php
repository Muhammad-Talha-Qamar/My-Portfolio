<?php
/**
 * Fallback index — redirect to portfolio front page markup.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

get_header();
get_template_part( 'template-parts/hero' );
get_template_part( 'template-parts/about' );
get_template_part( 'template-parts/projects' );
get_template_part( 'template-parts/skills' );
get_template_part( 'template-parts/contact' );
get_footer();
