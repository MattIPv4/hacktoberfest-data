# Hacktoberfest 2019 Stats

Hi there, 👋

I'm [Matt Cowley](https://mattcowley.co.uk/), a community manager at [DigitalOcean](https://digitalocean.com/).\
Welcome to my stats breakdown from the [Hacktoberfest 2019](https://hacktoberfest.digitalocean.com/) raw data.

## At a glance

What did we accomplish together in October? These are the highlights from Hacktoberfest #6:

 - Pull requests from all participants: **483,127 PRs**
 - Participating repositories: **154,767 repos**
 - Participating countries, based on addresses: **142 countries**
 - Day with the most PRs: 29,742 (6%) on October 1
 - Most used license\*: MIT in 36,314 repositories (23.46%)
 - Top language: JavaScript with 89,603 PRs (18.55%)

\*_Over 50% of repositories (83,010) in Hacktoberfest had no license that GitHub could detect._

<p align="center">
    <img src="generated/prs_by_language_spline.png" width="100%" />
    <br/>
    <i>Pull requests each day for the top 10 languages during Hacktoberfest 2019</i>
</p>

## Diving in: Pull Requests

Taking a closer look at the pull requests of Hacktoberfest 2019, we can pull out some more interesting insights.
The first thing that can be done is to take a look at how the Hacktobefest-related spam was this year, and more
 importantly how much of it was identified by us, the community and maintainers.

Of the **483,127** PRs submitted during Hacktoberfest, only **23,299 (4.82%)** were identified as spam, with
 **19,587 (84.07%)** of those being in a repository that the Hacktoberfest team excluded from the competition for not
 following the shared values and **3,712 (15.93%)** being labeled as "invalid" by project maintainers.

Thank you to all those in the community who helped us by reporting repositories through the Hacktoberfest website and
 to the maintainers who spent their time reviewing pull requests and labeling spammy ones as "invalid".

<img src="generated/prs_by_language_doughnut.png" align="right" width="50%" />

From the data, based on the reported language for each repository from GitHub, we can also make a guess at the main
 language in every PR.

Here's a breakdown of the top 15 languages in Hacktoberfest PRs (there were **213 programming languages** in total):

 - JavaScript: 89,603 (18.55%)
 - Undetermined: 59,556 (12.33%)
 - Python: 58,146 (12.04%)
 - HTML: 43,206 (8.94%)
 - Java: 33,289 (6.89%)
 - C++: 29,427 (6.09%)
 - TypeScript: 20,664 (4.28%)
 - PHP: 18,647 (3.86%)
 - CSS: 16,580 (3.43%)
 - Ruby: 15,626 (3.23%)
 - Go: 15,288 (3.16%)
 - C: 14,601 (3.02%)
 - C#: 9,667 (2.00%)
 - Shell: 8,059 (1.67%)
 - Jupyter Notebook: 7,841 (1.62%)

<img src="generated/prs_by_day_bar.png" align="right" width="50%" />

We can also take a look at when the most pull requests were submitted by day during Hacktoberfest.
The data we have would suggest that Hacktoberfest 2019 made a big splash this year as over **18% of PRs were submitted
 in the first 4 days** of the competition this year.

Here's a breakdown of the busiest 10 days during the competition based on PRs opened:

 - October 1 | 29,742 (6.16%)
 - October 2 | 24,427 (5.06%)
 - October 3 | 20,155 (4.17%)
 - October 31 | 17,539 (3.63%)
 - October 4 | 16,801 (3.48%)
 - October 24 | 16,571 (3.43%)
 - October 9 | 15,822 (3.27%)
 - October 10 | 15,681 (3.25%)
 - October 23 | 15,341 (3.18%)
 - October 8 | 15,312 (3.17%)

## Diving in: Repositories

Like the pull requests, we can use the data that GitHub provides for each repository involved with Hacktoberfest to
 generate a breakdown of the most popular languages that Hacktoberfest saw.

<img src="generated/repos_by_language_doughnut.png" align="right" width="50%" />

Here's a breakdown of the top 15 languages across all the repositories:

 - JavaScript: 27,859 (18.00%)
 - Undetermined: 21,565 (13.93%)
 - Python: 18,837 (12.17%)
 - HTML: 12,858 (8.31%)
 - Java: 10,696 (6.91%)
 - C++: 7,345 (4.75%)
 - PHP: 6,539 (4.23%)
 - CSS: 5,495 (3.55%)
 - TypeScript: 5,386 (3.48%)
 - Ruby: 5,209 (3.37%)
 - Go: 4,416 (2.85%)
 - C: 4,262 (2.75%)
 - C#: 3,207 (2.07%)
 - Shell: 3,088 (2.00%)
 - Jupyter Notebook: 2,523 (1.63%)

