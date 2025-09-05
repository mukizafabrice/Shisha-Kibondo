import React, { useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Surface,
  ActivityIndicator,
} from "react-native-paper";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { createProduct } from "../../services/ProductService.js"; // Make sure default export exists

const AddProductScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Product name is required");
      return;
    }

    setLoading(true);
    try {
      await createProduct({ name, description });
      Alert.alert("Success", "Product added successfully");
      navigation.goBack(); // Go back to the product list
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior="padding"
    >
      <Surface style={styles.container}>
        <ScrollView>
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Product Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
              />
              <Button
                mode="contained"
                onPress={handleAddProduct}
                style={styles.button}
                buttonColor="#007AFF"
              >
                Add Product
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  card: {
    elevation: 2,
    marginTop: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddProductScreen;
