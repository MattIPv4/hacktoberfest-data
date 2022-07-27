# Hacktoberfest 2021 Stats

Hi there, 👋

I'm [Matt Cowley](https://mattcowley.co.uk/), Senior Web Developer at
[DigitalOcean](https://digitalocean.com/).

I work on a bunch of things at DigitalOcean, with a great mix of engineering, developer relations
and community management. And, part of what I get to work on is helping out with Hacktoberfest,
including being the lead engineer for the backed that powers the event.

Welcome to my deeper dive on the data and stats for Hacktoberfest 2021, expanding on
what we already shared in our [recap blog post](https://www.digitalocean.com/blog/hacktoberfest-2021-recap).

## At a glance

What did we accomplish together in October 2021?
These are the highlights from Hacktoberfest #8:

- Registered users: **141,802**
- Completed users: **46,676**
- Accepted PRs/MRs: **294,451**
- Active repositories (1+ accepted PRs/MRs): **56,501**
- Countries represented by registered users: **195**
- Countries represented by completed users: **147**

> Take a read of our overall recap blog post for Hacktoberfest 2021 here:
> [www.digitalocean.com/blog/hacktoberfest-2021-recap](https://www.digitalocean.com/blog/hacktoberfest-2021-recap)

## Application states

Before jumping in and looking at the data in detail, we should first cover some important
information about how we categorise users and pull/merge requests in the Hacktoberfest application
and in the data used here.

For users, there are four key states that you'll see:

- **Completed**: A user that submitted four or more accepted PRs/MRs during Hacktoberfest.
- **Engaged**: A user that submitted between one and three accepted PRs/MRs during Hacktoberfest.
- **Registered**: A user that completed the registration flow for Hacktoberfest, but did not submit
  any PRs/MRs that were accepted.
- **Disqualified**: A user that was disqualified for submitting 2 or more spammy PRs/MRs,
  irrespective of how many accepted PRs/MRs they may have also had.

For pull/merge requests, there are five states used to process them that you'll see:

- **Accepted**: A PR/MR that was accepted by a project maintainer, either by being merged or
  approved in a participating repository, or by being given the `hacktoberfest-accepted` label.
- **Not accepted**: Any PR/MR that was submitted to a participating repository (having the
  `hacktoberfest` topic), but that was not actively accepted by a maintainer.
- **Not participating**: Any PR/MR that was submitted by a participant to a repository that was not
  participating in Hacktoberfest (i.e. having the `hacktoberfest` topic, or adding the
  `hacktoberfest-accepted` label to specific PRs).
- **Invalid/spam**: Any PR/MR that was given a label by a maintainer containing the word 'invalid'
  or 'spam'. These are not counted toward winning, but do count toward a user being disqualified.
- **Excluded**: Any PR/MR that was submitted to a repository that has been excluded from
  Hacktoberfest for not following our values. These do not count toward winning, nor do they count
  toward a user being disqualified.

## Diving in: Users

This year, Hacktoberfest had **141,802** folks who went through our
registration flow for the event. Spam has been a huge focus for us throughout the event, and so
during this flow folks were reminded about our rules and values for the event with clear and simple
language, as well as agreeing to a new rule for this year that folks with two or more PRs identified
as invalid or spam by maintainers would be disqualified. More on this later.

During the registration flow folks can also choose to tell us which country they are from--this
helps us better understand, and cater to, the global audience for the event--and
**98.55%** of
them did so.

<p style="display: flex; justify-content: space-evenly;">
  <img src="generated/users_completions_top_countries_bar.png" width="40%" alt="Bar chart of the top countries for completed users" style="margin: 1em;" />
  <img src="generated/users_registrations_top_countries_bar.png" width="40%" alt="Bar chart of the top countries for all registered users" style="margin: 1em;" />
</p>

The top country, by far, was once again India with
**71,081
(50.13%)** registrants
self-identifying as being from there, showing how much of a reach open-source, and tech in general,
has there.

We can see the true global reach of Hacktoberfest and open-source by looking at more of the top
countries based on registrations:


1. India: 71,081 (50.13%)

2. United States: 12,946 (9.13%)

3. Brazil: 6,930 (4.89%)

4. Indonesia: 5,566 (3.93%)

5. Germany: 4,148 (2.93%)

6. United Kingdom: 3,016 (2.13%)

7. Canada: 2,231 (1.57%)

8. Sri Lanka: 2,051 (1.45%)

9. France: 1,844 (1.30%)

10. Spain: 1,491 (1.05%)


In total, **194 countries** were represented by folks
that registered for the 2021 event.

We can also look at just the users that completed Hacktoberfest, and see how the countries are
distributed for those users:


1. India: 26,151 (56.03%)

2. United States: 3,332 (7.14%)

3. Indonesia: 1,942 (4.16%)

4. Brazil: 1,890 (4.05%)

5. Germany: 1,384 (2.97%)

6. Sri Lanka: 917 (1.96%)

7. United Kingdom: 882 (1.89%)

8. Canada: 622 (1.33%)

9. France: 605 (1.30%)

10. Pakistan: 477 (1.02%)


<img src="generated/users_by_state_doughnut.png" width="40%" alt="Doughnut diagram of users by application state" align="right" style="margin: 1em;" />

Of course, there's more to Hacktoberfest than just registering for the event, folks actually submit
PRs/MRs to open-source projects! This year, we had
**58,815
users
(41.48%
of total registrations)** that submitted one or more PRs/MRs that were accepted by maintainers.
Of those, **46,676
(79.36%)
(32.92% of total registrations)** went on
to submit at least four accepted PRs/MRs to successfully complete Hacktoberfest.

Impressively, we saw that **24,260 users
(51.98% of total
completed)** submitted more than 4 accepted PRs/MRs, going above and beyond to contribute to
open-source outside the goal set for completing Hacktoberfest.

Sadly, 403 users were disqualified this year
(0.28% of total registrations).
Disqualification of users happen automatically if two or more of their PRs/MRs are actively
identified as spam or invalid by project maintainers. We were very happy to see how low this number
was though, indicating to us that our efforts to educate and remind contributors of the quality
standards expected of them during Hacktoberfest are working. _(Of course, we can only report on
what we see in our data here, and do acknowledge that folks may have received spam that wasn't
flagged so won't be represented in our reporting)._

Hacktoberfest supported multiple providers this year, GitHub & GitLab. Registrants could choose to
link just one provider to their account, or multiple if they desired, with contributions from each
provider combined into a single record for the user.

Based on this we can take a look at the most popular providers for open-source based on some
Hacktoberfest-specific metrics. First, we can see that based on registrations, **the most popular
provider was GitHub with
140,941 registrants
(99.39%).**


1. GitHub: 140,941
  (99.39% of registered users)

2. GitLab: 2,050
  (1.45% of registered users)


_Users were able to link one or more providers to their account, so the counts here may sum to more
than the total number of users registered._

We can also look at a breakdown of users that were engaged (1-3 accepted PRs/MRs) and users that
completed Hacktoberfest (4+ PRs/MRs) by provider.

Engaged users by provider:


1. GitHub: 12,117
  (99.82% of engaged users)

2. GitLab: 183
  (1.51% of engaged users)


Completed users by provider:


1. GitHub: 46,586
  (99.81% of completed users)

2. GitLab: 703
  (1.51% of completed users)


This year for Hacktoberfest, users had to submit PRs/MRs to participating projects during
October that then had to be accepted by maintainers during October. If a user submitted four or
more PRs/MRs, then they completed Hacktoberfest. However, not everyone hits the 4 PR/MR target, with
some falling short, but many also going beyond the target and contributing further.

We can see how many accepted PRs/MRs each user had and bucket them:


- 1
  PR/MR: 7,039
  (15.08%)

- 2
  PRs/MRs: 3,271
  (7.01%)

- 3
  PRs/MRs: 1,887
  (4.04%)

- 4
  PRs/MRs: 22,682
  (48.59%)

- 5
  PRs/MRs: 10,399
  (22.28%)

- 6
  PRs/MRs: 4,904
  (10.51%)

- 7
  PRs/MRs: 2,729
  (5.85%)

- 8
  PRs/MRs: 1,741
  (3.73%)

- 9
  PRs/MRs: 1,065
  (2.28%)

- 10+
  PRs/MRs: 3,422
  (7.33%)


Looking at this, we can see that quite a few users only managed to get 1 accepted PR/MR, but
after that it quickly trailed off for 2 and 3 PRs/MRs. It seems like the target of 4 PRs/MRs
encouraged many users to push through to getting all 4 PRs/MRs created/accepted if they got that
first one completed.

![Bar chart of users by accepted PRs/MRs](generated/users_by_prs_extended_column.png)

## Diving in: Pull/Merge Requests

<img src="generated/prs_by_state_doughnut.png" width="40%" alt="Doughnut diagram of PRs/MRs by application state" align="right" style="margin: 1em;" />

Now on to what you've been waiting for, and the core of Hacktoberfest itself, the pull/merge
requests. This year Hacktoberfest tracked **519,987** PRs/MRs that were within
the bounds of the Hacktoberfest event, and **294,451
(56.63%)** of those went on to be accepted!

Unfortunately, not every pull/merge request can be accepted though, for one reason or another, and
this year we saw that there were **38,718
(7.45%)** PRs/MRs that were submitted to
participating repositories but that were not accepted by maintainers, as well as
**121,951
(23.45%)** PRs/MRs submitted by
Hacktoberfest participants to repositories that were not participating in Hacktoberfest. As a
reminder to folks, repositories opt-in to participating in Hacktoberfest by adding the
`hacktoberfest` topic to their repository (or individual PRs/MRs can be opted-in with the
`hacktoberfest-accepted` label)!

Spam is also a big issue that we focus on reducing during Hacktoberfest, and we tracked the number
of PRs/MRs that were identified by maintainers as spam, as well as those that were caught by
automation we'd written to stop spammy users. We'll talk more about all-things-spam later on.

This year, Hacktoberfest supported multiple providers that contributors could use to submit
contributions to open-source projects. Let's take a look at the breakdown of PRs/MRs per provider:


1. GitHub: 517,619
  (99.54% of total PRs/MRs)

2. GitLab: 2,368
  (0.46% of total PRs/MRs)


PRs and MRs that are accepted by maintainers for Hacktoberfest aren't necessarily merged --
Hacktoberfest supports multiple different ways for a maintainer to indicate that a PR/MR is
legitimate and should be counted. PRs/MRs can be merged, or they can be given the
`hacktoberfest-accepted` label, or maintainers can leave an overall approving review.

Of the accepted PRs/MRs, **283,943
(96.43%)** were merged into the
repository, and **61,895
(21.02%)** were approved by a
maintainer. Note that there may be overlap here, as a PR/MR may have been approved and then merged.
Unfortunately, we don't have direct aggregated data for the `hacktoberfest-accepted` label.

With this many accepted PRs, we can also take a look at some interesting averages determined from
the accepted PRs/MRs. The average accepted PR/MR...

- ...contained **2.76 commits**
- ...added/edited/removed **12 files**
- ...made a total of **1,643.55 additions** _(lines)_
- ...included **455.2 deletions** _(lines)_

_Note that lines containing edits will be counted as both an addition and a deletion._

We can also take a look at all the different languages that we observed during Hacktoberfest. These
are based on the primary language reported for the repository, and the number of accepted
Hacktoberfest PRs that were submitted to that repository. Unfortunately, GitLab does not expose
language information via their API, so this only considers GitHub PRs.


1. C++: 42,093
  (14.30% of all accepted PRs)

2. Python: 39,676
  (13.47% of all accepted PRs)

3. JavaScript: 37,863
  (12.86% of all accepted PRs)

4. HTML: 30,049
  (10.21% of all accepted PRs)

5. Java: 21,183
  (7.19% of all accepted PRs)

6. TypeScript: 16,010
  (5.44% of all accepted PRs)

7. Jupyter Notebook: 12,391
  (4.21% of all accepted PRs)

8. C: 9,976
  (3.39% of all accepted PRs)

9. PHP: 9,453
  (3.21% of all accepted PRs)

10. CSS: 7,591
  (2.58% of all accepted PRs)


<img src="generated/prs_by_day_bar.png" width="40%" alt="Bar chart of accepted PRs/Mrs by most popular days" align="right" style="margin: 1em;" />

Hacktoberfest happens throughout the month of October, with participants allowed to submit
pull/merge requests at any point from October 1 - 31 in any timezone. However, there tends to be
large spikes in submitted PRs/MRs towards the start and end of the month as folks are reminded to
get them in to count! Let's take a look at the most popular days during Hacktoberfest by accepted
PR/MR creation this year:


1. 2021-10-01: 23,215
  (7.88% of all accepted PRs)

2. 2021-10-02: 17,079
  (5.80% of all accepted PRs)

3. 2021-10-03: 14,162
  (4.81% of all accepted PRs)

4. 2021-10-04: 13,071
  (4.44% of all accepted PRs)

5. 2021-10-31: 12,747
  (4.33% of all accepted PRs)

6. 2021-10-05: 12,406
  (4.21% of all accepted PRs)

7. 2021-10-06: 11,414
  (3.88% of all accepted PRs)

8. 2021-10-07: 10,289
  (3.49% of all accepted PRs)

9. 2021-10-08: 9,035
  (3.07% of all accepted PRs)

10. 2021-10-30: 8,746
  (2.97% of all accepted PRs)

11. 2021-10-29: 8,541
  (2.90% of all accepted PRs)

12. 2021-10-12: 7,941
  (2.70% of all accepted PRs)

13. 2021-10-11: 7,875
  (2.67% of all accepted PRs)

14. 2021-10-19: 7,831
  (2.66% of all accepted PRs)

15. 2021-10-18: 7,662
  (2.60% of all accepted PRs)


## Diving in: Spam

After the issues Hacktoberfest faced at the start of the 2020 event, spam was top of mind for our
whole team this year as we planned and launched Hacktoberfest 2021. We kept the rules
the same as we'd landed on last year, with Hacktoberfest being an opt-in event for repositories, and
we revised our standards on quality contributions to make it easier for participants to understand
what is expected of them when contributing to open source as part of Hacktoberfest.

**Our efforts to reduce spam can be seen in our data, with only 2,157
(0.41%) of pull/merge requests being
flagged as spam or invalid by maintainers.** _(Of course, we can only report on what we see in our
data here, and do acknowledge that folks may have received spam that wasn't flagged so won't be
represented in our reporting)._

We also took a stronger stance on excluding repositories reported by the community that did not
align with our values, mostly repositories encouraging low effort contributions to allow folks to
quickly win Hacktoberfest. Pull/merge requests to a repository that was reviewed and excluded by our
team, based on community reports, would not be counted for winning Hacktoberfest but also would not
count against individual users.

**Excluded repositories accounted for a much larger swathe of pull/merge requests during
Hacktoberfest, with 62,710
(12.06%) being discounted due to being submitted
to an excluded repository.**

If we plot all pull/merge requests during Hacktoberfest by day, broken down by state, the impact
that excluded repositories had can be seen clearly, and also shows that there are significant spikes
at the start and end of Hacktoberfest as folks trying to cheat the system tend to do so as
Hacktoberfest launches and its on their mind, or when they get our reminder email that Hacktoberfest
is ending soon:

![Stacked area plot of PRs/MRs by created at day and state](generated/prs_by_state_stacked.png)

For transparency, we can also take a look at the excluded repositories we processed for
Hacktoberfest 2021. A large part of this list was prior excluded repositories from
previous Hacktoberfest years which were persisted across to this year. However, a form was available
on the site for members of our community to report repositories that they felt did not follow our
values, and our team would then process the top reported ones and decide if they should be excluded.

In total, Hacktoberfest 2021 had 1,071 repositories
that were actively excluded, 35.49%
of the total repositories reported. Only 47 repositories were
permitted after having been reported and subsequently reviewed by our team. Unfortunately,
1,900
(62.96%) of the repositories that
were reported by the community were never reviewed by our team, but we are aiming to improve this
for Hacktoberfest 2022 with automation and a larger number of folks dedicated to reviewing these,
ensuring a more consistent high quality standard for Hacktoberfest participation.

![Doughnut diagram of reported repositories by review state](generated/repos_reported_doughnut.png)

## Wrapping up

Well, that's all the stats I've generated from the Hacktoberfest 2021 raw data -- you
can find the raw output of the stats generation script in the
[`generated/stats.txt`](generated/stats.txt) file, as well as all the graphics which are housed in
[`generated`](generated) directory.

If there is anything more you'd like to see/know, please feel free to reach out and ask, I'll be
more than happy to generate it if possible.

All the scripts used to generate these stats & graphics are contained in this repository, in the
[`src`](src) directory. I have some more information about this in the
[CONTRIBUTING.md](CONTRIBUTING.md) file, including a schema for the input data, however, the
Hacktoberfest 2021 raw data, much like previous years' data, isn't public.

Author: [Matt Cowley](https://mattcowley.co.uk/) - If you notice any errors within this document
please let me know, and I will endeavour to correct them. 💙
