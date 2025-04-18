/*
 Copyright 2009-2011 Urban Airship Inc. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 2. Redistributions in binaryform must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided withthe distribution.

 THIS SOFTWARE IS PROVIDED BY THE URBAN AIRSHIP INC``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 EVENT SHALL URBAN AIRSHIP INC OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

@import Foundation;
@import UserNotifications;
#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import <PushKit/PushKit.h>

@protocol GGLInstanceIDDelegate;
@protocol GCMReceiverDelegate;
@interface PushPlugin : CDVPlugin
{
    NSDictionary *notificationMessage;
    BOOL    isInline;
    NSString *notificationCallbackId;
    NSString *callback;
    BOOL    clearBadge;

    NSMutableDictionary *handlerObj;
    void (^completionHandler)(UIBackgroundFetchResult);

    BOOL ready;
}

@property (nonatomic, copy) NSString *callbackId;
@property (nonatomic, copy) NSString *notificationCallbackId;
@property (nonatomic, copy) NSString *callback;

@property (nonatomic, strong) NSDictionary *notificationMessage;
@property BOOL isInline;
@property BOOL coldstart;
@property BOOL clearBadge;
@property (nonatomic, strong) NSMutableDictionary *handlerObj;

- (void)init:(CDVInvokedUrlCommand*)command;
- (void)unregister:(CDVInvokedUrlCommand*)command;
- (void)subscribe:(CDVInvokedUrlCommand*)command;
- (void)unsubscribe:(CDVInvokedUrlCommand*)command;
- (void)clearNotification:(CDVInvokedUrlCommand*)command;

- (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
- (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;

- (void)setNotificationMessage:(NSDictionary *)notification;
- (void)notificationReceived;

- (void)willSendDataMessageWithID:(NSString *)messageID error:(NSError *)error;
- (void)didSendDataMessageWithID:(NSString *)messageID;
- (void)didDeleteMessagesOnServer;

// VoIP Features
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type;
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type;


@end