Unfortunately, in many cases GitHub cannot identify a main language for a repository and so this is shown as
 "Undetermined" in the data we're presenting here.

Much like with the Hacktoberfest PRs, we can directly take a look at how we dealt with spam in the form of repos.
This year, Hacktoberfest had a new system in place where the community could report repositories to us, which we could
 then review and exclude if we determined they didn't follow the shared values for the competition.

This system seemed to work well, as it allowed us to identify and exclude **138 repos (0.09%)** that we decided didn't
 follow our shared values, of the **154,767 total repos** that were involved with Hacktoberfest.

We can also pull out some interesting data on the number of stars, forks & watchers that each repository has.
In the repositories involved with Hacktoberfest, the **average number stars per repo was 264** whilst the **average fork
 count was only 67** and the **average number of watchers of a repo was 16**.

<img src="generated/repos_stars_vs_forks_scatter.png" align="right" width="50%" />

Using these same attributes, we can also find the top repositories based on them:

Top repos by number of stars:

 - 306,075 | https://github.com/freeCodeCamp/freeCodeCamp
 - 247,691 | https://github.com/996icu/996.ICU
 - 151,823 | https://github.com/vuejs/vue
 - 139,136 | https://github.com/facebook/react
 - 137,038 | https://github.com/tensorflow/tensorflow

Top repos by number of forks:

 - 198,065 | https://github.com/jtleek/datasharing
 - 106,800 | https://github.com/octocat/Spoon-Knife
 - 78,385 | https://github.com/tensorflow/tensorflow
 - 67,315 | https://github.com/twbs/bootstrap
 - 61,473 | https://github.com/SmartThingsCommunity/SmartThingsPublic

Top repos by number of watchers:

 - 8,551 | https://github.com/tensorflow/tensorflow
 - 8,344 | https://github.com/freeCodeCamp/freeCodeCamp
 - 8,308 | https://github.com/EbookFoundation/free-programming-books
 - 7,216 | https://github.com/twbs/bootstrap
 - 6,841 | https://github.com/torvalds/linux

<img src="generated/repos_by_license_bar.png" align="right" width="50%" />

Another interesting bit of analysis that we can do is to take a look at the different licenses that GitHub detects for
 each repository. Whilst doing this, it became very apparent that many repositories don't use a license, with GitHub
 reporting that **over 50% of repositories had no detectable license**.

We can also do a breakdown of these to see what licenses are the most popular in the open-source space:

 - No License | 83,010  (53.64%)
 - MIT | 36,314  (23.46%)
 - Custom License | 11,089  (7.16%)
 - Apache-2.0 | 9,373  (6.06%)
 - GPL-3.0 | 6,502  (4.20%)
 - BSD-3-Clause | 1,960  (1.27%)
 - AGPL-3.0 | 1,347  (0.87%)
 - GPL-2.0 | 1,253  (0.81%)
 - MPL-2.0 | 711  (0.46%)
 - Unlicense | 476  (0.31%)

## Diving in: Users

With the user data we have, the key thing that we can take a look at is how many pull requests each participant in
 Hacktoberfest 2019 submitted.

<img src="generated/users_by_prs_column.png" align="right" width="50%" />

Of the users who submitted one or more PR (80,334), **on average they each submitted just under 6 PRs**.
Going beyond the requirement for winning Hacktoberfest, contributing to open-source even more! 🎉

Taking a look at the breakdown for the number of PRs each user in Hacktoberfest submitted, it's awesome to see so many
 submitting more than 4, which was what was needed to win swag this year:

 - 1 PR: 10,942 (7.91%)
 - 2 PRs: 5,345 (3.86%)
 - 3 PRs: 3,735 (2.70%)
 - **4 PRs: 26,787 (19.36%)**
 - 5 PRs: 11,731 (8.48%)
 - 6 PRs: 6,093 (4.40%)
 - 7 PRs: 3,458 (2.50%)
 - 8 PRs: 2,467 (1.78%)
 - 9 PRs: 1,656 (1.20%)
 - 10 PRs: 1,230 (0.89%)
 - 10+ PRs: 6,890 (4.98%)

Well, that's all the stats I've generated from the Hacktoberfest 2019 raw data.
If there is anything more you'd like to see/know, please feel free to reach out and ask, I'll be more than happy to
 generate it if possible.

All the scripts used to generate these stats & graphics are contained within this repository.
I have some more information about this in the [CONTRIBUTING.md](CONTRIBUTING.md) file, however, the Hacktoberfest 2019
 raw data isn't public currently.

<p align="center">
    <img src="generated/users_by_prs_extended_column.png" width="100%" />
    <br/>
    <i>Number of pull requests submitted by each participant during Hacktoberfest 2019</i>
</p>

Author: [Matt Cowley](https://mattcowley.co.uk/) - If you notice any errors within this document, please let me know and
 I will endeavour to correct them. 💙
