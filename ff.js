prelog explore
------

import { Linking, NativeModules } from 'react-native';
const {CustomSdkModule} = NativeModules;
CustomSdkModule.createGuardianAccount("jj", "en")



  android/app/src/main/res/values/styles.xml
  -------------

  <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
    replace with
      <style name="AppTheme" parent="Theme.MaterialComponents.Light.NoActionBar">


    /AndroidManifest.xml

<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools">


      <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

      <application tools:replace="android:theme"





ankdhofar/dehmb/MainApplication.java
        packages.add(new CustomSdkPackage());







com/bankdhofar/dehmb/CustomSdkPackage.java

package com.bankdhofar.dehmb;
import android.app.Activity;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CustomSdkPackage implements ReactPackage {
 
   @Override
   public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
       return Collections.emptyList();
   }

   @Override
   public List<NativeModule> createNativeModules(
           ReactApplicationContext reactContext) {
       List<NativeModule> modules = new ArrayList<>();

       modules.add(new CustomSdkModule(reactContext));

       return modules;
   }

}










main/java/com/bankdhofar/dehmb/CustomSdkModule.java


package com.bankdhofar.dehmb;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.simplecrm.bankofdhofarProduction.StartEkyc;

import java.util.Map;
import java.util.HashMap;

import android.app.Activity;
import android.util.Log;



public class CustomSdkModule extends ReactContextBaseJavaModule {
    CustomSdkModule(ReactApplicationContext context) {
        super(context);
    }
    @Override
    public String getName() {
        return "CustomSdkModule";
    }
    @ReactMethod
    public void createGuardianAccount(String fcm, String locale) {
        Log.d("CalendarModule", "Create event called with name: " + fcm + " and location: " + locale);
        Activity currentActivity = getCurrentActivity();

        StartEkyc.createGuardianAccount(  currentActivity,  fcm, locale);
    }
    @ReactMethod
    public void createChildAccount(String fcm, String locale, String mobile_no, String parent_cif_no, String parent_details){
        Activity currentActivity = getCurrentActivity();
        StartEkyc.createChildAccount(currentActivity, fcm, locale,  mobile_no, parent_cif_no, parent_details);

    }


}






android/app/build.gradle


    compileOptions {
        // sourceCompatibility = JavaVersion.VERSION_17 // lines of interest
        // targetCompatibility = JavaVersion.VERSION_17 // lines of interest
    }
    signingConfigs {










      
 implementation files('libs/Intilaqa_SDK_UAT_07012025.aar');
    // implementation files('libs/surveymanagement-prod-release.aar');
    def camerax_version = "1.4.1"
    implementation "androidx.camera:camera-core:$camerax_version"
    implementation "androidx.camera:camera-camera2:$camerax_version"
    implementation "androidx.camera:camera-lifecycle:$camerax_version"
    implementation "androidx.camera:camera-view:$camerax_version"
    //   implementation 'com.theartofdev.edmodo:android-image-cropper:2.8.+'
    implementation 'com.github.ArthurHub:Android-Image-Cropper:2.8.0'
    implementation 'com.google.mlkit:face-detection:16.1.5'
    implementation 'com.google.mlkit:segmentation-selfie:16.0.0-beta6'
    implementation 'com.google.android.gms:play-services-location:21.2.0'
    implementation 'com.github.gcacace:signature-pad:1.3.1'
    implementation 'com.google.code.gson:gson:2.10.1'
    implementation 'com.squareup.retrofit2:retrofit:2.5.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.5.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.9.2'
    implementation 'com.google.android.material:material:1.5.0'
    implementation 'com.squareup.okhttp3:okhttp:4.9.2'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
        implementation 'com.google.code.gson:gson:2.6.2'


    if (isGifEnabled) {










react-native-main/android/settings.gradle
      pluginManagement {
    buildscript {
        repositories {
            mavenCentral()
            maven {
                url = uri("https://storage.googleapis.com/r8-releases/raw")
            }
        }
        dependencies {
            classpath("com.android.tools:r8:8.1.44")
        }
    }
}








      eact-native-main/android/build.gradle 

      
        buildToolsVersion = findProperty('android.buildToolsVersion') ?: '34.0.0'
        minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '24')
        compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '34')
        targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '34')

 ndkVersion = "25.1.8937393"
      dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        // classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}
