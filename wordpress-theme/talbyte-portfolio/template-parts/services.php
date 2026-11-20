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
$icons = array( 'code', 'layout', 'joystick', 'palette' );
?>
    <section class="services site-section" id="services" aria-label="Services section">
      <div class="services__header">
        <span class="services__section-num" data-fx="drop" data-fx-out="rise">04</span>
        <h2 class="services__title" data-fx="clip" data-fx-out="stretch" data-fx-delay="60"><?php echo esc_html( $title ); ?></h2>
      </div>

      <div class="services__grid">
        <?php foreach ( $services as $i => $service ) : ?>
        <article class="service-card" data-fx="<?php echo esc_attr( array( 'rise', 'flip-x', 'slide-left', 'zoom-blur' )[ $i % 4 ] ); ?>" data-fx-out="drift" data-fx-delay="<?php echo esc_attr( (string) ( $i * 90 ) ); ?>">
          <div class="service-card__top">
            <span class="service-card__num"><?php echo esc_html( isset( $service['num'] ) ? $service['num'] : str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
            <span class="service-card__icon" aria-hidden="true"><?php echo talbyte_icon( $icons[ $i % count( $icons ) ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
          </div>
          <h3 class="service-card__title"><?php echo esc_html( isset( $service['title'] ) ? $service['title'] : '' ); ?></h3>
          <p class="service-card__note"><?php echo esc_html( isset( $service['note'] ) ? $service['note'] : '' ); ?></p>
          <span class="service-card__accent-bar" aria-hidden="true"></span>
        </article>
        <?php endforeach; ?>
      </div>
    </section>
