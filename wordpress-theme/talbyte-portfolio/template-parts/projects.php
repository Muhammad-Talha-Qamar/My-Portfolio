<?php
/**
 * Build log / projects section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d       = talbyte_defaults();
$title   = talbyte_option( 'projects_title', $d['projects_title'] );
$lead    = talbyte_option( 'projects_lead', $d['projects_lead'] );
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
		$tech = talbyte_project_meta( $pid, 'project_tech', '' );
		$projects[] = array(
			'title'       => get_the_title(),
			'highlight'   => talbyte_project_meta( $pid, 'project_highlight', '' ),
			'tag'         => talbyte_project_meta( $pid, 'project_tag', '' ),
			'description' => talbyte_project_meta( $pid, 'project_description', '' ),
			'url'         => talbyte_project_meta( $pid, 'project_url', '#' ),
			'alt'         => talbyte_project_meta( $pid, 'project_alt', get_the_title() ),
			'thumb'       => $thumb,
			'tech'        => $tech,
			'cta'         => talbyte_project_meta( $pid, 'project_cta', 'VIEW' ),
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
			'tech'        => isset( $p['tech'] ) ? $p['tech'] : '',
			'cta'         => isset( $p['cta'] ) ? $p['cta'] : 'VIEW',
		);
	}
}

$total = count( $projects );
?>
    <section class="projects site-section" id="projects" aria-label="Projects build log">
      <div class="projects__header">
        <div class="projects__header-left">
          <span class="projects__meta-label">BUILD LOG</span>
          <h2 class="projects__title"><?php echo esc_html( $title ); ?></h2>
          <p class="projects__subtitle"><?php echo talbyte_title_html( $lead, $lead_hl, 'hl' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
        </div>
        <div class="projects__controls">
          <div class="projects__nav-btns">
            <button type="button" class="projects__nav-btn" data-projects-prev aria-label="Previous projects slide">←</button>
            <button type="button" class="projects__nav-btn" data-projects-next aria-label="Next projects slide">→</button>
          </div>
        </div>
      </div>

      <div class="projects-carousel" data-projects-carousel>
        <div class="projects-viewport" data-projects-viewport tabindex="0" aria-roledescription="carousel" aria-label="Featured projects">
          <div class="projects-track" data-projects-track>
            <?php foreach ( $projects as $i => $project ) :
				$tech_items = array_filter( array_map( 'trim', explode( ',', (string) $project['tech'] ) ) );
				if ( empty( $tech_items ) ) {
					$tech_items = array( 'HTML', 'CSS', 'JavaScript' );
				}
				$num = str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT );
				$cta = ! empty( $project['cta'] ) ? $project['cta'] : 'VIEW';
				?>
            <article class="project-card">
              <div class="project-card__top">
                <span class="project-card__num"><?php echo esc_html( $num ); ?> / <?php echo esc_html( str_pad( (string) $total, 2, '0', STR_PAD_LEFT ) ); ?></span>
                <span class="project-card__tag"><?php echo esc_html( $project['tag'] ); ?></span>
              </div>
              <?php if ( ! empty( $project['thumb'] ) ) : ?>
              <a class="project-card__media" href="<?php echo esc_url( $project['url'] ); ?>" target="_blank" rel="noreferrer noopener" tabindex="-1" aria-hidden="true">
                <img src="<?php echo esc_url( $project['thumb'] ); ?>" alt="" width="720" height="450" decoding="async" <?php echo $i < 4 ? 'fetchpriority="high"' : 'loading="lazy"'; ?> />
              </a>
              <?php endif; ?>
              <div class="project-card__body">
                <h3 class="project-card__title"><?php echo esc_html( $project['title'] ); ?></h3>
                <p class="project-card__desc"><?php echo esc_html( $project['description'] ); ?></p>
              </div>
              <div class="project-card__footer">
                <div class="project-card__tech">
                  <?php foreach ( $tech_items as $tech ) : ?>
                  <span class="project-card__tech-pill"><?php echo esc_html( $tech ); ?></span>
                  <?php endforeach; ?>
                </div>
                <a class="project-card__cta" href="<?php echo esc_url( $project['url'] ); ?>" target="_blank" rel="noreferrer noopener" aria-label="<?php echo esc_attr( $cta . ' for ' . $project['title'] ); ?>">
                  <?php echo esc_html( $cta ); ?><span class="project-card__arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
            <?php endforeach; ?>
          </div>
        </div>

        <div class="projects__pager">
          <div class="projects-dots" data-projects-dots role="tablist" aria-label="Project slides"></div>
          <div class="projects-progress" aria-hidden="true">
            <span class="projects-progress-bar" data-projects-progress></span>
          </div>
        </div>
      </div>
    </section>
