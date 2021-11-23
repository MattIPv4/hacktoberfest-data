# Hacktoberfest 2021 Stats

Hi there, 👋

I'm [Matt Cowley](https://mattcowley.co.uk/), Community Platform Manager at
[DigitalOcean](https://digitalocean.com/).

I work on a bunch of things at DigitalOcean, with a great mix of engineering, developer relations
and community management. And, part of what I get to work on is helping out with Hacktoberfest,
including being the lead engineer for the backed that powers the event.

Welcome to my deeper dive on the data and stats for Hacktoberfest 2021, expanding on what we already
shared in our [recap blog post](TODO).

## At a glance

What did we accomplish together in October 2021? These are the highlights from Hacktoberfest #8:

- Registered users: **{{= c(data.readme.registeredUsers) }}**
- Completed users: **{{= c(data.readme.completedUsers) }}**
- Accepted PRs/MRs: **{{= c(data.readme.acceptedPRs) }}**
- Active repositories (1+ accepted PRs/MRs): **{{= c(data.readme.activeRepos) }}**
- Countries represented by registered users: **{{= c(data.readme.countriesRegistered) }}**
- Countries represented by completed users: **{{= c(data.readme.countriesCompleted) }}**

> Take a read of our overall recap blog post for Hacktoberfest 2021 here:
> [TODO](TODO)

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

This year, Hacktoberfest had **{{= c(data.Users.totalUsers) }}** folks who went through our
registration flow for the event. Spam has been a huge focus for us throughout the event, and so
during this flow folks were reminded about our rules and values for the event with clear and simple
language, as well as agreeing to a new rule for this year that folks with two or more PRs identified
as invalid or spam by maintainers would be disqualified. More on this later.

During the registration flow folks can also choose to tell us which country they are from--this
helps us better understand, and cater to, the global audience for the event--and
**{{= p((data.Users.totalUsers - data.Users.totalUsersNoCountry) / data.Users.totalUsers) }}** of
them did so.

| - | - |
|---|---|
| ![Bar chart of the top countries for completed users](generated/users_completions_top_countries_bar.png) | ![Bar chart of the top countries for all registered users](generated/users_registrations_top_countries_bar.png) |

The top country, by far, was once again {{= data.Users.totalUsersByCountry[0][0] }} with
**{{= c(data.Users.totalUsersByCountry[0][1]) }}
({{= p(data.Users.totalUsersByCountry[0][1] / data.Users.totalUsers) }})** registrants
self-identifying as being from there, showing how much of a reach open-source, and tech in general,
has there.

We can see the true global reach of Hacktoberfest and open-source by looking more of the top
countries based on registrations:

{{~ data.Users.totalUsersByCountry.slice(0, 10) :item:i }}
{{= i + 1 }}. {{= item[0] }}: {{= c(item[1]) }} ({{= p(item[1] / data.Users.totalUsers) }})
{{~ }}

In total, **{{= c(data.Users.totalUsersByCountry.length) }} countries** were represented by folks
that registered for the 2021 event.

Of course, there's more to Hacktoberfest than just registering for the event, folks actually submit
PRs/MRs to open-source projects! This year, we had
**{{= c(data.Users.totalUsersCompleted + data.Users.totalUsersEngaged) }}
users
({{= p((data.Users.totalUsersCompleted + data.Users.totalUsersEngaged) / data.Users.totalUsers) }}
of total registrations)** that submitted one or more PRs/MRs that were accepted by maintainers.
Of those, **{{= c(data.Users.totalUsersCompleted) }}
({{= p(data.Users.totalUsersCompleted / (data.Users.totalUsersCompleted + data.Users.totalUsersEngaged)) }})
({{= p(data.Users.totalUsersCompleted / data.Users.totalUsers) }} of total registrations)** went on
to submit at least four accepted PRs/MRs to successfully complete Hacktoberfest.

![Doughnut diagram of users by application state](generated/users_by_state_doughnut.png)

Hacktoberfest supported multiple providers this year, GitHub & GitLab. Registrants could choose to
link just one provider to their account, or multiple if they desired, with contributions from each
provider combined into a single record for the user.

<!-- TODO: Registration, engagement & completed split by provider -->

<!-- TODO: Users by number of accepted PRs/MRs -->

## Diving in: Pull/Merge Requests

<!-- TODO -->

## Diving in: Spam

After the issues Hacktoberfest faced at the start of the 2020 event, spam was top of mind for our
whole team this year as we planned and launched Hacktoberfest 2021. We kept the rules the same as
we'd landed on last year, with Hacktoberfest being an opt-in event for repositories, and we revised
our standards on quality contributions to make it easier for participants to understand what is
expected of them when contributing to open source as part of Hacktoberfest.

**Our efforts to reduce spam can be seen in our data, with only {{= c(data.PRs.totalSpamPRs) }}
({{= p(data.PRs.totalSpamPRs / data.PRs.totalPRs) }}) of pull/merge requests being
flagged as spam or invalid by maintainers.** _(Of course, we can only report on what we see in our
data here, and do acknowledge that folks may have received spam that wasn't flagged so won't be
represented in our reporting)._

We also took a stronger stance on excluding repositories reported by the community that did not
align with our values, mostly repositories encouraging low effort contributions to allow folks to
quickly win Hacktoberfest. Pull/merge requests to a repository that was reviewed and excluded by our
team, based on community reports, would not be counted for winning Hacktoberfest but also would not
count against individual users.

**Excluded repositories accounted for a much larger swathe of pull/merge requests during
Hacktoberfest, with {{= c(data.PRs.totalExcludedPRs) }}
({{= p(data.PRs.totalExcludedPRs / data.PRs.totalPRs) }}) being discounted due to being submitted
to an excluded repository.**

If we plot all pull/merge requests during Hacktoberfest by day, broken down by state, the impact
that excluded repositories had can be seen clearly, and also shows that there are significant spikes
at the start and end of Hacktoberfest as folks trying to cheat the system tend to do so as
Hacktoberfest launches and its on their mind, or when they get our reminder email that Hacktoberfest
is ending soon:

![Stacked area plot of PRs/MRs by created at day and state](generated/prs_by_state_stacked.png)

For transparency, we can also take a look at the excluded repositories we processed for
Hacktoberfest 2021. A large part of this list was prior excluded repositories from Hacktoberfest
2020 which were persisted across to this year. However, a form was available on the site for
members of our community to report repositories that they felt did not follow our values, and our
team would then process the top reported ones and decide if they should be excluded.

In total, Hacktoberfest 2021 had {{= c(data.Repos.totalReposExcluded) }} repositories that were
actively excluded, {{= p(data.Repos.totalReposExcluded / data.Repos.totalReposReported) }} of the
total repositories reported. Only {{= c(data.Repos.totalReposPermitted) }} repositories were
permitted after having been reported and subsequently reviewed by our team. Unfortunately,
{{= c(data.Repos.totalReposUnreviewed) }}
({{= p(data.Repos.totalReposUnreviewed / data.Repos.totalReposReported) }}) of the repositories that
were reported by the community were never reviewed by our team, but we are aiming to improve this
for Hacktoberfest 2022 with automation and a larger number of folks dedicated to reviewing these,
ensuring a more consistent high quality standard for Hacktoberfest participation.

![Doughnut diagram of reported repositories by review state](generated/repos_reported_doughnut.png)

## Wrapping up

Well, that's all the stats I've generated from the Hacktoberfest 2021 raw data -- you can find the
raw output of the stats generation script in the [`generated/stats.txt`](generated/stats.txt) file,
as well as all the graphics which are housed in [`generated`](generated) directory.

If there is anything more you'd like to see/know, please feel free to reach out and ask, I'll be
more than happy to generate it if possible.

All the scripts used to generate these stats & graphics are contained in this repository, in the
[`src`](src) directory. I have some more information about this in the
[CONTRIBUTING.md](CONTRIBUTING.md) file, including a schema for the input data, however, the
Hacktoberfest 2021 raw data, like the 2019 & 2020 data, isn't public.

Author: [Matt Cowley](https://mattcowley.co.uk/) - If you notice any errors within this document,
please let me know and I will endeavour to correct them. 💙
