<?php
/**
 * Hero section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d           = talbyte_defaults();
$badge       = talbyte_option( 'hero_badge', $d['hero_badge'] );
$title       = talbyte_option( 'hero_title', $d['hero_title'] );
$highlight   = talbyte_option( 'hero_highlight', $d['hero_highlight'] );
$bio         = talbyte_option( 'hero_bio', $d['hero_bio'] );
$cta_label   = talbyte_option( 'hero_cta_label', $d['hero_cta_label'] );
$cta_href    = talbyte_option( 'hero_cta_href', $d['hero_cta_href'] );
$photo       = talbyte_image_url( talbyte_option( 'hero_photo', null ), $d['hero_photo'] );
$display     = talbyte_option( 'display_name', $d['display_name'] );
?>
    <section class="hero" id="home">
      <div class="hero-backdrop" aria-hidden="true">
        <img class="hero-backdrop-img" src="<?php echo esc_url( $photo ); ?>" alt="" width="900" height="600" decoding="async" fetchpriority="high" />
        <div class="hero-backdrop-scrim"></div>
      </div>

      <div class="hero-info">
        <div class="hero-info-title">
          <i class="bx bxl-sketch"></i>
          <?php echo esc_html( $badge ); ?>
        </div>

        <h1 class="hero-title" data-split>
          <?php echo talbyte_title_html( $title, $highlight ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        </h1>

        <p>
          <?php echo esc_html( $bio ); ?>
        </p>

        <a class="hero-btn" href="<?php echo esc_url( $cta_href ); ?>" data-magnetic><i class="bx bx-send"></i> <?php echo esc_html( $cta_label ); ?></a>
      </div>

      <a class="scroll-down" href="#about" aria-label="Scroll to about"></a>
    </section>
