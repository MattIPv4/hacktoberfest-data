# Hacktoberfest 2022 Stats

Hi there, 👋

I'm [Matt Cowley](https://mattcowley.co.uk/), Senior Software Engineer I at
[DigitalOcean](https://digitalocean.com/).

I work on a bunch of things at DigitalOcean, with a great mix of engineering, developer relations
and community management. And, part of what I get to work on is helping out with Hacktoberfest,
including being the lead engineer for the backed that powers the event.

Welcome to my deeper dive on the data and stats for Hacktoberfest 2022, expanding on
what we already shared in our [recap blog post](https://www.digitalocean.com/blog/hacktoberfest-2021-recap).

## At a glance

What did we accomplish together in October 2022?
These are the highlights from Hacktoberfest #9:

- Registered users: **146,891**
- Engaged users (1-3 accepted PR/MRs): **11,152**
- Completed users (4+ accepted PR/MRs): **55,390**
- Accepted PR/MRs: **335,175**
- Active repositories (1+ accepted PR/MRs): **53,308**
- Countries represented by registered users: **194**
- Countries represented by completed users: **152**

> Take a read of our overall recap blog post for Hacktoberfest 2022 here:
> [www.digitalocean.com/blog/hacktoberfest-2021-recap](https://www.digitalocean.com/blog/hacktoberfest-2021-recap)

## Application states

Before jumping in and looking at the data in detail, we should first cover some important
information about how we categorise users and pull/merge requests in the Hacktoberfest application
and in the data used here.

For users, there are four key states that you'll see:

- **Completed**: A user that submitted four or more accepted PR/MRs during Hacktoberfest.
- **Engaged**: A user that submitted between one and three accepted PR/MRs during Hacktoberfest.
- **Registered**: A user that completed the registration flow for Hacktoberfest, but did not submit
  any PR/MRs that were accepted.
- **Disqualified**: A user that was disqualified for submitting 2 or more spammy PR/MRs,
  irrespective of how many accepted PR/MRs they may have also had.

For pull/merge requests, there are six states used to process them that you'll see:

- **Accepted**: A PR/MR that was accepted by a project maintainer, either by being merged or
  approved in a participating repository, or by being given the `hacktoberfest-accepted` label.
- **Not accepted**: Any PR/MR that was submitted to a participating repository (having the
  `hacktoberfest` topic), but that was not actively accepted by a maintainer.
- **Not participating**: Any PR/MR that was submitted by a participant to a repository that was not
  participating in Hacktoberfest (i.e. having the `hacktoberfest` topic, or adding the
  `hacktoberfest-accepted` label to specific PRs).
- **Invalid**: Any PR/MR that was given a label containing the word `invalid` by a maintainer. Any
  PR/MR with a matching label was not counted towards a participant's total.
- **Spam**: Any PR/MR that was given a label by a maintainer containing the 'spam', or PR/MRs that 
  our abuse logic detected as spam. These are not counted toward winning, and also count toward a
  user being disqualified.
- **Excluded**: Any PR/MR that was submitted to a repository that has been excluded from
  Hacktoberfest for not following our values. These do not count toward winning, nor do they count
  toward a user being disqualified.

## Diving in: Users

This year, Hacktoberfest had **146,891** folks who went through our
registration flow for the event. Spam has been a huge focus for us throughout the event, as with
last year, and so during this flow folks were reminded about our rules and values for the event with
clear and simple language, as well as agreeing to a rule that folks with two or more PRs identified
as spam by maintainers would be disqualified. More on this later.

During the registration flow, folks can also choose to tell us which country they are from--this
helps us better understand, and cater to, the global audience for the event--and
**83.92%** of
them did so.

<p style="display: flex; justify-content: space-evenly;">
  <img src="generated/users_completions_top_countries_bar.png" width="40%" alt="Bar chart of the top countries for completed users" style="margin: 1em;" />
  <img src="generated/users_registrations_top_countries_bar.png" width="40%" alt="Bar chart of the top countries for all registered users" style="margin: 1em;" />
</p>

The top country, by far, was once again India with
**69,744
(47.48%)** registrants
self-identifying as being from there, showing how much of a reach open-source, and tech in general,
has there.

We can see the true global reach of Hacktoberfest and open-source by looking at more of the top
countries based on registrations:


1. India: 69,744 (47.48%)

2. United States: 8,622 (5.87%)

3. Brazil: 6,184 (4.21%)

4. Indonesia: 4,590 (3.12%)

5. Germany: 3,022 (2.06%)

6. Nigeria: 2,344 (1.60%)

7. Pakistan: 2,069 (1.41%)

8. United Kingdom: 2,021 (1.38%)

9. Sri Lanka: 1,801 (1.23%)

10. Canada: 1,695 (1.15%)


In total, **194 countries** were represented by folks
that registered for the 2022 event.

We can also look at just the users that completed Hacktoberfest, and see how the countries are
distributed for those users:


1. India: 28,134 (50.79%)

2. United States: 2,299 (4.15%)

3. Brazil: 2,121 (3.83%)

4. Indonesia: 1,548 (2.79%)

5. Germany: 1,170 (2.11%)

6. Sri Lanka: 882 (1.59%)

7. Pakistan: 714 (1.29%)

8. United Kingdom: 665 (1.20%)

9. Nepal: 604 (1.09%)

10. Canada: 541 (0.98%)


<img src="generated/users_by_state_doughnut.png" width="40%" alt="Doughnut diagram of users by application state" align="right" style="margin: 1em;" />

Of course, there's more to Hacktoberfest than just registering for the event, folks actually submit
PR/MRs to open-source projects! This year, we had
**66,542
users
(45.30%
of total registrations)** that submitted one or more PR/MRs that were accepted by maintainers.
Of those, **55,390
(83.24%)
(37.71% of total registrations)** went on
to submit at least four accepted PR/MRs to successfully complete Hacktoberfest.

Impressively, we saw that **25,862 users
(46.69% of total
completed)** submitted more than 4 accepted PR/MRs, going above and beyond to contribute to
open-source outside the goal set for completing Hacktoberfest.

Sadly, 142 users were disqualified this year
(0.10% of total registrations), with
an additional 680
(0.46% of total registrations) warned.
Disqualification of users happen automatically if two or more of their PR/MRs are actively
identified as spam by project maintainers, with users being sent a warning email (and shown a notice
on their profile) when they have one PR/MR that is identified as spam. We were very happy to see how
low this number was though, indicating to us that our efforts to educate and remind contributors of
the quality standards expected of them during Hacktoberfest are working. _(Of course, we can only
report on what we see in our data here, and do acknowledge that folks may have received spam that
wasn't flagged so won't be represented in our reporting)._

Hacktoberfest supported multiple providers this year, GitHub & GitLab. Registrants could choose to
link just one provider to their account, or multiple if they desired, with contributions from each
provider combined into a single record for the user.

Based on this we can take a look at the most popular providers for open-source based on some
Hacktoberfest-specific metrics. First, we can see that based on registrations, **the most popular
provider was GitHub with
146,281 registrants
(99.58%).**


1. GitHub: 146,281
  (99.58% of registered users)

2. GitLab: 1,958
  (1.33% of registered users)


_Users were able to link one or more providers to their account, so the counts here may sum to more
than the total number of users registered._

We can also look at a breakdown of users that were engaged (1-3 accepted PR/MRs) and users that
completed Hacktoberfest (4+ PR/MRs) by provider.

Engaged users by provider:


- GitHub: 11,121
  (99.72% of engaged users)

- GitLab: 180
  (1.61% of engaged users)


Completed users by provider:


- GitHub: 55,281
  (99.80% of completed users)

- GitLab: 801
  (1.45% of completed users)


<img src="generated/users_registrations_experience_level_bar.png" width="40%" alt="Bar chart of users by experience level" align="right" style="margin: 1em;" />

When registering for Hacktoberfest, we also asked users for some optional self-identification around
their experience with contributing to open-source, and how they intended to contribute. First, we
can take a look at the experience level users self-identified as having when registering:


- Newbie: 82,197
  (55.96% of registered users)

- Familiar: 43,899
  (29.89% of registered users)

- Experienced: 17,559
  (11.95% of registered users)


_3,236 users did not self-identify their experience level._

We can compare this to the breakdown of users that completed Hacktoberfest by experience level:


- Newbie: 25,722
  (46.44% of completed users)

- Familiar: 19,303
  (34.85% of completed users)

- Experienced: 9,113
  (16.45% of completed users)


_1,252 users who completed Hacktoberfest did not
self-identify their experience when registering._

Not everyone is comfortable writing code, and so Hacktoberfest focused on encouraging more
contributors to get involved with open-source this year through non-code contributors. We can look
at what contribution types users indicated they intended to make during Hacktoberfest when
registering (they could pick multiple, or none):


- Code: 137,895
  (93.88% of registered users)

- Non-code: 79,565
  (54.17% of registered users)


_Of course, this is only what users indicated they intended to do, and doesn't necessarily reflect
their actual contributions they ended up making to open-source (determining what is and what isn't
a "non-code" PR/MR would be a difficult task)._

This year for Hacktoberfest, users had to submit PR/MRs to participating projects during
October that then had to be accepted by maintainers during October. If a user submitted four or
more PR/MRs, then they completed Hacktoberfest. However, not everyone hits the 4 PR/MR target, with
some falling short, and many going beyond the target to contribute further.

We can see how many accepted PR/MRs each user had and bucket them:


- 1
  PR/MR: 6,692
  (12.08%)

- 2
  PRs/MRs: 2,877
  (5.19%)

- 3
  PRs/MRs: 1,620
  (2.92%)

- 4
  PRs/MRs: 29,590
  (53.42%)

- 5
  PRs/MRs: 11,237
  (20.29%)

- 6
  PRs/MRs: 5,166
  (9.33%)

- 7
  PRs/MRs: 2,598
  (4.69%)

- 8
  PRs/MRs: 1,906
  (3.44%)

- 9
  PRs/MRs: 1,177
  (2.12%)

- 10+
  PRs/MRs: 3,778
  (6.82%)


Looking at this, we can see that quite a few users only managed to get 1 accepted PR/MR, but
after that it quickly trailed off for 2 and 3 PR/MRs. It seems like the target of 4 PR/MRs
encouraged many users to push through to getting all 4 PR/MRs created/accepted if they got that
first one completed.

![Bar chart of users by accepted PR/MRs](generated/users_by_prs_extended_column.png)

## Diving in: Pull/Merge Requests

<img src="generated/prs_by_state_doughnut.png" width="40%" alt="Doughnut diagram of PR/MRs by application state" align="right" style="margin: 1em;" />

Now on to what you've been waiting for, and the core of Hacktoberfest itself, the pull/merge
requests. This year Hacktoberfest tracked **573,169** PR/MRs that were within
the bounds of the Hacktoberfest event, and **335,175
(58.48%)** of those went on to be accepted!

Unfortunately, not every pull/merge request can be accepted though, for one reason or another, and
this year we saw that there were **50,398
(8.79%)** PR/MRs that were submitted to
participating repositories but that were not accepted by maintainers, as well as
**114,267
(19.94%)** PR/MRs submitted by
Hacktoberfest participants to repositories that were not participating in Hacktoberfest. As a
reminder to folks, repositories opt-in to participating in Hacktoberfest by adding the
`hacktoberfest` topic to their repository (or individual PR/MRs can be opted-in with the
`hacktoberfest-accepted` label)!

Spam is also a big issue that we focus on reducing during Hacktoberfest, and we tracked the number
of PR/MRs that were identified by maintainers as spam, as well as those that were caught by
automation we'd written to stop spammy users. We'll talk more about all-things-spam later on.

This year, Hacktoberfest supported multiple providers that contributors could use to submit
contributions to open-source projects. Let's take a look at the breakdown of PR/MRs per provider:


1. GitHub: 571,100
  (99.64% of total PR/MRs)

2. GitLab: 2,069
  (0.36% of total PR/MRs)


PRs and MRs that are accepted by maintainers for Hacktoberfest aren't necessarily merged --
Hacktoberfest supports multiple different ways for a maintainer to indicate that a PR/MR is
legitimate and should be counted. PR/MRs can be merged, or they can be given the
`hacktoberfest-accepted` label, or maintainers can leave an overall approving review.

Of the accepted PR/MRs, **326,470
(97.40%)** were merged into the
repository, and **62,400
(18.62%)** were approved by a
maintainer. Note that there may be overlap here, as a PR/MR may have been approved and then merged.
Unfortunately, we don't have direct aggregated data for the `hacktoberfest-accepted` label.

With this many accepted PRs, we can also take a look at some interesting averages determined from
the accepted PR/MRs. The average accepted PR/MR...

- ...contained **2.5 commits**
- ...added/edited/removed **10.5 files**
- ...made a total of **1,203.47 additions** _(lines)_
- ...included **536.68 deletions** _(lines)_

_Note that lines containing edits will be counted as both an addition and a deletion._

We can also take a look at all the different languages that we observed during Hacktoberfest. These
are based on the primary language reported for the repository, and the number of accepted
Hacktoberfest PRs that were submitted to that repository. Unfortunately, GitLab does not expose
language information via their API, so this only considers GitHub PRs.


1. C++: 47,973
  (14.31% of all accepted PRs)

2. JavaScript: 40,995
  (12.23% of all accepted PRs)

3. Python: 40,804
  (12.17% of all accepted PRs)

4. HTML: 38,896
  (11.60% of all accepted PRs)

5. Java: 25,254
  (7.53% of all accepted PRs)

6. TypeScript: 20,842
  (6.22% of all accepted PRs)

7. Jupyter Notebook: 19,206
  (5.73% of all accepted PRs)

8. CSS: 11,267
  (3.36% of all accepted PRs)

9. C: 9,585
  (2.86% of all accepted PRs)

10. PHP: 7,509
  (2.24% of all accepted PRs)


<img src="generated/prs_by_day_bar.png" width="40%" alt="Bar chart of accepted PR/MRs by most popular days" align="right" style="margin: 1em;" />

Hacktoberfest happens throughout the month of October, with participants allowed to submit
pull/merge requests at any point from October 1 - 31 in any timezone. However, there tends to be
large spikes in submitted PR/MRs towards the start and end of the month as folks are reminded to
get them in to count! Let's take a look at the most popular days during Hacktoberfest by accepted
PR/MR creation this year:


1. 2022-10-01: 17,411
  (5.19% of all accepted PRs)

2. 2022-10-31: 14,029
  (4.19% of all accepted PRs)

3. 2022-10-02: 12,810
  (3.82% of all accepted PRs)

4. 2022-10-09: 12,277
  (3.66% of all accepted PRs)

5. 2022-10-03: 11,682
  (3.49% of all accepted PRs)

6. 2022-10-18: 11,539
  (3.44% of all accepted PRs)

7. 2022-10-10: 11,529
  (3.44% of all accepted PRs)

8. 2022-10-04: 11,414
  (3.41% of all accepted PRs)

9. 2022-10-11: 11,369
  (3.39% of all accepted PRs)

10. 2022-10-12: 11,347
  (3.39% of all accepted PRs)

11. 2022-10-05: 11,150
  (3.33% of all accepted PRs)

12. 2022-10-08: 10,933
  (3.26% of all accepted PRs)

13. 2022-10-17: 10,428
  (3.11% of all accepted PRs)

14. 2022-10-13: 10,418
  (3.11% of all accepted PRs)

15. 2022-10-19: 10,262
  (3.06% of all accepted PRs)


## Diving in: Spam

After the issues Hacktoberfest faced at the start of the 2020 event, spam was top of mind for our
whole team this year as we planned and launched Hacktoberfest 2022. We kept the rules
the same as we'd landed on last year, with Hacktoberfest being an opt-in event for repositories, and
our revised standards on quality contributions to make it easier for participants to understand
what is expected of them when contributing to open source as part of Hacktoberfest.

**Our efforts to reduce spam can be seen in our data, with only 982
(0.17%) pull/merge requests being flagged as spam by
maintainers (or identified as spam by our automated logic).** _(Of course, we can only report on
what we see in our data here, and do acknowledge that folks may have received spam that wasn't
flagged so won't be represented in our reporting)._

We also took a stronger stance on excluding repositories reported by the community that did not
align with our values, mostly repositories encouraging low effort contributions to allow folks to
quickly win Hacktoberfest. Pull/merge requests to a repository that had been excluded from
Hacktoberfest, based on community reports, would not be counted for winning Hacktoberfest (but also
would not count against individual users in terms of disqualification).

**Excluded repositories accounted for a much larger swathe of pull/merge requests during
Hacktoberfest, with 68,495
(11.95%) being discounted due to being submitted
to an excluded repository.**

If we plot all pull/merge requests during Hacktoberfest by day, broken down by state, the impact
that excluded repositories had can be seen clearly, and also shows that there are significant spikes
at the start and end of Hacktoberfest as folks trying to cheat the system tend to do so as
Hacktoberfest launches and its on their mind, or when they get our reminder email that Hacktoberfest
is ending soon:

![Stacked area plot of PR/MRs by created at day and state](generated/prs_by_state_stacked.png)

For transparency, we can also take a look at the excluded repositories we processed for
Hacktoberfest 2022. A large part of this list was prior excluded repositories from
previous Hacktoberfest years which were persisted across to this year. However, a form was available
on the site for members of our community to report repositories that they felt did not follow our
values, with automation in place to process these reports and exclude repositories that were
repeatedly reported, as well as reports being reviewed by our team.

In total, Hacktoberfest 2022 had 2,305 repositories
that were actively excluded, 43.23%
of the total repositories reported. Only 63 repositories were
permitted after having been reported and subsequently reviewed by our team. Unfortunately,
2,964
(55.59%) of the repositories that
were reported by the community were never reviewed by our team, and did not meet a threshold that
triggered any automation for exclusion.

![Doughnut diagram of reported repositories by review state](generated/repos_reported_doughnut.png)

## Wrapping up

Well, that's all the stats I've generated from the Hacktoberfest 2022 raw data -- you
can find the raw output of the stats generation script in the
[`generated/stats.txt`](generated/stats.txt) file, as well as all the graphics which are housed in
[`generated`](generated) directory.

If there is anything more you'd like to see/know, please feel free to reach out and ask, I'll be
more than happy to generate it if possible.

All the scripts used to generate these stats & graphics are contained in this repository, in the
[`src`](src) directory. I have some more information about this in the
[CONTRIBUTING.md](CONTRIBUTING.md) file, including a schema for the input data, however, the
Hacktoberfest 2022 raw data, much like previous years' data, isn't public.

Author: [Matt Cowley](https://mattcowley.co.uk/) - If you notice any errors within this document
please let me know, and I will endeavour to correct them. 💙
