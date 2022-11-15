/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useCallback, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import {registerGlobals} from 'react-native-webrtc';

registerGlobals();

import JsSIP from 'react-native-jssip';

const App: () => React$Node = () => {
  const [status, setStatusState] = useState('00: NO CALLS');

  const setStatus = useCallback(s => {
    console.warn(s);
    setStatusState(s);
  }, []);

  const onCall = useCallback(() => {
    const sockets = [
      new JsSIP.WebSocketInterface('wss://sipstaging.camanio.com:5063'),
    ];

    const ua = new JsSIP.UA({
      sockets,
      uri: 'sip:1001@sipstaging.camanio.com',
      password: '1234',
      display_name: 'Fonoster Test',
    });

    ua.start();

    const eventHandlers = {
      progress: function(e) {
        setStatus('00: CALL IS IN PROGRESS');
      },
      failed: function(e) {
        console.warn('00: CALL FAILED WITH CAUSE: ', e);
      },
      ended: function(e) {
        console.warn('00: CALL ENDED WITH CAUSE: ' + e);
      },
      confirmed: function(e) {
        setStatus('00: CALL CONFIRMED');
      },
      connecting: function(e) {
        setStatus('00: CONNECTING...');
      },
      sending: function(e) {
        setStatus('00: SENDING...');

        if (e.request) {
          console.warn(e.request);
        }
      },
      accepted: () => console.warn('00: CALL ACCEPTED'),
      peerconnection: e => console.warn('00: PEER CONNECTION', e),
      icecandidate: e => console.warn('00: ICE CANDIDATE', e),
    };

    const options = {
      eventHandlers,
      mediaConstraints: {audio: true, video: false},
    };

    const session = ua.call('sip:17853178070@sipstaging.camanio.com', options);
  }, [setStatus]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View>
            <Text style={styles.footer}>{status}</Text>
          </View>

          <TouchableOpacity onPress={onCall}>
            <View>
              <Text style={styles.button}>Call</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {},
  footer: {
    color: Colors.dark,
    fontSize: 22,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
  },
  button: {
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    padding: 24,
    backgroundColor: '#49b96d',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default App;
