# LunaTechs Hong Kong — chapter notes

This is the Hong Kong chapter page. Founding chapter, biggest community (1,000+).
Read the root `CLAUDE.md` first for the house rules.

## This chapter
- **City:** Hong Kong · **Founders:** Hanley Leung, Jason Xu
- **Hero image:** `hero.jpg` (a real crowd/skyline shot — swap by replacing the file)
- **Wordmark lockup:** `/brand/lunatechs-hongkong.png` (shared brand art, lives on the main site)

## Editing events
`events.json` is your event list (an array). Each event:
```json
{
  "title": "Boba & Tech: …",
  "date": "2026-07-10T18:30:00+08:00",   // ISO, +08:00 for HK
  "endTime": "21:00",
  "location": "The Hive · Causeway Bay",
  "summary": "one punchy line",
  "lumaUrl": "https://luma.com/…",        // RSVP link
  "lumaGraphic": "/hongkong/assets/my-banner.jpg",  // NEW event art → put in assets/
  "photo": "/hongkong/assets/my-photo.jpg",         // past-event crowd photo (optional)
  "stats": []
}
```
- **Upcoming** events (future date) show with the wide banner; **past** events
  show the square banner + a photo. Empty upcoming → a friendly "next one's brewing".
- New event art goes in **`assets/`** and is referenced as `/hongkong/assets/…`.
  (Older migrated events point at `/events/…` art that lives on the main site — leave those.)

## Just talk to your AI
e.g. *"add our July boba & tech meetup on the 10th at The Hive, RSVP link
https://luma.com/xxxx"* — it'll add the entry to `events.json`. Then
`node scripts/build.mjs && open dist/hongkong/index.html` to preview.
