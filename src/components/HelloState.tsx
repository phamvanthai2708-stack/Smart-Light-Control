import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'

// kiểu dữ liệu
interface Props {
  name: string;
  age: string;
  onUpdate: (name: string, age: string) => void;
}

const Child = (props: Props) => {
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');

  return (
    <View style={{ borderColor: '#0a00de', borderWidth: 2, borderRadius: 10, padding: 15, marginTop: 20 }}>
      <Text style={[styles.helloText, { color: '#000' }]}>Con:</Text>
      
      <Text style={styles.textInput}>Name nhận từ cha: {props.name}</Text>
      <Text style={styles.textInput}>Age nhận từ cha: {props.age}</Text>
      
      <TextInput 
        style={styles.textInput}
        placeholder='Nhập tên mới cho cha'  
        placeholderTextColor="#999"
        value={childName}
        onChangeText={setChildName}
      />
      <TextInput 
        style={styles.textInput}
        placeholder='Nhập tuổi mới cho cha'
        placeholderTextColor="#999"
        value={childAge}
        onChangeText={setChildAge}
        keyboardType='numeric'
      />
      
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity 
          style={[styles.containerButton, { width: 300 }]} 
          onPress={() => props.onUpdate(childName, childAge)}
        >
          <Text style={{ fontSize: 25, color: '#ffffff' }}>Truyền dữ liệu lên cha</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const HelloState = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handlePrint = () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    Alert.alert('Kết quả', `Chào ${name}!\nTuổi của bạn là: ${age}`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerText}>
        <Text style={[styles.helloText, { color: '#000' }]}>Cha</Text>
      </View>
      
      <View style={styles.containerInput}>
        <TextInput 
          style={styles.textInput}
          placeholder='nhập tên của bạn'  
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        <TextInput 
          style={styles.textInput}
          placeholder='nhập tuổi của bạn'
          placeholderTextColor="#999"
          value={age}
          onChangeText={setAge}
          keyboardType='numeric'
        />
      </View>
      
      <TouchableOpacity style={styles.containerButton} onPress={handlePrint}>
        <Text style={styles.button}>in kết quả</Text>
      </TouchableOpacity>

      <Child 
        name={name} 
        age={age} 
        onUpdate={(newName, newAge) => {
          setName(newName);
          setAge(newAge);
        }}
      />
    </View>
  )
}

export default HelloState

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    },
    containerText:{
        alignItems: 'center'
    },
    containerInput:{
     
    },
    helloText:{
        color:'#f01010',
        fontSize: 40 ,
    },
    textInput: {
        color:'#079cf9',
        fontSize:30,
        borderWidth: 2,
        borderRadius:10,
        borderColor:'#f305e3',
        marginTop: 5,
        width:400,
        paddingHorizontal: 15,
    },
    containerButton:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#18bfe0',
        width:200,
        borderRadius:10,
        marginTop:15,
        paddingVertical: 5
    },
    button:{
        fontSize:30,
        color: '#ffffff',
    }
})
