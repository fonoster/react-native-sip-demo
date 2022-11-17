/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
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

import * as JsSIP from 'react-native-jssip';

const App: () => React$Node = () => {
  const [status, setStatusState] = useState('00: NOTHING');
  const [isLoading, setIsLoading] = useState(true);
  const ua = useRef(null);

  useEffect(() => {
    const sockets = [
      new JsSIP.WebSocketInterface('wss://sipstaging.camanio.com:5063'),
    ];

    ua.current = new JsSIP.UA({
      sockets,
      uri: 'sip:1001@sipstaging.camanio.com',
      password: '1234',
      display_name: 'Fonoster Test',
      register: true,
      register_expires: 60,
    });

    ua.current.start();
    ua.current.on('registered', e => setIsLoading(false));
  }, []);

  const setStatus = useCallback(st => {
    setStatusState(st);

    console.log(`STATUS: ${st}`);
  }, []);

  const onCall = useCallback(() => {
    if (!ua.current) {
      setStatus('01: ERROR: UA NOT READY');

      return;
    }

    let start = new Date().getTime();

    const eventHandlers = {
      progress: function(e) {
        setStatus('04: RINGING, THE CALL IS IN PROGRESS...');

        const end = new Date().getTime();

        const time = (end - start) / 1000;

        console.log(`STATUS: THE CALL TAKE ${time} SECONDS TO RING`);
      },
      failed: function(e) {
        ua.current.stop();

        setStatus('05: CALL FAILED, GO TO CONSOLE FOR MORE INFO');

        if (e && e.cause) {
          console.warn(e.cause);
        }
      },
      ended: function(e) {
        const message =
          e.cause === 'Terminated' && e.originator === 'local'
            ? '06: CALL ENDED, CALL WAS NOT CLOSED ON THE DEVICE'
            : '06: CALL ENDED, CALL WINDOW SUCCESSFULLY CLOSED ON THE DEVICE';

        setStatus(message);
      },
      confirmed: function(e) {
        setStatus('07: CALL CONFIRMED, CALL IS ESTABLISHED');
      },
      sending: function(e) {
        setStatus('08: SENDING CALL REQUEST TO SIP SERVER...');
      },
      accepted: () => setStatus('09: CALL ACCEPTED, CALL IS ESTABLISHED'),
    };

    const options = {
      eventHandlers,
      mediaConstraints: {audio: true, video: false},
    };

    ua.current.call('sip:17853178070@sipstaging.camanio.com', options);

    setStatus('11: CALLING TO SIP SERVER...');
  }, [setStatus]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loading}>Loading</Text>
              <Text style={styles.loading}>
                Connecting to SIP server, please wait...
              </Text>
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.footer}>{status}</Text>
              </View>
              <TouchableOpacity onPress={onCall}>
                <View>
                  <Text style={styles.button}>Call</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
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
  loading: {
    color: Colors.dark,
    fontSize: 22,
    fontWeight: '600',
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
  },
});

export default App;
