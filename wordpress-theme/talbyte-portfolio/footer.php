<?php
/**
 * Theme footer.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d           = talbyte_defaults();
$brand_first = talbyte_option( 'brand_first', $d['brand_first'] );
$brand_last  = talbyte_option( 'brand_last', $d['brand_last'] );
$display     = talbyte_option( 'display_name', $d['display_name'] );
$github_url  = talbyte_option( 'github_url', $d['github_url'] );
$linkedin_url = talbyte_option( 'linkedin_url', $d['linkedin_url'] );
?>
    <footer class="footer site-section">
      <div class="footer__grid">
        <h2 class="footer__brand"><?php echo esc_html( $brand_first . ' ' . $brand_last ); ?></h2>
        <p class="footer__copy">© <span id="year"><?php echo esc_html( gmdate( 'Y' ) ); ?></span> <?php echo esc_html( $display ); ?>. All rights reserved.</p>
        <div class="footer__socials">
          <a href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
            <i class="bx bxl-github"></i>
          </a>
          <a href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
            <i class="bx bxl-linkedin"></i>
          </a>
        </div>
      </div>
    </footer>
  </div><!-- .site-shell -->

<?php wp_footer(); ?>
</body>
</html>
