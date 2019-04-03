import _ from "lodash";
import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import { connect } from "react-redux";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import MidnightCommander from "./mapstyles/MidnightCommander";

import { changeLocation } from "../../redux/actions/LocationAction";
import { setSearchIsFocused } from "../../redux/actions/searchActions";
import { showInfo } from "../../redux/actions/slideActions";

import { getColor, getMarkers } from "../../functions";

const MapContainerStyles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    },
    customMarker: {
        borderTopRightRadius: 13,
        borderTopLeftRadius: 13,
        borderBottomLeftRadius: 13,
        height: 40,
        width: 55,
        alignItems: "center",
        justifyContent: "center",

    },
    markerText: {
        fontFamily: "OpenSans",
        fontWeight: "bold",
        color: "white",
        fontSize: 20
    },
    locationStyle: {
        zIndex: 99
    },
    callOut: {
        justifyContent: "flex-start"
    }
});

class CustomMarker extends Component {
    render() {
        return (
            <View
                style={[
                    MapContainerStyles.customMarker,
                    {
                        backgroundColor: getColor(this.props.percent)
                    }
                ]}
            >
                <Text style={MapContainerStyles.markerText}>
                    {Math.trunc(this.props.percent) + "%"}
                </Text>
            </View>
        );
    }
}

//Container for the map, used to load stuff onto map such as markers
class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            markers: []
        };


    }

    componentDidMount() {
        this.reloadMarkers();
    }

    reloadMarkers() {
        getMarkers().then(res => {
            this.setState({
                markers: res.data
            });
        });
    }

    //Used to get information on markers from API
    generateMarkers() {
        return this.state.markers.map(markerInstance => (
            <Marker
                coordinate={{
                    latitude: markerInstance.lat,
                    longitude: markerInstance.lng
                }}
                //Can later pull coord, title, descrip from API when implemented
                // title={markerInstance.name}
                // description={markerInstance.description}
                key={markerInstance.keyName}
                onPress={e => {
                    e.stopPropagation();
                    this.props.showGarageInfo(markerInstance.keyName);
                }}
                anchor={{
                    x: 1,
                    y: 1
                }}
                calloutAnchor={{
                    x: 0,
                    y: 0
                }}
                callout
            >
                <CustomMarker
                    percent={
                        (markerInstance.current / markerInstance.max) * 100
                    }
                />
            </Marker>
        ));
    }

    render() {
        return (
            <>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={MapContainerStyles.map}
                    initialRegion={this.props.coordinates}
                    ref={instance => {
                        this.mapRef = instance;
                    }}
                    customMapStyle={MidnightCommander}
                    onPress={e => {
                        this.props.blurText();
                        this.props.hideGarageInfo();
                    }}
                >
                    {this.generateMarkers()}
                </MapView>
                <TouchableOpacity
                    onPress={() => {
                        this.reloadMarkers();
                    }}
                    style={{
                        right: 30,
                        bottom: 50,
                        height: 40,
                        width: 40,
                        backgroundColor: "red",
                        position: "absolute"
                    }}
                >

                </TouchableOpacity>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        coordinates: state.loc.coordinates
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeLocation: coordinates => {
            dispatch(changeLocation(coordinates));
        },
        blurText: () => {
            dispatch(setSearchIsFocused(false));
        },
        showGarageInfo: keyName => {
            dispatch(showInfo(true, keyName));
        },
        hideGarageInfo: () => {
            dispatch(showInfo(false));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MapContainer);
