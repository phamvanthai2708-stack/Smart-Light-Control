import { StyleSheet, Text, View, Button, Alert, TouchableOpacity } from 'react-native'
import React from 'react'

type Props = {
  name: string,
  age: number,
}

const Ahihi = (props: Props) => {
  function onPressHello() {
    Alert.alert('Thông báo', `hello ${props.name}, age: ${props.age}`, [
      { text: 'ok', onPress: () => console.log('OK Pressed') },
    ]);
  }

  return (
    <View style={styles.box1}>
      <Text style={styles.text1}>hello ahihi</Text>
      <TouchableOpacity style={styles.button} onPress={onPressHello}>
        <Text style={styles.textButton}>Nhấn vào đây</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Ahihi

const styles = StyleSheet.create({
  text1: {
    color: '#ec6010',
    fontSize: 40,
  },
  box1: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#219b69',
    height: 80,
    padding: 15,
    borderRadius: 15,
  },
  textButton: {
    fontSize: 30,
    color: '#bde824',
  }
})
