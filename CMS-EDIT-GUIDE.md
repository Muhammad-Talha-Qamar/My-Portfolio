# Editing the Talbyte portfolio (WordPress)

Public site: https://talbyte.com  
Admin: https://talbyte.com/wp-admin

## Login

Use the WordPress admin account created during setup (credentials are in the private `.wp-credentials.txt` file on the machine that ran the install — change the password after first login).

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

## Theme deploys

GitHub Actions deploys **only** `wordpress-theme/talbyte-portfolio/` into `wp-content/themes/talbyte-portfolio/`. It never wipes the WordPress root or subdomain project folders.

Content edits happen in `/wp-admin` — no git commit needed for copy/media changes.
