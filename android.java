package com.yourappname;

import android.util.Base64;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.nio.charset.StandardCharsets;
import java.security.spec.KeySpec;
import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.SecretKey;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

public class AesEncryptModule extends ReactContextBaseJavaModule {
    private static final int IV_SIZE = 16;
    private static final int TAG_LENGTH_BIT = 128;
    private static final int KEY_SIZE = 256;
    private static final int ITERATIONS = 65536;

    public AesEncryptModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AesEncrypt";
    }

    @ReactMethod
    public void encrypt(String text, String password, String salt, Promise promise) {
        try {
            byte[] iv = new byte[IV_SIZE];
            for (int i = 0; i < IV_SIZE; i++) {
                iv[i] = (byte) (i + 1);  // IV = {1, 2, ..., 16}
            }

            // Generate Secret Key
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt.getBytes(StandardCharsets.UTF_8), ITERATIONS, KEY_SIZE);
            SecretKey tmp = factory.generateSecret(spec);
            SecretKeySpec secretKey = new SecretKeySpec(tmp.getEncoded(), "AES");

            // AES-GCM encryption
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);
            byte[] cipherText = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));

            // Encode to Base64
            String encryptedBase64 = Base64.encodeToString(cipherText, Base64.NO_WRAP);
            promise.resolve(encryptedBase64);
        } catch (Exception e) {
            promise.reject("ENCRYPT_ERROR", "Encryption failed: " + e.getMessage(), e);
        }
    }
}
