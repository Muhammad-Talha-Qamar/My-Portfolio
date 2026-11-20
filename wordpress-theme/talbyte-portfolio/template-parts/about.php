<?php
/**
 * About section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d          = talbyte_defaults();
$tag        = talbyte_option( 'about_tag', $d['about_tag'] );
$headline   = talbyte_option( 'about_headline', $d['about_headline'] );
$slot_raw   = talbyte_option( 'about_slot_words', $d['about_slot_words'] );
$slot_words = array_values( array_filter( array_map( 'trim', explode( ',', (string) $slot_raw ) ) ) );
if ( empty( $slot_words ) ) {
	$slot_words = array( 'products', 'websites', 'interfaces', 'experiences' );
}
$para_1    = talbyte_option( 'about_para_1', $d['about_para_1'] );
$para_1_hl = talbyte_option( 'about_para_1_hl', $d['about_para_1_hl'] );
$para_2    = talbyte_option( 'about_para_2', $d['about_para_2'] );
$para_2_hl = talbyte_option( 'about_para_2_hl', $d['about_para_2_hl'] );
$facts     = talbyte_option( 'about_facts', null );
if ( ! is_array( $facts ) || empty( $facts ) ) {
	$facts = $d['about_facts'];
}
?>
    <section class="about site-section" id="about" aria-label="About Muhammad Talha Qamar">
      <div class="about__container">
        <div class="about__grid">
          <div class="about__col about__col-left">
            <div class="about__tag">
              <span class="about__tag-label"><?php echo esc_html( $tag ); ?></span>
              <span class="about__tag-slash" aria-hidden="true">/</span>
            </div>
            <h2 class="about__headline">
              <?php echo esc_html( $headline ); ?>
              <span class="about__line about__line--slot">
                <span class="about__slot" data-about-slot data-words="<?php echo esc_attr( implode( ',', $slot_words ) ); ?>"><?php echo esc_html( $slot_words[0] ); ?></span>.
              </span>
            </h2>
          </div>

          <div class="about__col about__col-right">
            <div class="about__story">
              <p class="about__para"><?php echo talbyte_highlight_html( $para_1, $para_1_hl ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
              <p class="about__para"><?php echo talbyte_highlight_html( $para_2, $para_2_hl ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
            </div>

            <div class="about__facts">
              <?php foreach ( $facts as $fact ) : ?>
              <div class="about__fact-item">
                <small><?php echo esc_html( isset( $fact['label'] ) ? $fact['label'] : '' ); ?></small>
                <strong><?php echo esc_html( isset( $fact['value'] ) ? $fact['value'] : '' ); ?></strong>
              </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
      </div>
    </section>
