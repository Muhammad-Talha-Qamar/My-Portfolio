<?php
/**
 * Contact section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d              = talbyte_defaults();
$title          = talbyte_option( 'contact_title', $d['contact_title'] );
$lead           = talbyte_option( 'contact_lead', $d['contact_lead'] );
$aside          = talbyte_option( 'contact_aside', $d['contact_aside'] );
$email          = talbyte_option( 'email', $d['email'] );
$github_url     = talbyte_option( 'github_url', $d['github_url'] );
$linkedin_url   = talbyte_option( 'linkedin_url', $d['linkedin_url'] );
$name_label     = talbyte_option( 'form_name_label', $d['form_name_label'] );
$email_label    = talbyte_option( 'form_email_label', $d['form_email_label'] );
$message_label  = talbyte_option( 'form_message_label', $d['form_message_label'] );
$submit         = talbyte_option( 'form_submit', $d['form_submit'] );
?>
    <section class="contact site-section" id="contact" aria-label="Contact">
      <div class="contact__grid">
        <div class="contact__left">
          <div class="contact__head">
            <span class="contact__section-num">05</span>
            <h2 class="contact__title"><?php echo esc_html( $title ); ?></h2>
            <p class="contact__desc"><?php echo esc_html( $lead ); ?></p>
          </div>

          <div class="contact__icons-dock contact__icons-dock--desktop">
            <div class="contact__icons-dock-inner">
              <a class="contact__icon-btn" href="mailto:<?php echo esc_attr( $email ); ?>" aria-label="Email Muhammad Talha Qamar">
                <i class="bx bxs-envelope"></i>
              </a>
              <a class="contact__icon-btn" href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="GitHub profile">
                <i class="bx bxl-github"></i>
              </a>
              <a class="contact__icon-btn" href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn profile">
                <i class="bx bxl-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="contact__right">
          <div class="contact__card-header">
            <span class="contact__card-num">01</span>
            <div class="contact__card-title-group">
              <span class="contact__card-icon" aria-hidden="true"><i class="bx bx-mail-send"></i></span>
              <h3 class="contact__card-title"><?php echo esc_html( $aside ); ?></h3>
            </div>
            <span class="contact__card-accent-bar" aria-hidden="true"></span>
          </div>

          <form class="contact__form" id="contact-form" novalidate>
            <div class="contact__input-group">
              <label class="visually-hidden" for="name"><?php echo esc_html( $name_label ); ?></label>
              <input class="contact__input" id="name" name="name" placeholder="<?php echo esc_attr( $name_label ); ?>" type="text" autocomplete="name" required />
            </div>
            <div class="contact__input-group">
              <label class="visually-hidden" for="email"><?php echo esc_html( $email_label ); ?></label>
              <input class="contact__input" id="email" name="email" placeholder="<?php echo esc_attr( $email_label ); ?>" type="email" autocomplete="email" required />
            </div>
            <div class="contact__input-group">
              <label class="visually-hidden" for="message"><?php echo esc_html( $message_label ); ?></label>
              <textarea class="contact__input" id="message" name="message" placeholder="<?php echo esc_attr( $message_label ); ?>" rows="5" required></textarea>
            </div>

            <input class="contact-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <p class="contact-status" id="contact-status" role="status" aria-live="polite" hidden></p>

            <button class="contact__submit" type="submit" id="contact-submit">
              <?php echo esc_html( $submit ); ?>
              <span class="contact__submit-arrow" aria-hidden="true">→</span>
            </button>
          </form>

          <div class="contact__icons-dock contact__icons-dock--mobile">
            <div class="contact__icons-dock-inner">
              <a class="contact__icon-btn" href="mailto:<?php echo esc_attr( $email ); ?>" aria-label="Email Muhammad Talha Qamar">
                <i class="bx bxs-envelope"></i>
              </a>
              <a class="contact__icon-btn" href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="GitHub profile">
                <i class="bx bxl-github"></i>
              </a>
              <a class="contact__icon-btn" href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn profile">
                <i class="bx bxl-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
