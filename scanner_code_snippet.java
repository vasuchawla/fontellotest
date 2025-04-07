const granted = await requestCameraPermission();
            if (granted) {
            CardScannerModule.startCardScanner().then(function(resp){
              // alert('response received');
              console.log(resp.cardNumber);

              let cc = resp.cardNumber || '';
              cc = cc.replace(' ', '');

              
            }).catch(err=>{
              console.log(err);
              alert('error received');
            })
 }else{
            alert("permissions issue")
          }



import { NativeModules } from 'react-native';
 
const {  CreditCardScannerBridge , CardScannerModule} = NativeModules;




  <activity android:name=".CardScannerActivity"
    android:theme="@style/Theme.AppCompat.Light.NoActionBar"
    android:exported="false" />


        <uses-permission android:name="android.permission.CAMERA" />









    cardscanneractivity


    package com.newproject;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Rect;
import android.os.Bundle;
import android.util.Size;
import android.widget.Toast;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.Preview;
import androidx.camera.view.PreviewView;
import androidx.camera.core.ImageProxy;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.view.View;
import android.view.LayoutInflater;
import android.view.SurfaceView;
import android.view.ViewGroup;

public class CardScannerActivity extends AppCompatActivity {

    private ExecutorService cameraExecutor;
    private static final int REQUEST_CAMERA_PERMISSION = 200;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_card_scanner);

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            startCamera();
        } else {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, REQUEST_CAMERA_PERMISSION);
        }

        findViewById(R.id.cancel_button).setOnClickListener(v -> finish());
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture =
                ProcessCameraProvider.getInstance(this);

        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
            PreviewView previewView = findViewById(R.id.previewView);

            Preview preview = new Preview.Builder().build();
            preview.setSurfaceProvider(previewView.getSurfaceProvider());


                ImageAnalysis imageAnalysis = new ImageAnalysis.Builder()
                        .setTargetResolution(new Size(1280, 720))
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build();

                imageAnalysis.setAnalyzer(cameraExecutor, image -> {
                    processImage(image);
                });

                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis);
            } catch (ExecutionException | InterruptedException e) {
                e.printStackTrace();
            }
        }, ContextCompat.getMainExecutor(this));

        cameraExecutor = Executors.newSingleThreadExecutor();
    }

    private void processImage(ImageProxy imageProxy) {
        @SuppressWarnings("UnsafeOptInUsageError")
        InputImage image = InputImage.fromMediaImage(imageProxy.getImage(), imageProxy.getImageInfo().getRotationDegrees());

        TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
                .process(image)
                .addOnSuccessListener(result -> {
                    for (Text.TextBlock block : result.getTextBlocks()) {
                        String text = block.getText();
                        if (text.matches(".*\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}.*")) {
                            Intent intent = new Intent();
                            intent.putExtra("cardNumber", text);
                            setResult(Activity.RESULT_OK, intent);
                            finish();
                        }
                    }
                    imageProxy.close();
                })
                .addOnFailureListener(e -> imageProxy.close());
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (cameraExecutor != null) {
            cameraExecutor.shutdown();
        }
    }
}









cardscannermodule
  package com.newproject;
import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;


public class CardScannerModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static ReactApplicationContext reactContext;
    private static Promise scanPromise;

    public CardScannerModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        context.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "CardScannerModule";
    }

    @ReactMethod
    public void startCardScanner(Promise promise) {
        scanPromise = promise;
        Activity currentActivity = getCurrentActivity();
        if (currentActivity != null) {
            Intent intent = new Intent(currentActivity, CardScannerActivity.class);
            currentActivity.startActivityForResult(intent, 101);
        } else {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist");
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode == 101 && resultCode == Activity.RESULT_OK && data != null) {
            String cardNumber = data.getStringExtra("cardNumber");
            String expiry = data.getStringExtra("expiry");
            String name = data.getStringExtra("name");

            WritableMap result = Arguments.createMap();
            result.putString("cardNumber", cardNumber);
            result.putString("expiryDate", expiry);
            result.putString("cardHolder", name);

            // reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            //     .emit("onCardScanned", result);

            if (scanPromise != null) {
                scanPromise.resolve(result);
            }
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
    }
}









activity_card_scanner

  <?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000">

    <androidx.camera.view.PreviewView
        android:id="@+id/previewView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <View
        android:layout_width="300dp"
        android:layout_height="180dp"
        android:layout_gravity="center"
        android:background="@drawable/overlay_frame_border" />

    <Button
        android:id="@+id/cancel_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|center_horizontal"
        android:text="Cancel"
        android:layout_marginBottom="32dp"
        android:textColor="#FFF"
        android:background="@android:color/transparent" />
</FrameLayout>








  overlay_frame_border
  <?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    
    <solid android:color="@android:color/transparent" />

    <stroke
        android:width="4dp"
        android:color="#00FF00" /> <!-- Green border -->

    <corners android:radius="12dp" />
</shape>




  






  
//  def camerax_version = "1.4.1"
  // ML Kit Text Recognition
    implementation 'com.google.mlkit:text-recognition:16.0.0'

    // CameraX
    implementation "androidx.camera:camera-core:1.4.1"
    implementation "androidx.camera:camera-camera2:1.4.1"
    implementation "androidx.camera:camera-lifecycle:1.4.1"
    implementation "androidx.camera:camera-view:1.4.1"

    // Guava (for ListenableFuture)
    implementation 'com.google.guava:guava:31.1-android'




  
