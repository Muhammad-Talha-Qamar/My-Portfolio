<?php
/**
 * Hero section — ashithmk-inspired composition with name overlapping the photo.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d          = talbyte_defaults();
$role       = talbyte_option( 'hero_role', $d['hero_role'] );
$line1      = talbyte_option( 'hero_name_line1', $d['hero_name_line1'] );
$line2_raw  = (string) talbyte_option( 'hero_name_line2', $d['hero_name_line2'] );
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

$line2_has_period = str_ends_with( $line2_raw, '.' );
$line2            = $line2_has_period ? rtrim( $line2_raw, '.' ) : $line2_raw;
$stat_count       = count( $stats );
?>
    <section class="hero" id="home" aria-label="Hero section" style="--parallax-hero-photo: 0px; --parallax-hero-backlayer: 0px; --parallax-hero-text: 0px;">
      <div class="hero__top-bar">
        <div class="hero__top-left">
          <div class="hero__role-badge"><span><?php echo esc_html( $role ); ?></span></div>
          <span class="hero__role-bar" aria-hidden="true"></span>
        </div>
      </div>

      <div class="hero__main-container">
        <aside class="hero__left-rail" aria-hidden="true">
          <div class="hero__rail-line"></div>
          <div class="hero__rail-words">
            <span class="hero__rail-word">PEOPLE</span>
            <span class="hero__rail-word">IDEAS</span>
            <span class="hero__rail-word">TECHNOLOGY</span>
            <span class="hero__rail-word">IMPACT</span>
          </div>
          <div class="hero__rail-scroll">
            <span class="hero__scroll-text">SCROLL DOWN</span>
            <span class="hero__scroll-dot"></span>
          </div>
        </aside>

        <div class="hero__composition">
          <div class="hero__photo-wrapper">
            <div class="hero__card-backlayer" aria-hidden="true"></div>
            <div class="hero__photo-card">
              <img class="hero__photo-img" src="<?php echo esc_url( $photo ); ?>" alt="<?php echo esc_attr( $display ); ?>" width="687" height="1024" decoding="async" fetchpriority="high" />
              <div class="hero__photo-grain" aria-hidden="true"></div>
            </div>
          </div>

          <div class="hero__word-ashith-wrap">
            <h1 class="hero__word-ashith"><?php echo esc_html( $line1 ); ?></h1>
          </div>

          <div class="hero__word-mk-wrap">
            <span class="hero__word-mk"><?php echo esc_html( $line2 ); ?><?php if ( $line2_has_period ) : ?><span class="hero__period">.</span><?php endif; ?></span>
            <div class="hero__role-tag">
              <span class="hero__role-tag-line" aria-hidden="true"></span>
              <span class="hero__role-tag-text"><?php echo esc_html( $subtitle ); ?></span>
            </div>
          </div>

          <div class="hero__info-col">
            <div class="hero__stats-strip" aria-label="Key statistics" role="list">
              <?php foreach ( $stats as $i => $stat ) : ?>
              <div class="hero__stat-item" role="listitem">
                <span class="hero__stat-num<?php echo ( isset( $stat['num'] ) && $stat['num'] === '∞' ) ? ' hero__stat-num--inf' : ''; ?>"><?php echo esc_html( isset( $stat['num'] ) ? $stat['num'] : '' ); ?></span>
                <span class="hero__stat-label"><?php echo esc_html( isset( $stat['label'] ) ? $stat['label'] : '' ); ?></span>
              </div>
              <?php if ( $i < $stat_count - 1 ) : ?>
              <div class="hero__stat-divider" aria-hidden="true"></div>
              <?php endif; ?>
              <?php endforeach; ?>
            </div>

            <div class="hero__cta-row">
              <a class="hero__btn-work" href="<?php echo esc_url( $cta_href ); ?>">
                <span><?php echo esc_html( $cta_label ); ?></span>
                <span class="hero__btn-arrow" aria-hidden="true">→</span>
              </a>
              <a class="hero__link-talk" href="<?php echo esc_url( $talk_href ); ?>">
                <span><?php echo esc_html( $talk_label ); ?></span>
                <span class="hero__btn-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
