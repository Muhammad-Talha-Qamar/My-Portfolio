<?php
/**
 * About section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d     = talbyte_defaults();
$title = talbyte_option( 'about_title', $d['about_title'] );
$cards = talbyte_option( 'about_cards', null );
if ( ! is_array( $cards ) || empty( $cards ) ) {
	$cards = $d['about_cards'];
}

$aos = array( 'fade-right', 'fade-left', 'zoom-in', 'bounce' );
$delays = array( 0, 150, 250, 350 );
?>
    <section class="info-section" id="about">
        <h1 class="section-title" data-aos="fade-down" data-aos-duration="900" data-reveal data-split><?php echo esc_html( $title ); ?></h1>
      <div class="info-cards">
        <?php foreach ( $cards as $i => $card ) :
			$type  = isset( $card['type'] ) ? $card['type'] : 'image';
			$c_title = isset( $card['title'] ) ? $card['title'] : '';
			$body  = isset( $card['body'] ) ? $card['body'] : '';
			$anim  = $aos[ $i % count( $aos ) ];
			$delay = $delays[ $i % count( $delays ) ];
			?>
        <div class="card" data-tilt data-spotlight data-aos="<?php echo esc_attr( $anim ); ?>" data-aos-duration="<?php echo $i === 3 ? '1000' : '900'; ?>" data-aos-delay="<?php echo (int) $delay; ?>">
          <h1 data-split><?php echo esc_html( $c_title ); ?></h1>
          <p><?php echo esc_html( $body ); ?></p>
          <?php if ( $type === 'image_cta' ) : ?>
          <a class="card-btn" data-magnetic href="<?php echo esc_url( isset( $card['href'] ) ? $card['href'] : '#contact' ); ?>"><i class="bx bx-send"></i> <?php echo esc_html( isset( $card['cta'] ) ? $card['cta'] : 'Contact Me' ); ?></a>
          <img src="<?php echo esc_url( talbyte_image_url( isset( $card['image'] ) ? $card['image'] : null, isset( $d['about_cards'][ $i ]['image'] ) ? $d['about_cards'][ $i ]['image'] : 'images/main.jpg' ) ); ?>" alt="<?php echo esc_attr( talbyte_option( 'display_name', $d['display_name'] ) ); ?>" />
          <?php elseif ( $type === 'image' ) : ?>
          <img src="<?php echo esc_url( talbyte_image_url( isset( $card['image'] ) ? $card['image'] : null, isset( $d['about_cards'][ $i ]['image'] ) ? $d['about_cards'][ $i ]['image'] : 'images/grid2.png' ) ); ?>" alt="<?php echo esc_attr( $c_title ); ?>" />
          <?php elseif ( $type === 'video' ) :
				$raw_video = isset( $card['video'] ) ? $card['video'] : '';
				if ( is_array( $raw_video ) && ! empty( $raw_video['url'] ) ) {
					$video = $raw_video['url'];
				} elseif ( is_string( $raw_video ) && $raw_video !== '' && ( str_starts_with( $raw_video, 'http' ) || str_starts_with( $raw_video, '/' ) ) ) {
					$video = $raw_video;
				} elseif ( is_string( $raw_video ) && $raw_video !== '' ) {
					$video = talbyte_asset( $raw_video );
				} else {
					$video = talbyte_asset( isset( $d['about_cards'][ $i ]['video'] ) ? $d['about_cards'][ $i ]['video'] : 'videos/glob.mp4' );
				}
				?>
          <div class="card-video-wrap" data-globe aria-hidden="true">
            <video data-src="<?php echo esc_url( $video ); ?>" loop muted playsinline preload="none"></video>
            <span class="globe-specular"></span>
          </div>
          <?php else : ?>
          <div class="passion-keyboard" data-passion-keys>
            <img class="passion-img" src="<?php echo esc_url( talbyte_image_url( isset( $card['image'] ) ? $card['image'] : null, isset( $d['about_cards'][ $i ]['image'] ) ? $d['about_cards'][ $i ]['image'] : 'images/grid4.png' ) ); ?>" alt="Coding passion visual" />
            <svg class="passion-keys-svg" viewBox="0 0 1000 403" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <filter id="passion-key-glow" x="-120%" y="-120%" width="340%" height="340%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="tight" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="bloom" />
                  <feMerge>
                    <feMergeNode in="bloom" />
                    <feMergeNode in="bloom" />
                    <feMergeNode in="tight" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect class="passion-key" data-key x="272" y="109" width="56" height="68" rx="14" />
              <rect class="passion-key" data-key x="353" y="109" width="56" height="68" rx="14" />
              <rect class="passion-key" data-key x="432" y="109" width="57" height="68" rx="14" />
              <rect class="passion-key" data-key x="511" y="109" width="57" height="68" rx="14" />
              <rect class="passion-key" data-key x="591" y="109" width="56" height="68" rx="14" />
              <rect class="passion-key" data-key x="272" y="189" width="137" height="68" rx="14" />
              <rect class="passion-key" data-key x="432" y="189" width="57" height="68" rx="14" />
              <rect class="passion-key" data-key x="511" y="189" width="57" height="68" rx="14" />
              <rect class="passion-key" data-key x="591" y="189" width="56" height="68" rx="14" />
              <rect class="passion-key" data-key x="671" y="189" width="56" height="68" rx="14" />
              <rect class="passion-key" data-key x="276" y="266" width="50" height="72" rx="14" />
              <rect class="passion-key" data-key x="355" y="266" width="290" height="72" rx="16" />
              <rect class="passion-key" data-key x="674" y="266" width="50" height="72" rx="14" />
            </svg>
          </div>
          <?php endif; ?>
        </div>
        <?php endforeach; ?>
      </div>
    </section>
