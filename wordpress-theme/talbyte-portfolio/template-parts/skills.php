<?php
/**
 * Tech arsenal / skills section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d       = talbyte_defaults();
$title  = talbyte_option( 'skills_title', $d['skills_title'] );
$groups = talbyte_option( 'skills_groups', null );
if ( ! is_array( $groups ) || empty( $groups ) ) {
	$groups = $d['skills_groups'];
}
?>
    <section class="skills site-section" id="skills" aria-label="Tech Arsenal and Skills">
      <div class="skills__container">
        <div class="skills__header">
          <div class="skills__header-left">
            <h2 class="skills__title" data-fx="clip" data-fx-out="spin"><?php echo esc_html( $title ); ?></h2>
          </div>
        </div>

        <div class="skills__grid">
          <?php foreach ( $groups as $gi => $group ) :
				$items = isset( $group['items'] ) ? $group['items'] : array();
				if ( is_string( $items ) ) {
					$items = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n|,/', $items ) ) );
				}
				$fx = array( 'slide-right', 'rise', 'slide-left', 'zoom-blur' );
				?>
          <article class="skills__col" data-fx="<?php echo esc_attr( $fx[ $gi % count( $fx ) ] ); ?>" data-fx-out="skew" data-fx-delay="<?php echo esc_attr( (string) ( $gi * 90 ) ); ?>">
            <div class="skills__col-head">
              <span class="skills__num"><?php echo esc_html( isset( $group['num'] ) ? $group['num'] : '' ); ?></span>
              <h3 class="skills__col-title"><?php echo esc_html( isset( $group['title'] ) ? $group['title'] : '' ); ?></h3>
            </div>
            <ul class="skills__list">
              <?php foreach ( (array) $items as $item ) : ?>
              <li><span class="skills__pill"><?php echo esc_html( $item ); ?></span></li>
              <?php endforeach; ?>
            </ul>
          </article>
          <?php endforeach; ?>
        </div>

        <div class="skills__footer" data-fx="stretch" data-fx-out="drop">
          IDEA <span>→</span> BUILD <span>→</span> SHIP.
        </div>
      </div>
    </section>
