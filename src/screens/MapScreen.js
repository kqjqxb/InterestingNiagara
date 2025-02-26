import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    Share,
    Linking,
    Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { styled } from 'nativewind';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import places from '../components/allPlaces';
import { XMarkIcon } from 'react-native-heroicons/solid';


const fontOpenSansBold = 'OpenSans-Bold';

const fontMontserratBold = 'Montserrat-Bold';
const fontMontserratRegular = 'Montserrat-Regular';
const fontMontserratBlack = 'Montserrat-Black';

const MapScreen = ({ selectedPlace, setSelectedScreen, isPlaceVisible, setIsPlaceVisible, isPlaceDetailsVisible, setIsPlaceDetailsVisible }) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));


    useEffect(() => {
        console.log('selectedPlace: ' + selectedPlace);
    }, []);




    const ShareNiagaraPlace = async (title) => {
        try {
          if (!title) {
            Alert.alert('Error', 'No niagara place to share');
            return;
          }
          await Share.share({
            message: `Read about ${title} in Interesting Niagara app!`,
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      };


    return (
        <View style={{ width: '100%' }}>
            <MapView
                style={{
                    width: '100%',
                    height: dimensions.height,
                    alignSelf: 'center',
                    zIndex: 50
                }}
                region={{
                    latitude: selectedPlace ? selectedPlace.coordinates.latitude : places[0].coordinates.latitude,
                    longitude: selectedPlace ? selectedPlace.coordinates.longitude : places[0].coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >

                {places.map((location, index) => (
                    <Marker
                        key={index}
                        coordinate={location.coordinates}
                        title={location.title}
                        description={location.description}
                        pinColor={selectedPlace && location.coordinates === selectedPlace.coordinates ? "#FFC10E" : "#008B47"}
                    />
                ))}
            </MapView>
            {isPlaceVisible && (
                <View style={{
                    width: '100%',
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    position: 'absolute',
                    top: dimensions.height * 0.25,
                }}>
                    <View style={{
                        width: dimensions.width * 0.9,
                        alignSelf: 'center',
                        borderRadius: dimensions.width * 0.07,
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            padding: dimensions.width * 0.04,
                            borderRadius: dimensions.width * 0.03,
                            marginBottom: dimensions.height * 0.019,
                        }}>
                            <Image
                                source={selectedPlace.image}
                                style={{
                                    width: '100%',
                                    height: dimensions.height * 0.16,
                                    borderRadius: dimensions.width * 0.03,
                                }}
                                resizeMode="stretch"
                            />


                            <Text
                                style={{
                                    fontFamily: fontMontserratBlack,
                                    color: 'black',
                                    fontSize: dimensions.width * 0.046,
                                    textAlign: 'left',
                                    alignSelf: 'flex-start',
                                    marginTop: dimensions.height * 0.019,
                                }}>
                                {selectedPlace.title}
                            </Text>


                            <Text
                                style={{

                                    fontFamily: fontMontserratRegular,
                                    fontWeight: 400,
                                    color: 'black',
                                    fontSize: dimensions.width * 0.037,
                                    textAlign: 'left',
                                    alignSelf: 'flex-start',
                                    marginTop: dimensions.height * 0.016,
                                }}>
                                {selectedPlace.description.length > 100 ? `${selectedPlace.description.substring(0, 100)}...` : selectedPlace.description}
                            </Text>


                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                marginTop: dimensions.height * 0.03,
                                marginBottom: dimensions.height * 0.01,
                            }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsPlaceVisible(false);
                                    }}
                                    style={{
                                        backgroundColor: '#FFC10E',
                                        width: dimensions.width * 0.15,
                                        height: dimensions.width * 0.15,
                                        justifyContent: 'center',
                                        borderRadius: dimensions.width * 0.03,
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                    }}>
                                    <XMarkIcon size={dimensions.width * 0.1} color='black' />
                                </TouchableOpacity>


                                <TouchableOpacity
                                    onPress={() => {
                                        setIsPlaceVisible(true);
                                        setSelectedScreen('Places');
                                    }}
                                    style={{
                                        backgroundColor: '#FFC10E',
                                        width: dimensions.width * 0.48,
                                        height: dimensions.width * 0.15,
                                        justifyContent: 'center',
                                        borderRadius: dimensions.width * 0.03,
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            fontFamily: fontMontserratBlack,
                                            color: 'black',
                                            fontSize: dimensions.width * 0.04,
                                            textAlign: 'left',
                                        }}>
                                        Read more
                                    </Text>
                                    <Image
                                        source={require('../assets/icons/readIcon.png')}
                                        style={{
                                            width: dimensions.width * 0.07,
                                            height: dimensions.width * 0.07,
                                            marginLeft: dimensions.width * 0.025,
                                        }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>


                                <TouchableOpacity
                                    onPress={() => {
                                        ShareNiagaraPlace(selectedPlace.title);
                                    }}
                                    style={{
                                        backgroundColor: '#FFC10E',
                                        width: dimensions.width * 0.15,
                                        height: dimensions.width * 0.15,
                                        justifyContent: 'center',
                                        borderRadius: dimensions.width * 0.03,
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                    }}>
                                    <Image
                                        source={require('../assets/icons/shareIcon.png')}
                                        style={{
                                            width: dimensions.width * 0.07,
                                            height: dimensions.width * 0.07,
                                            marginRight: dimensions.width * 0.01,
                                        }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default MapScreen;
