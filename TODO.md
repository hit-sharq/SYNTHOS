# TODO

## Known limitations

- **Build does not fail on type or lint errors.** `next.config.js` sets
  `ignoreDuringBuilds: true` for both. Several runtime bugs reached production
  this way. Turning this off is the single highest-value change here.
- **Quote inherits intake imprecision.** A low-confidence intake now holds the
  proposal for review, but the quote still auto-generates from the same thin
  input.
- **`aiMissing` is ignored.** The intake AI reports what the form omitted;
  nothing acts on it.
- **`Client.company` is a display string** alongside the authoritative
  `Client.companyId`. Harmless but redundant.
- **`role: client` covers two audiences** — employer and project contact. The
  dashboards branch on `companyId`; this will not scale if someone is both.
- **Verification has two paths.** An admin can toggle `verified` directly or
  approve a business registration. Only the latter implies documents.
- **No rate limiting or CSRF protection** on any endpoint.
- **Job report endpoint** was rebuilt as a moderation queue; the admin review
  screen has no bulk actions.

## Follow-ups

- Backfill `clerkId` for any user created before `0bdf12b`. One account
  (`leeroyjoshu087@gmail.com`) is linked; others may still be unlinkable.
- Migrate `Project.client` text to the new `companyId`/`clientId` links and
  drop the duplicate column.
- Add tests for `lib/auto-workflow.ts`. It is the core value prop and is
  untested.
- Notification on company approval, so the company learns it was verified.
- `public/icons/pos-icon-*.png` are 1×1 transparent stubs. Unused; safe to
  delete.

## Done

Previously tracked mobile responsiveness work (12 items) was completed and
removed from this list.