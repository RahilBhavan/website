# Internship openings list

Requested November 11, 2026: a searchable internship list Rahil can share with his club, then put on this website.

- `/tools/internships`: search by company or role, filter by field, term and location, sort by check date, deadline or company. Filters are kept in the address, so a filtered view can be shared as a link.
- `/internships`: short link (redirect in `vercel.json`).
- `/tools/internships/data.json`: the list itself.

The page is not linked from the site navigation and carries `noindex`, because it is meant to be shared directly with club members rather than found by search.

## What is published

Only public posting facts: company, role, location, term, field, listed deadline, listed pay, the employer posting link, whether it came from an employer job board or a public list, and the date it was last seen open. Only roles last seen open are included.

The list is generated from Rahil's private internship dashboard by `exports/internship-club-dashboard/build.py` in the operations hub. That builder drops eligibility judgments, resumes, notes, scores and application history, excludes roles that came from Rahil's email and referral links, and strips tracking parameters from links. Field labels come from the source lists and are approximate.

The page does not update itself. To refresh it, rebuild from the hub and commit the two files:

```sh
python3 exports/internship-club-dashboard/build.py --site <website>/public/tools/internships
```

Design owner: QSL Route 5.0.0, as for `/tools/token-efficiency`. Existing site pages keep their current styling. Scripts and styles are inline; fonts are the site's licensed Archivo and IBM Plex Mono files.

Checks and the exact-artifact review are recorded in `review.json`.
