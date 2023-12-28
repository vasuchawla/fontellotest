import React, { useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Alert } from 'react-native';
import SimCardsManagerModule from 'react-native-sim-cards-manager';

const SimInfoScreen = () => {
  const [simInfo, setSimInfo] = useState(null);
 

  const getSimInfo = async () => {
    try{
      let waitingForPermissions = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS, {
        title: 'Sample Title',
        message:
          'Sample Description',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });

      if (waitingForPermissions === PermissionsAndroid.RESULTS.GRANTED) {
        getSimInfoInner();
      }else{
        Alert.alert("Error", "Permission denied");
      }
    }catch(err){
      Alert.alert("Error", "Failed to get permissions")
    }


  }
  const getSimInfoInner = async () => {
    try {
      const info =  await  SimCardsManagerModule.getSimCardsNative( )
      console.log(info)
      setSimInfo(info);
    } catch (error) {
      console.log('Error fetching SIM info:', error);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop:80,justifyContent: 'center', alignItems: 'center' }}>
      <View style={{flexDirection:'row'}}>
      <View><Button title="Get SIM Info" onPress={getSimInfo}   /></View>
       </View>
      {simInfo && (
        <View style={{ marginTop: 20 }}>
          {simInfo.map((sim, index) => (
            <View key={index}>
              <Text>{`SIM ${index + 1} Details:`}</Text>
              <Text>{`Carrier Name: ${sim.carrierName}`}</Text>
              <Text>{`Display Name(android only): ${sim.displayName}`}</Text>
              <Text>{`isoCountryCode: ${sim.isoCountryCode}`}</Text>
              <Text>{`Mobile Country Code: ${sim.mobileCountryCode}`}</Text>
              <Text>{`Mobile Network Code: ${sim.mobileNetworkCode}`}</Text>
              <Text>{`Phone Number: ${sim.phoneNumber || 'N/A'}`}</Text>
              <Text>{`isDataRoaming (android only): ${sim.isDataRoaming}`}</Text>
              <Text>{`isNetworkRoaming (android only): ${sim.isNetworkRoaming}`}</Text>
              <Text>{`simSlotIndex (android only): ${sim.simSlotIndex}`}</Text>
              <Text>{`simSerialNumber (android only): ${sim.simSerialNumber}`}</Text>
              <Text>{`subscriptionId (android only): ${sim.subscriptionId}`}</Text>
              <Text>{`allowsVOIP (ios only): ${sim.allowsVOIP}`}</Text>
            
              <Text>--------------------------</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SimInfoScreen;
