Case study · iOS · Social networking

# Tribela: social media teens *don't have to brace for*

A safety-first social app for teens aged 13 to 16, designed and shipped on about 5% of the build budget while the brand was replaced mid-development.

Role

Sole Product Designer, end to end

Timeline

Feb 2025 to beta; App Store Dec 2025

Team

The only full-time person on the product side, in a largely part-time team

Client

Tribela GmbH, via Emerline / LeverX

![Tribela profile, discussion thread and post cards in the new brand](img/hero.webp)

- **Beta in 6 months**The beta I designed became the App Store release, now at v1.12.
- **58 → 52 tokens**A two-layer colour system let a new brand land without redesigning screens.
- **"A sense of safety"**What a teen wrote in the first App Store review, in her own words.

01 · Context

## Teens told the founder social media makes them feel unsafe

Tribela started from a founder's frustration with bullying and toxic interactions online. The research behind the pitch was blunt:

"We get creepy DMs, and there's no control."

"Instagram makes us feel bad about ourselves."

"We want to turn off triggering content but can't."

The product had to work for teens and their parents across five markets (UK, EU, US, Canada, Australia), each with its own rules on age verification and parental consent. Every post, image, video and voice note would pass through AI moderation before going live.

02 · Problem

## Safety couldn't be a settings page

Existing platforms put safety in user-side tools: filters, block buttons, privacy toggles buried three levels deep. They don't change what the product rewards. Tribela needed safety built into the default path, without feeling like a supervised playground teens would delete on day one.

03 · My role

## One designer, \~5% of the budget, and a direct line to the founder

The estimate gave UI/UX **214 of 3,965 hours**. Many user stories carried zero design hours. Most of the team was part-time, so I was the only full-time person on the product side.

I designed every flow and the design system, and I owned design communication with the founder. After every meeting I sent a written follow-up, so each agreement was documented and the whole team worked from the same decisions.

My closest daily loop was design, iOS and QA. Our QA engineer worked far beyond her allocation, and the review ran both ways: I checked the build against the designs, and she caught the edge cases I'd missed. A lot of the precision in the final specs is hers too.

![Face ID and passcode setup screens with handoff annotations](img/faceid-annotated.webp)

**Specs written for a team that wasn't always in the room.** Annotations cover the failure states and tell QA which system screens need no testing effort.

04 · Turning point

In social media, yesterday's luxury is today's baseline.

Teens compare every app to the ones they use for hours a day. An MVP that feels "minimum" gets deleted in the first minute. So the job wasn't to cut scope. It was to decide where we could not afford to be minimal, and to stay deliberately plain everywhere else.

05 · How I decided

## Meet the expectation, be a little kinder, stay inside the budget

Every screen, flow and feature started with a quick review of direct competitors. Then it went through the same three questions:

1. **Does it meet the bar?**If teens would notice it missing, it's parity, and parity isn't optional.
2. **What's our one kind twist?**Keep the expected behaviour, remove the mechanic that makes it compulsive or unsafe.
3. **Does it fit budget and timeline?**Development was cut as hard as design, so "fits" meant cheap to build, too. When something didn't fit, we simplified the twist, never the baseline.

Applied across the product, the filter produced a consistent pattern:

| Feature | The bar teens expect | Our kind twist |
| --- | --- | --- |
| Feed | Personalised, endless, algorithmic | "Your feed, your rules": pick themes and content types; no ads, no random content |
| Profile | Follower and friend counts | No counts anywhere |
| Notifications | Badges that pile up | Notifications expire after action or after a month |
| Posting | Multi-photo, audio, visibility control | Same, but affirmations default to "Only me" |
| Moderation | Silent removal | Visible status: reviewing, live, or needs revision with a way to fix |
| Video | Autoplay | No autoplay |

06 · Key decisions

## Five decisions that shaped the product

Stakeholders

### Argue for scope by retention risk, not by polish

Context

The default answer to anything new was "it's an MVP." Several features users take for granted weren't in the estimate.

Options

Ship the estimate as is and accept a bare feel · add polish everywhere and break the budget · sort features by how users would judge their absence.

Choice

