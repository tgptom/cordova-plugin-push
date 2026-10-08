# Installation

- [Installation](#installation)
  - [Installation Requirements](#installation-requirements)
    - [Cordova-Android 9.x Specifics](#cordova-android-9x-specifics)
  - [Android details](#android-details)
    - [Co-existing with Facebook Plugin](#co-existing-with-facebook-plugin)
    - [Co-existing with plugins that use Firebase](#co-existing-with-plugins-that-use-firebase)
    - [Common errors](#common-errors)
      - [Multidex](#multidex)
      - [More than one library with package name 'com.google.android.gms'](#more-than-one-library-with-package-name-comgoogleandroidgms)
  - [Browser details](#browser-details)
    - [Browser Support](#browser-support)
  - [iOS details](#ios-details)
    - [System & Cordova Requirements](#system--cordova-requirements)
    - [Bitcode](#bitcode)
    - [CocoaPods](#cocoapods)
      - [Common CocoaPod Installation issues](#common-cocoapod-installation-issues)
        - [Library not found for -lPods-Appname](#library-not-found-for--lpods-appname)
        - [Library not found for -lGoogleToolboxForMac](#library-not-found-for--lgoogletoolboxformac)
  - [Additional Resources](#additional-resources)

## Installation Requirements

| Plugin version | Cordova CLI | Cordova Android | Cordova iOS | CocoaPods |
| -------------- | ----------- | --------------- | ----------- | --------- |
| 1.0.0          | 10.0.0      | 8.0.0           | 5.1.1       | 1.8.0     |
| 2.0.0          | 10.0.0      | 8.0.0           | 6.0.0       | 1.8.0     |
| 3.0.0          | 10.0.0      | 9.0.0           | 6.0.0       | 1.8.0     |

To install from the command line:

```bash
cordova plugin add cordova-plugin-push
```

It is also possible to install via repo url directly (unstable)

or

```bash
cordova plugin add github:havesource/cordova-plugin-push
```

To configure the `SENDER_ID`, place your `google-services.json` (Android) and/or `GoogleService-Info.plist` in the root folder of your project and then add the following lines into your config.xml.

In the `platform` tag for Android add the following `resource-file` tag if you are using `cordova-android` 8.0 or greater:

E.g.

```xml
<platform name="android">
  <resource-file src="google-services.json" target="/app/google-services.json" />
</platform>
```
By default, on iOS, the plugin will register with APNS. If you want to use FCM on iOS, in the `platform` tag for iOS add the following `resource-file` tag:

```xml
<platform name="ios">
  <resource-file src="GoogleService-Info.plist" />
</platform>
```
> Note: if you are using Ionic you may need to specify the SENDER_ID variable in your package.json.

```json
  "cordovaPlugins": [
    {
      "locator": "phonegap-plugin-push"
    }
  ]
```

> Note: You need to specify the SENDER_ID variable in your config.xml if you plan on installing/restoring plugins using the prepare method. The prepare method will skip installing the plugin otherwise.

```xml
<plugin name="cordova-plugin-push" spec="2.0.0" />
```

### Cordova-Android 9.x Specifics

**Using AndroidX Library:**

As of version **3.0.0**, this plugin has migrated from the Android Support Library to AndroidX. Since Cordova-Android 9.x does not use the AndroidX library by default, you will need to install the [`cordova-plugin-androidx-adapter`](https://www.npmjs.com/package/cordova-plugin-androidx-adapter) plugin.

This plugin will migrate any Android Support Library references to AndroidX.

Please note that this will also migrate references of other plugins.

If you are using **Cordova Android 8.x** please continue reading in the **Cordova Android 8.x Specifics** section.

## Android details

### Co-existing with Facebook Plugin

There are a number of Cordova Facebook Plugins available but the one that we recommend is [Jeduan's fork](https://github.com/jeduan/cordova-plugin-facebook4) of the original Wizcorp plugin. It is setup to use Gradle/Maven and the latest Facebook SDK properly.

To add to your app:

```bash
cordova plugin add cordova-plugin-facebook4 --variable APP_ID="App ID" --variable APP_NAME="App Name"
```

### Co-existing with plugins that use Firebase

Problems may arise when push plugin is used along plugins that implement Firebase functionality (e.g. `cordova-plugin-firebase-analytics`). Both plugins include a version of the FCM libraries.

To make the two work together:

1. If your app still uses a legacy GCM project, migrate it in Firebase console by [importing your existing project](https://firebase.google.com/support/guides/google-android#migrate_your_console_project) instead of creating a new one.
2. Set your `FCM_VERSION` variable to match the version used in the other plugin. In case of Cordova, your `package.json` contains something like this:

```json
{
  "cordova": {
    "plugins": {
      "cordova-plugin-push": {
        "FCM_VERSION": "24.1.2"
      }
    },
    "platforms": []
  }
}
```

_Note:_ The plugin default is `FCM_VERSION=24.1.2` (exact version). Keep this pinned to the same `firebase-messaging` version used by your other Firebase-based plugins to avoid Gradle dependency conflicts.

_Note:_ Use Firebase Cloud Messaging server endpoints for delivery. Legacy GCM server endpoints are obsolete.

### Common errors

#### Multidex

If you have an issue compiling the app and you're getting an error similar to this (`com.android.dex.DexException: Multiple dex files define`):

```
UNEXPECTED TOP-LEVEL EXCEPTION:
com.android.dex.DexException: Multiple dex files define Landroid/support/annotation/AnimRes;
	at com.android.dx.merge.DexMerger.readSortableTypes(DexMerger.java:596)
	at com.android.dx.merge.DexMerger.getSortedTypes(DexMerger.java:554)
	at com.android.dx.merge.DexMerger.mergeClassDefs(DexMerger.java:535)
	at com.android.dx.merge.DexMerger.mergeDexes(DexMerger.java:171)
	at com.android.dx.merge.DexMerger.merge(DexMerger.java:189)
	at com.android.dx.command.dexer.Main.mergeLibraryDexBuffers(Main.java:502)
	at com.android.dx.command.dexer.Main.runMonoDex(Main.java:334)
	at com.android.dx.command.dexer.Main.run(Main.java:277)
	at com.android.dx.command.dexer.Main.main(Main.java:245)
	at com.android.dx.command.Main.main(Main.java:106)
```

Then at least one other plugin you have installed is using an outdated way to declare dependencies such as `android-support` or `play-services-gcm`.
This causes gradle to fail, and you'll need to identify which plugin is causing it and request an update to the plugin author, so that it uses the proper way to declare dependencies for cordova.
See [this for the reference on the cordova plugin specification](https://cordova.apache.org/docs/en/5.4.0/plugin_ref/spec.html#link-18), it'll be usefull to mention it when creating an issue or requesting that plugin to be updated.

Common plugins to suffer from this outdated dependency management are plugins related to _facebook_, _google+_, _notifications_, _crosswalk_ and _google maps_.

#### More than one library with package name 'com.google.android.gms'

When some other packages include `cordova-google-play-services` as a dependency, such as is the case with the `cordova-admob` and `cordova-plugin-analytics` plugins, it is impossible to also add the `cordova-plugin-push`, for the following error will rise during the build process:

```
:processDebugResources FAILED
FAILURE: Build failed with an exception.

What went wrong: Execution failed for task ':processDebugResources'. > Error: more than one library with package name 'com.google.android.gms'
```

Those plugins should be using gradle to include the Google Play Services package but instead they include the play services jar directly or via a plugin dependency. So all of that is bad news. These plugins should be updated to use gradle. Please raise issues on those plugins as the change is not hard to make.

In fact there is a PR open to do just that appfeel/analytics-google#11 for cordova-plugin-analytics. You should bug the team at appfeel to merge that PR.

Alternatively, switch to another plugin that provides the same functionality but uses gradle:

[https://github.com/danwilson/google-analytics-plugin](https://github.com/danwilson/google-analytics-plugin)
[https://github.com/cmackay/google-analytics-plugin](https://github.com/cmackay/google-analytics-plugin)

## Browser details

For the time being, push support on the browser is not supported. The original plugin used the PhoneGap push server which may no longer be active.

### Browser Support

Chrome 49+
Firefox 46+

## iOS details

### System & Cordova Requirements

**System:**

- `Xcode`: `26.2` or greater for the default Firebase SDK.
- `CocoaPods`: `1.12.0` or greater.
- `Ruby`: a version supported by your installed CocoaPods.
- iOS deployment target: `15.0` or greater (also applies to APNs-only apps because the Firebase pod is linked).

**Cordova:**

- `cordova-cli`: `10.0.0` or greater.
- `cordova-ios`: `6.0.0` or greater; use a maintained release compatible with your Xcode version.

### iOS FCM setup

1. Register an iOS app in the Firebase console using the **exact bundle identifier** of your Cordova app. Download its `GoogleService-Info.plist` and include it in the app bundle using `resource-file`; do not rename it.
2. In Firebase **Project settings > Cloud Messaging**, upload an APNs authentication key (with the correct Apple team/key IDs), or valid APNs certificates for the environments you use. FCM still delivers iOS messages through APNs.
3. Enable **Push Notifications** in the Apple App ID and provisioning profile. Verify the signed app's `aps-environment` entitlement, and enable **Background Modes > Remote notifications** for silent/background pushes. The plugin supplies development/release entitlements and the background mode, but cannot configure your Apple account or signing profile.
4. Set the deployment target and include the Firebase configuration in the application's `config.xml`:

```xml
<platform name="ios">
  <preference name="deployment-target" value="15.0" />
  <resource-file src="GoogleService-Info.plist" />
</platform>
```

5. Run `cordova prepare ios` and `cordova build ios` on macOS. Open the generated **`.xcworkspace`**, not `.xcodeproj`, when using Xcode. Initialize after `deviceready`, with notification permissions and any initial topics:

```javascript
const push = PushNotification.init({
  android: {},
  ios: { alert: true, badge: true, sound: true, topics: ['news'] }
});
push.on('registration', data => {
  // Update your backend on initial registration and every token refresh.
  console.log(data.registrationType, data.registrationId);
});
push.on('notification', data => {
  console.log(data);
});
push.on('error', error => {
  console.error(error);
});
```

#### Migration and integration notes

- With no bundled Firebase configuration or preconfigured default Firebase app, iOS continues to emit `registrationType: 'APNS'`. When Firebase is configured, non-VoIP registration emits `registrationType: 'FCM'`; update your backend to store the FCM token, not the old APNs token, and send through [FCM HTTP v1](https://firebase.google.com/docs/cloud-messaging/send/v1-api). `ios.voip` continues to use PushKit/APNs, never an FCM token.
- Firebase is configured once, reusing an existing default app. This plugin owns `FIRMessaging.delegate`; coordinate with other Firebase push plugins so they do not replace it. Align their Firebase pod versions with `IOS_FIREBASE_MESSAGING_VERSION` (default **12.19.0**), for example `cordova plugin add cordova-plugin-push --variable IOS_FIREBASE_MESSAGING_VERSION=12.19.0`. Do not install multiple competing push handlers.
- The default pod raises the deployment target to iOS 15 even for APNs-only apps. Upgrading from the APNs-only fork requires CocoaPods, a compatible macOS/Xcode toolchain, and regenerated platform dependencies. Android's `FCM_VERSION` is separate and unchanged.
- This integration intentionally uses the token-based Firebase APIs to preserve the existing JS/backend contract. Firebase 12.18+ deprecates these APIs in favor of installation-ID registration. Do **not** enable `FirebaseMessagingInstallationIdEnabled`; FID mode is not compatible with this plugin's FCM-token contract. A future migration will require coordinated backend and plugin changes.
- Firebase AppDelegate swizzling is left at the application's setting. The plugin explicitly associates the APNs token with Firebase in either mode. If `FirebaseAppDelegateProxyEnabled` is `NO`, it also forwards received messages to Firebase for delivery/analytics reporting. Custom delegates must still forward APNs registration, failure and notification callbacks through the plugin's AppDelegate handlers.
- No `fcmSandbox` flag is needed: Firebase detects the APNs environment from the signed application. Ensure development and distribution builds both have appropriate APNs credentials.
- `ios.topics` is supported; `ios.fcmTopics` remains an alias, with `topics` taking precedence. Topic callbacks report actual Firebase success/failure. Topic APIs return errors in APNs-only/VoIP mode.
- Full `unregister` disables auto-initialization and deletes the FCM token before unregistering APNs. Wait for its success callback before calling `init` to re-enable registration. Topic-only `unregister(success, error, ['news'])` leaves registration and JS handlers active.

#### iOS device verification

- Build a signed Debug app on a physical device with the plist bundled; grant permissions and verify a nonempty FCM `registrationId` and `registrationType: 'FCM'`. Repeat with a distribution/TestFlight build to verify production APNs credentials.
- Send an FCM HTTP v1 message with an APNs alert payload to that token. Check foreground delivery, background tap, and terminated-app tap; verify the existing `notification` fields and `additionalData.foreground`/`coldstart` flags. Include custom data and action buttons if used by your app.
- Send a silent APNs payload (`content-available: 1`, APNs push type `background`, priority `5`) and call `push.finish(success, error, notId)` after processing. Background delivery is best-effort and may be suppressed after a user force-quits the app.
- Verify initial topic subscription, explicit subscribe/unsubscribe and topic-only unregister callbacks by sending to the topic; direct-token notifications must still arrive after topic-only unregister.
- Fully unregister, verify success and absence of further registration events, then reinitialize and update the backend with the new token. Exercise offline registration followed by restored connectivity, reinstall/token rotation, denied permissions and both Firebase swizzling settings.
- Remove the plist (and any other default Firebase initialization) and rebuild to verify `registrationType: 'APNS'` and direct APNs delivery. Smoke-test Android registration/message receipt and topic APIs with the unchanged Android configuration.

Simulator-injected notifications can check payload/UI routing, but do not prove Firebase/APNs registration, signing or production delivery. Real-device verification and a macOS native build are required; the repository's JS tests cannot exercise Firebase or APNs.

### Bitcode

If you are running into a problem where the linker is complaining about bit code. For instance:

```log
ld: '<file.o>' does not contain bitcode. You must rebuild it with bitcode enabled (Xcode setting ENABLE_BITCODE), obtain an updated library from the vendor, or disable bitcode for this target. for architecture arm64 clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

You have two options. The first is to [disable bitcode as per this StackOverflow answer](http://stackoverflow.com/a/32466484/41679) or [upgrade to cordova-ios 6.0.0 or greater](https://cordova.apache.org/announcements/2020/06/01/cordova-ios-release-6.0.0.html).

```bash
cordova platform rm ios
cordova platform add ios@6.0.0
```

### CocoaPods

To install CocoaPods, please follow the installation instructions [here](https://guides.cocoapods.org/using/getting-started). Since version `1.8.0` and greater, the pod repo no longer needs to be setup or fetched. Pods specs will be fetched directly from the **CocoaPods CDN**.

If you are upgrading from an older version, it might be best to uninstall first the older version and remove the `~/.cocoapods/` directory.

The plugin links the `FirebaseMessaging` pod (including its FirebaseCore dependency) using `IOS_FIREBASE_MESSAGING_VERSION`. Runtime Firebase configuration remains optional; see [iOS FCM setup](#ios-fcm-setup).

#### Common CocoaPod Installation issues

If you are attempting to install this plugin and you run into this error:

```log
Installing "cordova-plugin-push" for ios
Failed to install 'cordova-plugin-push':Error: pod: Command failed with exit code 1
    at ChildProcess.whenDone (/Users/smacdona/code/push151/platforms/ios/cordova/node_modules/cordova-common/src/superspawn.js:169:23)
    at emitTwo (events.js:87:13)
    at ChildProcess.emit (events.js:172:7)
    at maybeClose (internal/child_process.js:818:16)
    at Process.ChildProcess._handle.onexit (internal/child_process.js:211:5)
Error: pod: Command failed with exit code 1
```

Please try to add the plugin again, with the `--verbose` flag. The above error is generic and can actually be caused by a number of reasons. The `--verbose` flag should help display the exact cause of the install failure.

One of the most common reason is that it is trying to fetch the podspec from the CocoaPods repo and the repo is out-of-date. It recommended to use CocoaPods CDN over the repo. If your using an older version of CocoaPods, it is recommend to upgrade with a fresh installation.

With a fresh installations, you should have one repo source which can be checked with the `pod repo` command.

```log
$ pod repo

trunk
- Type: CDN
- URL:  https://cdn.cocoapods.org/
- Path: /Users/home/.cocoapods/repos/trunk

1 repo
```

##### Library not found for -lPods-Appname

If you open the app in Xcode and you get an error like:

```log
ld: library not found for -lPods-Appname
clang: error: linker command failed with exit code 1
```

Then you are opening the .xcodeproj file when you should be opening the .xcworkspace file.

##### Library not found for -lGoogleToolboxForMac

Trying to build for iOS using the latest cocoapods (1.9.3) but failed with the following error (from terminal running cordova build ios):

```log
ld: library not found for -lGoogleToolboxForMac
```

Workarounds are to add the platform first and install the plugins later, or to manually run pod install on projectName/platforms/ios.

Another workaround is to go to build phases in your project at Link Binary Libraries and add `libPods-PROJECTNAME.a` and `libGoogleToolboxForMac.a`

## Additional Resources

The push plugin enables you to play sounds and display different icons during push (Android only). These additional resources need to be added to your projects `platforms` directory in order for them to be included into your final application binary.

You can now use the `resource-file` tag to deliver the image and sound files to your application. For example if you wanted to include an extra image file for only your Android build you would add the `resource-file` tag to your android `platform` tag:

```xml
<platform name="android">
  <resource-file src="myImage.png" target="res/drawable/myImage.png" />
</platform>
```

or if you wanted to include a sound file for iOS:

```xml
<platform name="ios">
  <resource-file src="mySound.caf" />
</platform>
```
