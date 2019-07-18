import React from 'react';
import Modal from "react-native-modal";
import FadeInView from "./FadeInView";
import EZRASSOR from '../../api/ezrassor-service'
import {Robot, Operation} from '../../enumerations/robot-commands';
import { Animated, StyleSheet, Text, View, TouchableHighlight, TouchableOpacity, Image, Button, StatusBar, KeyboardAvoidingView, TextInput} from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Font } from 'expo';

export default class ControllerScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modal2Visible: false,
      ipModal: false,
      xyModal: false,
      isLoading: true,
      control: 0,
      xy: '(0,0)',
      ip: '129.168.1.2:8080' 
    }; 

    this.EZRASSOR = new EZRASSOR(this.state.ip);
    this.style = this.props.Style;
  }

  async componentDidMount () {
    await Font.loadAsync({
      'NASA': require('../../../assets/nasa.ttf'),
    });
    this.setState({ isLoading: false })
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  setModal2Visible(visible) {
    this.setState({ modal2Visible: visible });
  }

  setIPModalVisible(visible){
    this.setState({ipModal: visible});
  }

  setXYModalVisible(visible){
    this.setState({xyModal:visible});
  }

  toggleModalVisibility(_modal) {
    this.setState({_modal:!this.state._modal.visible});
  }

  changeXY(text){
    this.setState({xy:text})
  }

  changeIP(text){
    this.setState({ip:text}, () => {
      this.EZRASSOR.ip = this.state.ip;
    });
  }

  controlUpdate(input){ 
    newControl = this.state.control + input
    
    this.setState({control: newControl}, ()=> {
      console.log(this.state.control)
      this.handleSubmit(this.state.control)
    }); 
  }

  sendXY(){
     xy = this.state.xy
     console.log(xy)
  }

  // Update animation frame before processing click so that opacity can change on click 
  sendOperation(part, operation) {
    requestAnimationFrame(() => {
      this.EZRASSOR.executeRobotCommand(part, operation);
    });
  }

  render() {

    // Loading font
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, backgroundColor: '#5D6061'}}/>
      );
    }

    return ( 
      <View style={this.style.container}>
        {/* Autonomy Popup Modal*/}
        <StatusBar hidden />
        <Modal
          style={this.style.modalViewContainer}
          isVisible={this.state.modalVisible}
          onSwipe={() => this.setModalVisible(!this.state.modalVisible)}
          swipeDirection='down'
          onRequestClose={() => this.setModalVisible(!this.state.modalVisible)}>
          <TouchableHighlight style={{ flex: 1, marginHorizontal: 15, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', marginVertical: 15, justifyContent: 'center' }}>
                <TouchableOpacity style={this.style.modalButton} 
                    onPress={()=>this.setXYModalVisible(true)}>
                  <Text adjustsFontSizeToFit style={{ fontWeight: 'bold', color: '#fff' }}>Drive</Text>
                </TouchableOpacity>
                <TouchableOpacity style={this.style.modalButton} 
                    onPress={() => 
                      {this.sendOperation(Robot.AUTONOMY, Operation.DIG)}}>
                  <Text style={{ fontWeight: 'bold', color: '#fff' }}>Dig</Text> 
                </TouchableOpacity> 
                <TouchableOpacity style={this.style.modalButton} 
                    onPress={() => 
                      {this.sendOperation(Robot.AUTONOMY, Operation.DUMP)}}>
                  <Text adjustsFontSizeToFit style={{ fontWeight: 'bold', color: '#fff' }}>Dump</Text>
                </TouchableOpacity>
                <TouchableOpacity style={this.style.modalButton} 
                    onPress={() => 
                      {this.sendOperation(Robot.AUTONOMY, Operation.SELFRIGHT)}}>
                  <Text adjustsFontSizeToFit style={{ fontWeight: 'bold', color: '#fff' }}>Self-Right</Text>
                </TouchableOpacity>
                <TouchableOpacity style={this.style.modalButton} 
                    onPress={() => 
                      {this.sendOperation(Robot.AUTONOMY, Operation.FULLAUTONOMY)}}>
                  <Text adjustsFontSizeToFit style={{ fontWeight: 'bold', color: '#fff' }}>Full-Autonomy</Text>
                </TouchableOpacity>
            </View>
          </TouchableHighlight>
        </Modal>

        {/*Information Popup Modal*/}
        <Modal
          style={this.style.modalViewContainer}
          isVisible={this.state.modal2Visible}
          onSwipe={() => this.setModal2Visible(false)}
          swipeDirection='down'
          onRequestClose={() => this.setModal2Visible(false)}>
          <View style={{flexDirection: 'row'}}>
            <View style={{ flex: 20, marginHorizontal: 15, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{fontSize:20, fontWeight: 'bold', color: '#fff', textAlign: 'center'}}>NASA EZ-RASSOR Controller</Text>
              <View style={{marginVertical: 10}}/>
              <Text style={{fontSize:15, fontWeight: 'bold', color: '#fff'}}>App Developer</Text>
              <Text style={{color: '#fff'}}>Christopher Taliaferro</Text>
              <View style={{marginVertical: 10}}/>
              <Text style={{fontSize:15, fontWeight: 'bold', color: '#fff'}}>EZ-RASSOR Team</Text>
              <View style={{flexDirection: 'row'}}>
                <View>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Camilo Lozano</Text>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Cameron Taylor</Text>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Harrison Black</Text>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Ron Marrero</Text>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Samuel Lewis</Text>
                </View>
                <View style={{marginHorizontal:5}}/>
                <View>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Sean Rapp</Text>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Tiger Sachse</Text>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Tyler Duncan</Text>
                  <Text style={{color: '#fff', textAlign: 'center'}}>Lucas Gonzalez</Text>
                </View>
              </View>
            </View>
            <View style={{ flex: .5, borderRadius:20, backgroundColor: '#2e3030'}}></View>
            <View style={{ flex: 20, marginHorizontal: 15, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{fontSize:20, fontWeight: 'bold', color: '#fff'}}>Our Mission</Text>
              <View style={{marginVertical: 10}}/>
              <Text style={{color: '#fff', textAlign: 'center'}}>The EZ-RASSOR (EZ Regolith Advanced Surface Systems Operations Robot) is an inexpensive, autonomous, regolith-mining robot designed to mimic the look and abilities of NASA’s RASSOR on a smaller scale. The primary goal of the EZ-RASSOR is to provide a functioning demonstration robot for visitors at the Kennedy Space Center.</Text>
            </View>
          </View>
        </Modal>

        {/*Settings Modal*/}
        <Modal
          style={this.style.modalViewContainer}
          isVisible={this.state.ipModal}
          onSwipe={() => this.setIPModalVisible(false)}
          swipeDirection='down'
          onRequestClose={() => {this.setIPModalVisible(false)}}>
          <KeyboardAvoidingView
            paddingLeft={34}
            paddingRight={34}>
            <Text style={{color: '#fff', textAlign: 'center', fontFamily: 'NASA', fontSize: 45,}}>IP ADDRESS</Text>
            <TextInput
              style={this.style.ipInputBox}
              onChangeText={(text) => this.changeIP(text)}
              value={this.state.ip}
              marginVertical={20} />
          </KeyboardAvoidingView>
        </Modal>
        <Modal
          style={this.style.modalViewContainer}
          isVisible={this.state.xyModal}
          onSwipe={() => this.setXYModalVisible(false)}
          swipeDirection='down'
          onRequestClose={() => {this.setXYModalVisible(false)}}>
          <KeyboardAvoidingView
            paddingLeft={34}
            paddingRight={34}>
            <Text style={{color: '#fff', textAlign: 'center', fontFamily: 'NASA', fontSize: 45,}}>(X,Y)</Text>
            <TextInput
              style={this.style.ipInputBox}
              onChangeText={(text) => this.changeXY(text)}
              value={this.state.xy}
              marginVertical={20} />
              <TouchableOpacity style={{alignItems: 'center', backgroundColor: '#DDDDDD', padding: 10}}
                  onPress={()=> this.sendXY()}>
                    <Text>Done</Text>
              </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        <FadeInView style={this.style.headerContainer}>
          <TouchableOpacity style={{ flex: 1, padding: 3 }}>
            <FontAwesome
              name="info-circle"
              size={32}
              color='#fff'
              onPress={() => { this.setModal2Visible(true); }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, padding: 1 }}>
            <FontAwesome
              name="search"
              size={30}
              color='#fff'
              onPress={() => this.setIPModalVisible(true)} />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, padding: 1 }}>
            <FontAwesome
              name="map-marker"
              size={30}
              color='#fff'
              onPress={() => this.setXYModalVisible(true)} />
          </TouchableOpacity>
          <Text style={this.style.text}>EZ-RASSOR Controller</Text>
          <TouchableOpacity style={{ flex: 1, padding: 3}}>
            <MaterialCommunityIcons
              style={{marginLeft: "auto"}}
              name="close-octagon"
              size={35}
              color='#fff'
              onPress={() => 
                {this.sendOperation(Robot.ALL, Operation.STOP)}}/>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, padding: 3, }}>
            <MaterialCommunityIcons
              style={{marginLeft: "auto"}}
              name="robot"
              size={32}
              color='#fff'
              onPress={() => { this.setModalVisible(true); }} />
          </TouchableOpacity>
        </FadeInView>

        {/*Wheel Operations Board*/}
        <FadeInView style={this.style.buttonLayoutContainer}>
          <View style={{ flex: 3,  marginLeft: 10, borderRadius: 10, elevation: 3, backgroundColor: '#2e3030' }}>
            <View style={this.style.upAndDownDPad} >
            <TouchableOpacity
                onPressIn={() => 
                  {this.sendOperation(Robot.WHEELS, Operation.DRIVEFORWARD)}} 
                onPressOut={() => 
                  {this.sendOperation(Robot.WHEELS, Operation.STOPWHEELS)}}>  
              <FontAwesome
                name="chevron-up"
                size={50}
                color='#fff'/>
            </TouchableOpacity>
            </View>
            <View style={{flex: 2 , flexDirection: 'row'}}>
              <View style={this.style.dPadLeft}>
                <TouchableOpacity
                    onPressIn={() => 
                      {this.sendOperation(Robot.WHEELS, Operation.TURNLEFT)}}
                    onPressOut={() =>
                      {this.sendOperation(Robot.WHEELS, Operation.STOPWHEELS)}}>
                  <FontAwesome
                    name="chevron-left"
                    size={50}
                    color='#fff'/>
                </TouchableOpacity>
              </View>
              <View style={this.style.dPadRight}>
                <TouchableOpacity
                    onPressIn={() => 
                      {this.sendOperation(Robot.WHEELS, Operation.TURNRIGHT)}}
                    onPressOut={() =>
                      {this.sendOperation(Robot.WHEELS, Operation.STOPWHEELS)}}>
                  <FontAwesome
                    name="chevron-right"
                    size={50}
                    color='#fff'/>
                </TouchableOpacity>
              </View>
            </View>
            <View style={this.style.upAndDownDPad}>
              <TouchableOpacity
                  onPressIn={() => 
                    {this.sendOperation(Robot.WHEELS, Operation.DRIVEBACKWARD)}}
                  onPressOut={() =>
                    {this.sendOperation(Robot.WHEELS, Operation.STOPWHEELS)}}>
                <FontAwesome
                  name="chevron-down"
                  size={50}
                  color='#fff'/>
              </TouchableOpacity>
            </View>
          </View>

          {/*Drum/Arm Operations Board*/}
          <View style={this.style.drumFunctionContainer}> 
            <View style= {{ flex: 8}}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View>
                    <TouchableOpacity
                        onPressIn={() => 
                          {this.sendOperation(Robot.FRONTARM, Operation.UP)}}
                        onPressOut={() => 
                          {this.sendOperation(Robot.FRONTARM, Operation.STOP)}}>
                      <FontAwesome
                        name="arrow-circle-up"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginHorizontal: 15 }}> 
                    <TouchableOpacity
                        onPressIn={() =>
                          {this.sendOperation(Robot.FRONTARM, Operation.DOWN)}}
                        onPressOut={() =>
                          {this.sendOperation(Robot.FRONTARM, Operation.STOP)}}>
                      <FontAwesome
                        name="arrow-circle-down"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', position: 'absolute', right: 0 }}>
                  <View style={{ marginHorizontal: 15 }}>
                    <TouchableOpacity 
                        onPressIn={() => 
                          {this.sendOperation(Robot.BACKARM, Operation.UP)}}
                        onPressOut={() => 
                          {this.sendOperation(Robot.BACKARM, Operation.STOP)}}>
                      <FontAwesome
                        name="arrow-circle-up"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity 
                        onPressIn={() => 
                          {this.sendOperation(Robot.BACKARM, Operation.DOWN)}}
                        onPressOut={() => 
                          {this.sendOperation(Robot.BACKARM, Operation.STOP)}}>
                      <FontAwesome
                        name="arrow-circle-down"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <Image style={this.style.image} source={require('../../../assets/rassor.png')}/>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View>
                    <TouchableOpacity
                      onPressIn={() => 
                        {this.sendOperation(Robot.FRONTDRUM, Operation.ROTATEINWARD)}}
                      onPressOut={() =>
                        {this.sendOperation(Robot.FRONTDRUM, Operation.STOP)}}>
                      <FontAwesome
                        name="rotate-left"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginHorizontal: 15 }}>
                    <TouchableOpacity
                      onPressIn={() =>
                        {this.sendOperation(Robot.FRONTDRUM, Operation.ROTATEOUTWARD)}}
                      onPressOut={() =>
                        {this.sendOperation(Robot.FRONTDRUM, Operation.STOP)}}>
                      <FontAwesome
                        name="rotate-right"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', position: 'absolute', right: 0 }}>
                  <View style={{ marginHorizontal: 15 }}>
                    <TouchableOpacity
                      onPressIn={() =>
                        {this.sendOperation(Robot.BACKDRUM, Operation.ROTATEINWARD)}}
                      onPressOut={() =>
                        {this.sendOperation(Robot.BACKDRUM, Operation.STOP)}}>
                      <FontAwesome
                        name="rotate-left"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPressIn={() =>
                        {this.sendOperation(Robot.BACKDRUM, Operation.ROTATEOUTWARD)}}
                      onPressOut={() =>
                        {this.sendOperation(Robot.BACKDRUM, Operation.STOP)}}>
                      <FontAwesome
                        name="rotate-right"
                        size={50}
                        color='#fff'/>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </FadeInView>
      </View>
    );
  }
} 