I brought change requests to the founder framed as "without this, teens leave," backed by the competitor review. To confirm: which CRs were approved (pagination, photo carousel, audio posts, profile sharing?) and one you lost

Trade-off we accepted

Consciously plain where users don't look: chat on a third-party SDK, video posted as-is without an editor, tablets functional but not tailored.

Outcome

A scope that held its shape: all epics designed by May, and the MVP delivered "on time and within budget," in the founder's words.

Design system

### Map the new brand onto the tokens already in code

Context

When I joined, developers had already coded colour tokens for the old style. Then the client replaced its brand mid-development, and final colours stayed unknown until the last moment.

Options

A new token set and a refactor · reskin screen by screen · map new values onto existing semantic roles.

Choice

A two-layer system: 58 primitives feed 52 semantic tokens across 7 roles, plus radius and spacing scales. Components reference roles, never raw colours. Every mismatch between old and new was flagged and decided one by one.

Trade-off we accepted

Some brand shades had no slot. Where possible I replaced them with neutrals instead of growing the system.

Outcome

The rebrand was budgeted at 16 design hours. By May, restyling was 95% done in design while development continued in parallel.

![Old colour palette compared with the client's new brand colours](img/brand-old.webp)

**The brand we had vs. the brand we got.** Blue primary became teal; purple-tinted neutrals had no counterpart. This wasn't a tweak, it was a different colour model.

Client brand ──► 58 primitives ──► 52 semantic tokens ──► components ──► screens (changed) (values swapped) (unchanged) (unchanged) (unchanged)

![Figma variables: 52 colour tokens, 58 primitives, radius and number collections](img/token-collections.webp) ![Semantic token overview with a list of tokens not found during library swap](img/token-mapping.webp)

**The rebrand touched one layer.** Everything downstream knew roles, not colours. Unmatched tokens surfaced as a list to decide, not as bugs in QA.

Two sources of truth caused the next problem. Our iOS developer checked a hand-drawn palette board and asked why "there is no accent-700 in red." The answer lived in Figma Variables. From then on, variables were the single source and the boards became documentation.

I rolled the new brand out flow by flow. Each flow carried a status, *verified restyling* and then *ready for dev*, so restyling never blocked feature work. In the same pass I moved iconography from Material to native iOS. To confirm: SF Symbols or another set, how many icons, any without an equivalent

![Onboarding flow marked Verified Restyling and Ready for Dev](img/restyling-status.webp)

**Every flow carried a status.** The rebrand shipped flow by flow, verified before it reached developers.

Product

### Moderation status should read at a glance and never feel like punishment

Context

Every post goes through AI moderation before it's live. For a 13-year-old, the status banner is the only window into that process. A tense one makes posting feel like being judged.

Options

A dark banner: high contrast, but heavy in a calm feed, and all states look alike · a neutral surface: calm, but still indistinguishable · a surface tinted by state, built from semantic tokens.

Choice

Tint by meaning. "Needs revision" uses a warm neutral instead of red, and the copy says "needs revision," not "rejected," with a direct Edit Post action.

Trade-off we accepted

Extra surface tokens in the system, and a softer warning state than a classic red error.

Outcome

One pattern reused wherever users create content: posts, profile photos during onboarding, and chat messages.

![Three versions of the post moderation banner: dark and neutral crossed out, tinted chosen](img/moderation-banner.webp)

**Dark shouted, neutral whispered.** Tinting by meaning lets the state speak before the words do.

Trust

### Age verification where every dead end still leaves a way back

Context

Age checks run through K-ID, a third-party service, with a face scan and parental approval where the law requires it. Handoffs between two systems are where users get lost.

Choice

I designed the full journey across both sides, including the unhappy paths: a mismatch between stated age and scan leads to an appeal through support; parents approve by QR code or email; a child under 13 is told "Come back when you're 13, we'll be excited to welcome you!"

Trade-off we accepted

More screens in onboarding, the place where every extra step costs sign-ups.

Outcome

K-ID verification shipped in v1.8. To confirm: built on this flow?

![Age verification flow: date of birth, K-ID face scan, parent approval, mismatch and under-age screens](img/kid-flow.webp)

**Even "no" is an invitation.** Each outcome of the age check has a next step: continue, ask a parent, appeal, or come back later.

Safety by design

### Deliberate friction and private defaults

Context

One-tap follows and public-by-default posting are what make other platforms grow fast, and what make strangers' DMs possible.

Choice

Connecting asks "How do you know each other?" and offers an icebreaker. Affirmations default to "Only me." Notifications expire instead of piling up. Feed settings can't be emptied: at least one content type stays on.

Trade-off we accepted

Slower network growth. We chose to make connecting slower in exchange for knowing who you're talking to.

Outcome

The product later went further in the same direction: private accounts by default for under-16s (v1.7). To confirm: did the Connect flow ship, or is it post-MVP?

![Connect flow asking how two users know each other, then an icebreaker question](img/connect.webp) ![Notifications screen annotated with how long each notification stays](img/notifications.webp)

**Friction where it protects, calm where it doesn't.** Left: a connection needs context before it happens. Right: every notification type has a lifespan, so nothing nags forever.

07 · Solution

## From sign-up to first post, every step answers "am I safe here?"

The final product covers onboarding with verification, a personalised feed, posts with text, photo carousels, audio and affirmations, chat, profiles and notifications. All of it was built on one token system and one set of patterns.

![Feed personalisation flow with themes and content types](img/feed-personalisation.webp)

**Your feed, your rules.** Themes and content types replace an opaque algorithm. The store listing later used this as its headline.

![Creating a photo carousel post with visibility options](img/carousel.webp)

**Parity first.** Up to six photos and a visibility choice on every post, because teens notice when these are missing.

![Audio post preview and how it appears in the feed](img/audio.webp)

**Voice notes as posts.** Recorded live, previewed before posting, moderated like everything else.

![Affirmation creation flow with Only me selected by default](img/affirmation-flow.webp)

**Different defaults for different vulnerability.** Affirmations start as "Only me"; sharing is a choice.

![Illustrative icon set in semantic tints](img/icons.webp) ![Profile screens: another user's profile, own profile, and an empty profile prompting bio and interests](img/profile.webp)

**One visual language.** Illustrative icons use the same semantic tints as the banners. Profiles show interests, never follower counts, and an empty profile guides you to fill it in.

08 · Reality check

## My budget ended at beta, and the beta became the release

Development was cut as hard as design, and the build drifted from the designs in places. My contract ended at beta, while implementation was still catching up. After that, the only voice design had was what I'd left behind: the token system, verified flows and annotated edge cases.

The chat shows the cost. The third-party SDK saved weeks of development, but it broke parity exactly where teens notice: a single emoji rendered small, and a photo couldn't carry a caption. The founder caught both in beta. An SDK is a design decision too, and its limits belong on the parity checklist before it's chosen.

09 · Impact

## Shipped, and it feels the way we meant it to

![App Store rating 5.0 from 3 ratings and a review praising the app's sense of safety](img/appstore-review.webp)

> "I really like the sense of safety this app gives me. It feels like a cozy and comfortable space to chat with friends."App Store review, January 2026

- Idea to beta in 6 months, every epic designed, brand replaced mid-build.
- The beta I designed shipped as the public release on 1 December 2025, and the product has since reached v1.12 on the same system.
- Features from the original scope kept shipping after launch: sharing, age verification, the Mentor badge.
- The store tagline is built around the feed I designed: "Choose what you want to see, not what an algorithm decides."

[See Tribela on the App Store](https://apps.apple.com/ge/app/tribela-social-reimagined/id6743228772) · [Read the agency's case study](https://emerline.com/portfolio/mobile-social-platform-with-ai-assisted-moderation)

10 · Reflection

## Design has to survive without its designer

A tiny design budget stayed honest because of one rule: parity first, kindness second, polish last. The part I'd change is the end. Design and development were budgeted separately and both were cut, so nobody owned the gap between them. Next time I'd put design QA into the estimate through release, not just through handoff. A cheap design built wrong costs more than an expensive one built right.

Thanks to the founder of Tribela for the trust, and to our iOS developer and QA engineer, who carried this with me. Add names with their permission

Tribela · 2025 · Product design by Yuliya Babkina