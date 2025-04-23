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
                iv[i] = (byte) (i + 1);
            }

            SecretKeySpec key = generateKey(password, salt);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, gcmSpec);
            byte[] encrypted = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));

            String encryptedBase64 = Base64.encodeToString(encrypted, Base64.NO_WRAP);
            promise.resolve(encryptedBase64);
        } catch (Exception e) {
            promise.reject("ENCRYPT_ERROR", "Encryption failed: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void decrypt(String base64Encrypted, String password, String salt, Promise promise) {
        try {
            byte[] iv = new byte[IV_SIZE];
            for (int i = 0; i < IV_SIZE; i++) {
                iv[i] = (byte) (i + 1);
            }

            byte[] encrypted = Base64.decode(base64Encrypted, Base64.NO_WRAP);

            SecretKeySpec key = generateKey(password, salt);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, gcmSpec);
            byte[] decryptedBytes = cipher.doFinal(encrypted);

            String decrypted = new String(decryptedBytes, StandardCharsets.UTF_8);
            promise.resolve(decrypted);
        } catch (Exception e) {
            promise.reject("DECRYPT_ERROR", "Decryption failed: " + e.getMessage(), e);
        }
    }

    private SecretKeySpec generateKey(String password, String salt) throws Exception {
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        KeySpec spec = new PBEKeySpec(password.toCharArray(), salt.getBytes(StandardCharsets.UTF_8), ITERATIONS, KEY_SIZE);
        SecretKey tmp = factory.generateSecret(spec);
        return new SecretKeySpec(tmp.getEncoded(), "AES");
    }
}
