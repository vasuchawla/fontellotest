Step 1: install library
 run command "npm install react-native-get-sms-android --save" to install the library


Step 2: add permissions
  Add the below line in AndroidManifest.xml

    <uses-permission android:name="android.permission.SEND_SMS" />


Step 3: refer the file sendSMS.js for the implementation
What i have done in this file is:
  a) import the library by adding the below line
       import SmsAndroid from 'react-native-get-sms-android';
  b) create a button which calls on tap calles the function sendSilentSMS and passes the phone number and message
  c) created a function called "sendSilentSMS" which receives 2 parameters ie phone number and message.
      This function firstly requests the OS for send sms permissions (might need user interaction only once for accepting the permission)
      And once the permissions are granted, it sends the sms without any user confirmation or interation.







import React, { useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Alert } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';


const SendSMS = () => {

const sendSilentSMS = async (phonenumber, msg) => {

    try{
    let waitingForPermissions = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);

    if (waitingForPermissions === PermissionsAndroid.RESULTS.GRANTED) {
        SmsAndroid.autoSend(phonenumber, msg,
        (fail) => {
            console.log('Failed with this error: ' + fail);
        },
        (success) => {
            console.log('SMS sent successfully');
        },
        );
    }else{
        Alert.alert("Error", "Permission denied");
    }
    }catch(err){
    Alert.alert("Error", "Failed to get permissions")
    }
}


return (
    <View style={{ flex: 1, paddingTop:80,justifyContent: 'center', alignItems: 'center' }}>
    
    <Button title="Send Silent SMS" onPress={()=>{
        sendSilentSMS('7082294153', 'test')
    }} />
    
    </View>
);
};

export default SendSMS;
