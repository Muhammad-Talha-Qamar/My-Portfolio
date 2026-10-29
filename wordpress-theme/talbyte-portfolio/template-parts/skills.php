<?php
/**
 * Skills section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d              = talbyte_defaults();
$title          = talbyte_option( 'skills_title', $d['skills_title'] );
$brain          = talbyte_image_url( talbyte_option( 'skills_brain', null ), $d['skills_brain'] );
$designer_title = talbyte_option( 'designer_title', $d['designer_title'] );
$designer_body  = talbyte_option( 'designer_body', $d['designer_body'] );
$designer_skills = preg_split( '/\r\n|\r|\n/', (string) talbyte_option( 'designer_skills', $d['designer_skills'] ) );
$coder_title    = talbyte_option( 'coder_title', $d['coder_title'] );
$coder_body     = talbyte_option( 'coder_body', $d['coder_body'] );
$coder_skills   = preg_split( '/\r\n|\r|\n/', (string) talbyte_option( 'coder_skills', $d['coder_skills'] ) );
$icons          = talbyte_option( 'skill_icons', null );
$icon_urls      = array();
if ( is_array( $icons ) && ! empty( $icons ) ) {
	foreach ( $icons as $icon ) {
		$icon_urls[] = talbyte_image_url( $icon, '' );
	}
}
if ( empty( $icon_urls ) ) {
	foreach ( $d['skill_icons'] as $path ) {
		$icon_urls[] = talbyte_asset( $path );
	}
}
$qty = count( $icon_urls );
?>
    <section class="skills-section" id="skills">
      <h1 class="section-title" data-aos="fade-down" data-aos-duration="900" data-reveal data-split><?php echo esc_html( $title ); ?></h1>

      <div class="skills-box">
        <div class="skills-stage">
          <img class="skills-image" src="<?php echo esc_url( $brain ); ?>" alt="" aria-hidden="true" data-aos="zoom-in" data-aos-duration="1100" />

          <article class="skill-panel Designer" data-tilt data-spotlight data-aos="fade-up" data-aos-duration="900" data-aos-delay="100">
            <div class="skill-panel-icon" aria-hidden="true"><i class="bx bx-laptop"></i></div>
            <h2 class="gradient" data-split><?php echo esc_html( $designer_title ); ?></h2>
            <p><?php echo esc_html( $designer_body ); ?></p>
            <ul class="skill-list">
              <?php foreach ( array_filter( array_map( 'trim', $designer_skills ) ) as $item ) : ?>
              <li><?php echo esc_html( $item ); ?></li>
              <?php endforeach; ?>
            </ul>
          </article>

          <article class="skill-panel coder" data-tilt data-spotlight data-aos="fade-up" data-aos-duration="900" data-aos-delay="200">
            <div class="skill-panel-icon" aria-hidden="true"><i class="bx bx-code-block"></i></div>
            <h2 class="gradient" data-split><?php echo esc_html( $coder_title ); ?></h2>
            <p><?php echo esc_html( $coder_body ); ?></p>
            <ul class="skill-list">
              <?php foreach ( array_filter( array_map( 'trim', $coder_skills ) ) as $item ) : ?>
              <li><?php echo esc_html( $item ); ?></li>
              <?php endforeach; ?>
            </ul>
          </article>
        </div>

        <div class="slider" style="--width: 100px; --height: 100px; --quantity: <?php echo (int) $qty; ?>;" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="250">
          <div class="list">
            <?php foreach ( $icon_urls as $i => $url ) : ?>
            <div class="item" style="--position: <?php echo (int) ( $i + 1 ); ?>"><img src="<?php echo esc_url( $url ); ?>" alt="Skill icon <?php echo (int) ( $i + 1 ); ?>" /></div>
            <?php endforeach; ?>
          </div>
        </div>
      </div>
    </section>
