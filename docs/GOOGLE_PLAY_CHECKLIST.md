# Google Play Checklist

## Development Environment

- Install Node.js 22+.
- Install Android Studio 2025.2.1 or newer for Capacitor 8.
- Install Android SDK platform API 24+; target the current stable API when publishing.
- Confirm `node`, `npm`, and Android Studio work locally.

## Android Project

- Add Capacitor Android platform after the first web build works.
- Lock portrait orientation.
- Set app id/package name.
- Set version code and version name.
- Add app icon and splash screen.
- Avoid unnecessary Android permissions.
- Test on at least one emulator and one physical Android phone if possible.

## Store Assets

- App name.
- Short description.
- Full description.
- App icon.
- Feature graphic.
- Phone screenshots.
- Privacy policy URL.
- Contact email.

## Release Build

- Create signing key and store it outside the repo.
- Build signed `.aab`.
- Upload to internal testing first.
- Verify install, launch, save/load, offline income, and app resume.

## Before Ads Or Billing

- Create Google Play Console app.
- Add privacy policy.
- Complete Data Safety section.
- Add test users.
- Add AdMob only when rewarded ad design is ready.
- Add Google Play Billing only when products are designed and tested.

