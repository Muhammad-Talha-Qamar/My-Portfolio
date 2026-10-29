# Editing the Talbyte portfolio (WordPress)

Public site: https://talbyte.com  
Admin: https://talbyte.com/wp-admin

## What to edit where

| Want to change… | Go to… |
|---|---|
| Brand name, logo, SEO, email, GitHub/LinkedIn, background video | **Portfolio Settings** |
| Hero badge, headline, bio, CTA, photo | **Portfolio Settings → Hero** |
| About section title & cards | **Portfolio Settings → About** |
| Projects section title / lead | **Portfolio Settings → Projects section** |
| Skills panels & icons | **Portfolio Settings → Skills** |
| Contact copy & form labels | **Portfolio Settings → Contact** |
| Project cards in the carousel | **Projects** (left menu) |

## Projects

1. Open **Projects → Add New**.
2. Set **title**, **Tag**, **Description**, **Project URL**, **Title highlight words** (comma-separated for gradient), and **Featured Image**.
3. Use **Order** (menu order) to control carousel order (lower = earlier).
4. Publish.

## Notes

- Install **Advanced Custom Fields** (free) and activate it so Portfolio Settings fields appear.
- Theme assets under `assets/images` and `assets/videos` are used as defaults until you upload replacements in Media Library / Portfolio Settings.
- Contact form destination email comes from **Portfolio Settings → Contact email**.
- Deploy only updates `wp-content/themes/talbyte-portfolio/` — never wipe the WordPress root.
