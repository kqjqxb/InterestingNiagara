import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useEffect, use } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  PanResponder,
  Animated,
  Modal,
  ImageBackground,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

const fontInter18ptRegular = 'Inter18pt-Regular';
const fontInter18ptBold = 'Inter18pt-Bold';



const fontMontserratBold = 'Montserrat-Bold';
const fontMontserratRegular = 'Montserrat-Regular';
const fontMontserratBlack = 'Montserrat-Black';



const things = [
  {
    id: 1,
    image: require('../assets/images/thingsImages/thing1.png'),
  },
  {
    id: 2,
    image: require('../assets/images/thingsImages/thing2.png'),
  },
  {
    id: 3,
    image: require('../assets/images/thingsImages/thing3.png'),
  },
  {
    id: 4,
    image: require('../assets/images/thingsImages/thing4.png'),
  },
  {
    id: 5,
    image: require('../assets/images/thingsImages/thing5.png'),
  },
  {
    id: 6,
    image: require('../assets/images/thingsImages/thing6.png'),
  },
];

const CatchScreen = ({ setSelectedScreen, selectedLevel, setSelectedLevel }) => {
  const [dimensions] = useState(Dimensions.get('window'));

  const [timeLost, setTimeLost] = useState(70);

  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [restartTimer, setRestartTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [reason, setReason] = useState('');

  const [basketX] = useState(new Animated.Value(0));

  const [fallingThings, setFallingThings] = useState([]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !pauseModalVisible && !resultsModalVisible,
      onPanResponderMove: (evt, gestureState) => {
        const basketWidth = dimensions.height * 0.16;
        let newX = gestureState.moveX - (basketWidth / 2) - dimensions.width * 0.35;

        // Ensure the basket stays within screen bounds
        newX = Math.max(0 - dimensions.width * 0.35, Math.min(newX, dimensions.width - basketWidth));

        basketX.setValue(newX);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const basketWidth = dimensions.height * 0.16;
        let newX = gestureState.moveX - (basketWidth / 2) - dimensions.width * 0.44;

        // Ensure the basket stays within screen bounds
        newX = Math.max(0 - dimensions.width * 0.35, Math.min(newX, dimensions.width - basketWidth));

        Animated.spring(basketX, {
          toValue: newX,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const tryCollision = (item) => {
    const basketWidth = dimensions.height * 0.16;
    const margin = 0;
    const basketLeft = basketX._value - margin;
    const basketRight = basketX._value + basketWidth + margin;
    const itemCenter = item.x - dimensions.width * 0.25;
    return itemCenter >= basketLeft && itemCenter <= basketRight;
  };

  const lastThing = useRef(null);

  const spawnThings = () => {
    let randItem = things[Math.floor(Math.random() * things.length)];
    let safety = 10;
    while (lastThing.current && lastThing.current.type === randItem.type && safety > 0) {
      randItem = things[Math.floor(Math.random() * things.length)];
      safety--;
    }
    lastThing.current = randItem;

    const randX = Math.random() * (dimensions.width - 40);

    const newItem = {
      id: Date.now(),
      x: randX,
      y: new Animated.Value(-50),
      caught: false,
      ...randItem,
    };

    setFallingThings((prev) => [...prev, newItem]);

    const collisionThresholdY = dimensions.height * 0.77;

    const listenerId = newItem.y.addListener(({ value }) => {
      if (!newItem.caught && value >= collisionThresholdY) {
        if (tryCollision(newItem)) {
          newItem.caught = true;
          setTimeout(() => {
            setScore((prev) => prev + 1);
            setFallingThings((prev) => prev.filter((f) => f.id !== newItem.id));
          }, 0);
          newItem.y.removeListener(listenerId);
        }
      }
    });

    Animated.timing(newItem.y, {
      toValue: dimensions.height + 50,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      newItem.y.removeListener(listenerId);
      setTimeout(() => {
        setFallingThings((prev) => prev.filter((f) => f.id !== newItem.id));
      }, 0);
    });
  };


  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLost((prev) => {
        if (prev === 0) {
          clearInterval(timerInterval);
          setResultsModalVisible(true);
          setReason('time');
          return 0;
        }
        return pauseModalVisible ? prev : prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [restartTimer, pauseModalVisible]);


  useEffect(() => {
    let timerId = null;
    if (!pauseModalVisible && !resultsModalVisible) {
      timerId = setInterval(() => {
        if (!pauseModalVisible && !resultsModalVisible) {
          spawnThings();
        }
      }, 1900);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [pauseModalVisible, resultsModalVisible]);

  return (
    <ImageBackground source={require('../assets/images/gameBg.png')} style={{ flex: 1, width: dimensions.width, height: dimensions.height }}>

      <SafeAreaView
        style={{
          width: dimensions.width,
          height: dimensions.height,
          alignSelf: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: dimensions.width * 0.95,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setPauseModalVisible(true);
              setReason('pause');
            }}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: dimensions.height * 0.023,
              width: dimensions.width * 0.16,
              height: dimensions.width * 0.16,
              backgroundColor: '#FFC10E',
              borderRadius: dimensions.width * 0.03,
              paddingVertical: dimensions.height * 0.01,
              zIndex: 999
            }}
          >
            <Image
              source={require('../assets/icons/pauseNiagaraIcon.png')}
              style={{
                width: dimensions.height * 0.031,
                height: dimensions.height * 0.031,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View
            style={{
              maxWidth: dimensions.width * 0.4,
              flex: 1,
              backgroundColor: '#FFC10E',
              borderRadius: dimensions.width * 0.03,
              paddingVertical: dimensions.height * 0.01,
              height: dimensions.width * 0.16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: fontMontserratBlack,
                textAlign: 'center',
                fontSize: dimensions.width * 0.04,
                padding: dimensions.height * 0.01,
                color: 'black',
              }}
            >
              Time: {timeLost}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: dimensions.height * 0.023,
              height: dimensions.width * 0.16,
              backgroundColor: '#FFC10E',
              borderRadius: dimensions.width * 0.03,
              paddingVertical: dimensions.height * 0.01,
            }}
          >
            <Text
              style={{
                fontFamily: fontMontserratBlack,
                textAlign: 'center',
                fontSize: dimensions.width * 0.04,
                padding: dimensions.height * 0.01,
                color: 'black',
              }}
            >
              Score: {score}
            </Text>
          </View>


        </View>

        {fallingThings.map((item) => (
          <Animated.View
            key={item.id}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              zIndex: 50,
            }}
          >
            <Image
              source={item.image}
              style={{ width: 40, height: 40, resizeMode: 'contain', zIndex: 50 }}
            />
          </Animated.View>
        ))}

        <Animated.View
          style={{
            position: 'absolute',
            bottom: dimensions.height * 0.05,
            transform: [{ translateX: basketX }],
          }}
        >
          <Image
            resizeMode="contain"
            source={require('../assets/images/basketImage.png')}
            style={{
              height: dimensions.height * 0.14,
              width: dimensions.height * 0.14,
              zIndex: 10
            }}
          />
        </Animated.View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={resultsModalVisible || pauseModalVisible}
          onRequestClose={() => {
            setResultsModalVisible(false);
            setPauseModalVisible(false);
          }}
        >



          <SafeAreaView style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <BlurView
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="white"
            />
            <SafeAreaView style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}>
              <Text
                style={{
                  fontFamily: fontMontserratBlack,
                  marginBottom: dimensions.height * 0.03,
                  color: 'white',
                  fontSize: dimensions.width * 0.077,
                  textAlign: 'center',
                  fontWeight: 700,
                  marginTop: dimensions.height * 0.016,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}>
                Pure Niagara
              </Text>
              <View style={{
                width: dimensions.width * 0.9,
                backgroundColor: '#FFC10E',
                borderRadius: dimensions.width * 0.05,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: dimensions.height * 0.05,
              }}>

                <Text
                  style={{
                    fontFamily: fontMontserratBlack,
                    color: 'black',
                    fontSize: dimensions.width * 0.064,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    marginTop: dimensions.height * 0.016
                  }}>
                  {reason === 'pause' ? 'Pause' : 'Time is up'}
                </Text>



                {resultsModalVisible && !pauseModalVisible && (
                  <Text
                    style={{
                      fontFamily: fontInter18ptRegular,
                      color: 'black',
                      fontSize: dimensions.width * 0.05,
                      textAlign: 'center',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginTop: dimensions.height * 0.025
                    }}>
                    You scored {score} points
                  </Text>
                )}

                <View style={{
                  marginTop: dimensions.height * 0.05,
                }}>

                  <TouchableOpacity
                    onPress={() => {
                      setResultsModalVisible(false);
                      setPauseModalVisible(false);
                      setRestartTimer(prev => prev + 1);

                      if(reason !== 'pause') {
                        setScore(0);
                        setTimeLost(70);
                      }
                    }}
                    style={{
                      backgroundColor: '#008B47',
                      borderRadius: dimensions.width * 0.016,
                      paddingVertical: dimensions.height * 0.016,
                      alignSelf: 'center',
                      width: dimensions.width * 0.75,
                      marginTop: dimensions.height * 0.019
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontMontserratBlack,
                        color: 'white',
                        fontSize: dimensions.width * 0.05,
                        textAlign: 'center',
                        fontWeight: 900,
                      }}>
                      {reason === 'pause' ? 'Continue' : 'Try again'}
                    </Text>
                  </TouchableOpacity>


                  <TouchableOpacity
                    onPress={() => {
                      setSelectedScreen('Home');
                    }}
                    style={{
                      backgroundColor: '#008B47',
                      borderRadius: dimensions.width * 0.016,
                      paddingVertical: dimensions.height * 0.016,
                      alignSelf: 'center',
                      width: dimensions.width * 0.75,
                      marginTop: dimensions.height * 0.019
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontMontserratBlack,
                        color: 'white',
                        fontSize: dimensions.width * 0.05,
                        textAlign: 'center',
                      }}>
                      Back home
                    </Text>
                  </TouchableOpacity>

                </View>


              </View>
            </SafeAreaView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default CatchScreen;
