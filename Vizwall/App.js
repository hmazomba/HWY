import React from 'react';
import { Text, View, TouchableOpacity, FlatList } from 'react-native';
import { Camera, Permissions, ImageManipulator } from 'expo';

const Clarifai = require('clarifai');


const clarifai = new Clarifai.App({
  apiKey: '094f38a8ca0247f790197b107c107554',
});
process.nextTick = setImmediate;
export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    predictions: [],
    type: '',
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  capturePhoto = async () => {
    if(this.camera) {
      let photo = await this.camera.takePictureAsync();
      return photo.uri;
    }
  };
  resize = async photo => {
    let manipulatedImage = await ImageManipulator.manipulate(
      photo,
      [{resize: {height: 300, width: 300}}],
      { base64 : true}
    );
    return manipulatedImage.base64
  };
  predict = async image => {
    let predictions = await clarifai.models.predict(
      Clarifai.GENERAL_MODEL, 
      image
    );
    return predictions;
  };
  objectDetection = async () => {
    let photo = await  this.capturePhoto();
    let resized = await  this.resize(photo);
    let predictions = await this.predict(resized);
    this.setState({predictions: predictions.outputs[0].data.concepts});
  };
  render() {
    const { hasCameraPermission, predictions } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera 
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View
              style={{    
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}
            >
              <View
                style={{
                  flex:1,
                  alignSelf: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <FlatList
                  data={predictions.map(prediction => ({
                    key : `${prediction.name} ${prediction.value}`,
                  }))} 
                  renderItem={({item}) => (
                    <Text style={{paddingLeft: 15, color: 'white', fontSize: 20}}>{item.key}</Text>
                  )}  
                /> 

              </View>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignItems: 'center',
                  backgroundColor: 'blue', 
                  height: '10%',
                }}
                onPress={this.objectDetection}
              > 
                <Text style={{fontSize: 30, color: 'white', padding: 15}}>
                  {' '}
                  Detect Objects{' '}  
                </Text>

              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}                
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
