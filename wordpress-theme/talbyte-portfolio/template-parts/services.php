<?php
/**
 * Services / what I build section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d        = talbyte_defaults();
$title    = talbyte_option( 'services_title', $d['services_title'] );
$services = talbyte_option( 'services', null );
if ( ! is_array( $services ) || empty( $services ) ) {
	$services = $d['services'];
}
$icons = array( 'bx-code-alt', 'bx-layout', 'bx-joystick', 'bx-palette' );
?>
    <section class="services site-section" id="services" aria-label="Services section">
      <div class="services__header">
        <span class="services__section-num">04</span>
        <h2 class="services__title"><?php echo esc_html( $title ); ?></h2>
      </div>

      <div class="services__grid">
        <?php foreach ( $services as $i => $service ) : ?>
        <article class="service-card">
          <div class="service-card__top">
            <span class="service-card__num"><?php echo esc_html( isset( $service['num'] ) ? $service['num'] : str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
            <span class="service-card__icon" aria-hidden="true"><i class="bx <?php echo esc_attr( $icons[ $i % count( $icons ) ] ); ?>"></i></span>
          </div>
          <h3 class="service-card__title"><?php echo esc_html( isset( $service['title'] ) ? $service['title'] : '' ); ?></h3>
          <p class="service-card__note"><?php echo esc_html( isset( $service['note'] ) ? $service['note'] : '' ); ?></p>
          <span class="service-card__accent-bar" aria-hidden="true"></span>
        </article>
        <?php endforeach; ?>
      </div>
    </section>
