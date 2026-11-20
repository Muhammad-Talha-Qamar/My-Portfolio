<?php
/**
 * Hero section — ashithmk-inspired composition.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d          = talbyte_defaults();
$role       = talbyte_option( 'hero_role', $d['hero_role'] );
$line1      = talbyte_option( 'hero_name_line1', $d['hero_name_line1'] );
$line2      = talbyte_option( 'hero_name_line2', $d['hero_name_line2'] );
$subtitle   = talbyte_option( 'hero_subtitle', $d['hero_subtitle'] );
$cta_label  = talbyte_option( 'hero_cta_label', $d['hero_cta_label'] );
$cta_href   = talbyte_option( 'hero_cta_href', $d['hero_cta_href'] );
$talk_label = talbyte_option( 'hero_talk_label', $d['hero_talk_label'] );
$talk_href  = talbyte_option( 'hero_talk_href', $d['hero_talk_href'] );
$photo      = talbyte_image_url( talbyte_option( 'hero_photo', null ), $d['hero_photo'] );
$display    = talbyte_option( 'display_name', $d['display_name'] );
$stats      = talbyte_option( 'hero_stats', null );
if ( ! is_array( $stats ) || empty( $stats ) ) {
	$stats = $d['hero_stats'];
}
?>
    <section class="hero" id="home" aria-label="Hero section">
      <div class="hero-info hero__info-col">
        <div class="hero__role-badge"><?php echo esc_html( $role ); ?></div>

        <h1 class="hero__name">
          <?php echo esc_html( $line1 ); ?>
          <span class="hero__name-accent"><?php echo esc_html( $line2 ); ?></span>
        </h1>

        <p class="hero__subtitle"><?php echo esc_html( $subtitle ); ?></p>

        <div class="hero__stats-strip" role="list">
          <?php foreach ( $stats as $stat ) : ?>
          <div class="hero__stat-item" role="listitem">
            <strong><?php echo esc_html( isset( $stat['num'] ) ? $stat['num'] : '' ); ?></strong>
            <span><?php echo esc_html( isset( $stat['label'] ) ? $stat['label'] : '' ); ?></span>
          </div>
          <?php endforeach; ?>
        </div>

        <div class="hero__cta-row">
          <a class="hero__btn-work" href="<?php echo esc_url( $cta_href ); ?>">
            <?php echo esc_html( $cta_label ); ?>
            <span class="hero__btn-arrow" aria-hidden="true">→</span>
          </a>
          <a class="hero__link-talk" href="<?php echo esc_url( $talk_href ); ?>"><?php echo esc_html( $talk_label ); ?></a>
        </div>
      </div>

      <div class="skills-video-box hero__photo-wrapper">
        <div class="hero__photo-card">
          <img class="hero__photo-img" src="<?php echo esc_url( $photo ); ?>" alt="<?php echo esc_attr( $display ); ?>" width="720" height="960" decoding="async" fetchpriority="high" />
        </div>
      </div>

      <span class="hero__leaf" style="top:12%;left:8%" aria-hidden="true"></span>
      <span class="hero__leaf" style="top:28%;right:14%" aria-hidden="true"></span>
      <span class="hero__leaf" style="top:55%;left:18%" aria-hidden="true"></span>
      <span class="hero__leaf" style="bottom:22%;right:8%" aria-hidden="true"></span>
      <span class="hero__leaf" style="bottom:12%;left:42%" aria-hidden="true"></span>
      <span class="hero__leaf" style="top:18%;left:48%" aria-hidden="true"></span>
    </section>
