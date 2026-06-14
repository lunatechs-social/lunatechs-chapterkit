# lunatechs-chapter-<slug>

Content for the **LunaTechs {{CITY}}** chapter site (`<slug>.lunatechs.social`).

Edit your content, preview with `./dev.sh`, then **`git push` to `main`** — that's the whole job.

## How it deploys (push-to-live)
On every push to `main`, a GitHub webhook tells the LunaTechs server to pull this repo, build
it through the [Chapter Kit](https://github.com/lunatechs-social/lunatechs-chapterkit) — which
inlines the shared nav / footer / "global community" shell — and publish to
`<slug>.lunatechs.social`, live within seconds. **No S3, no GitHub Action, nothing to
configure; just push.** (Server side: the shared deploy webhook runs `deploy-chapter.sh <slug>`,
serving from nginx on the same box as the global site.)

**Full guide for chapter leaders — editing events, recaps, marketing pages, your `/links` tree, and deploy → [`DEPLOY.md`](DEPLOY.md).**
