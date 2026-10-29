<?php
/**
 * Projects carousel section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d     = talbyte_defaults();
$title = talbyte_option( 'projects_title', $d['projects_title'] );
$lead  = talbyte_option( 'projects_lead', $d['projects_lead'] );
$lead_hl = talbyte_option( 'projects_lead_highlight', $d['projects_lead_highlight'] );

$query = new WP_Query(
	array(
		'post_type'      => 'portfolio_project',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
		'orderby'        => array(
			'menu_order' => 'ASC',
			'date'       => 'ASC',
		),
	)
);

$projects = array();
if ( $query->have_posts() ) {
	while ( $query->have_posts() ) {
		$query->the_post();
		$pid   = get_the_ID();
		$thumb = '';
		if ( has_post_thumbnail( $pid ) ) {
			$thumb = get_the_post_thumbnail_url( $pid, 'large' );
		}
		if ( ! $thumb ) {
			$fallback = get_post_meta( $pid, '_talbyte_thumb', true );
			$thumb    = $fallback ? talbyte_asset( $fallback ) : '';
		}
		$projects[] = array(
			'title'       => get_the_title(),
			'highlight'   => talbyte_project_meta( $pid, 'project_highlight', '' ),
			'tag'         => talbyte_project_meta( $pid, 'project_tag', '' ),
			'description' => talbyte_project_meta( $pid, 'project_description', '' ),
			'url'         => talbyte_project_meta( $pid, 'project_url', '#' ),
			'alt'         => talbyte_project_meta( $pid, 'project_alt', get_the_title() ),
			'thumb'       => $thumb,
		);
	}
	wp_reset_postdata();
}

if ( empty( $projects ) ) {
	foreach ( talbyte_default_projects() as $p ) {
		$projects[] = array(
			'title'       => $p['title'],
			'highlight'   => $p['highlight'],
			'tag'         => $p['tag'],
			'description' => $p['description'],
			'url'         => $p['url'],
			'alt'         => $p['alt'],
			'thumb'       => talbyte_asset( $p['thumb'] ),
		);
	}
}
?>
    <section class="my-project" id="projects">
      <h1 class="section-title" data-aos="fade-down" data-aos-duration="900" data-reveal data-split><?php echo esc_html( $title ); ?></h1>
      <p class="projects-lead" data-aos="fade-up" data-aos-duration="800">
        <?php echo talbyte_title_html( $lead, $lead_hl ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </p>

      <div class="projects-carousel" data-projects-carousel data-aos="fade-up" data-aos-duration="900">
        <div class="projects-viewport" data-projects-viewport tabindex="0" aria-roledescription="carousel" aria-label="Featured projects">
          <div class="projects-track" data-projects-track>
            <?php foreach ( $projects as $project ) : ?>
            <article class="project-card">
              <a class="project-vidbox" href="<?php echo esc_url( $project['url'] ); ?>" target="_blank" rel="noreferrer noopener">
                <img class="project-thumb--gaze" src="<?php echo esc_url( $project['thumb'] ); ?>" alt="<?php echo esc_attr( $project['alt'] ); ?>" loading="lazy" />
                <div class="hover-sign"><span>View</span></div>
              </a>
              <div class="project-info">
                <p class="project-tag"><?php echo esc_html( $project['tag'] ); ?></p>
                <h2 class="project-title"><?php echo talbyte_title_html( $project['title'], $project['highlight'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></h2>
                <p><?php echo esc_html( $project['description'] ); ?></p>
              </div>
            </article>
            <?php endforeach; ?>
          </div>
        </div>

        <div class="projects-controls">
          <button type="button" class="projects-nav projects-nav--prev" data-projects-prev aria-label="Previous projects">
            <i class="bx bx-chevron-left" aria-hidden="true"></i>
          </button>

          <div class="projects-pager">
            <div class="projects-dots" data-projects-dots role="tablist" aria-label="Project slides"></div>
            <div class="projects-progress" aria-hidden="true">
              <span class="projects-progress-bar" data-projects-progress></span>
            </div>
          </div>

          <button type="button" class="projects-nav projects-nav--next" data-projects-next aria-label="Next projects">
            <i class="bx bx-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>
