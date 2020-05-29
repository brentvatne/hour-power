import { Alert } from "react-native";
type AlertOptions = {
  title: string;
  message: string;
};

export default function alertAsync({ title, message }: AlertOptions) {
  Alert.alert(title, message);
}
