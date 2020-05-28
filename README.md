# Hour Power

Sign in with Spotify, pick a playlist, music will start on your selected device and the songs will change each minute! Neato.

[Find it on the Apple App Store](https://apps.apple.com/us/app/hour-power/id1515672448?ls=1) and [the Google Play Store](https://play.google.com/store/apps/details?id=xyz.bront.hourpower)

Built and shipped to stores within three days as part of an internal [@expo](https://github.com/expo) hackathon.

## Mockups

![Mockups](https://github.com/brentvatne/hourpower/raw/master/_static/mockups.png)

Built using [Excalidraw](https://excalidraw.com/)

## Screenshots

![iOS screenshots](https://github.com/brentvatne/hourpower/raw/master/_static/ios.png)
![Android screenshots](https://github.com/brentvatne/hourpower/raw/master/_static/android.png)

## Tools

- [Expo managed workflow](https://docs.expo.io/introduction/managed-vs-bare/) - built apps for store [using Expo build service](https://docs.expo.io/distribution/building-standalone-apps/)
- [expo-updates](https://docs.expo.io/versions/latest/sdk/updates/) for over-the-air updates.
- [@expo/google-fonts](https://github.com/expo/google-fonts) for including Google Fonts.
- [@expo/vector-icons](https://docs.expo.io/guides/icons/) and the related [icon directory](https://icons.expo.fyi/).
- [expo-auth-session](https://docs.expo.io/versions/latest/sdk/auth-session/) to authenticate with Spotify.
- Splash screens and icons were generated using [Icon Builder](https://buildicon.netlify.app/).
- [react-navigation](https://reactnavigation.org) with [createNativeStackNavigator](https://github.com/software-mansion/react-native-screens/tree/master/native-stack)
- [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) for smoothly animating device list appearance on iOS.
- [recoil](https://recoiljs.org/) via the [Naturalclar/recoil](https://github.com/Naturalclar/recoil) fork for shared state, in order to try it out in React Native (upstream support coming soon)
- [spotify-web-api-js](https://github.com/JMPerez/spotify-web-api-js) for an easy-to-use, TypeScript compatible wrapper for the Spotify API.
- [react-query](https://github.com/tannerlinsley/react-query) to make firing the API calls from components a pleasant experience.
- Minimal backend for getting access token is built using [Vercel's](https://vercel.com/) [now.sh](https://now.sh/) serverless functions.
- A bunch of other libraries for the things you'd expect them to be for, to name a few: @react-native-community/async-storage, @react-native-community/hooks, react-native-htmlview, react-native-safe-area-context

## Develop it on your machine

Ping me on Twitter [@notbrent](https://twitter.com/notbrent) if you actually want to do this and I will write instructions for you.

## License

Do whatever you want with this, I do not care.

## Prior art

I got the idea to build this from [a post on /r/reactnative](https://www.reddit.com/r/reactnative/comments/ggds8s/power_hour_playlist_my_first_react_native_app/) where someone showed off an app called Power Hour that does the same thing in different ways.