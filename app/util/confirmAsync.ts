import { Alert } from "react-native";

type NativeConfirmOptions = {
  title: string;
  message: string;
  confirmButtonText?: string;
};

export default async function confirmAsync(options: NativeConfirmOptions) {
  return await new Promise((resolve, reject) => {
    Alert.alert(options.title, options.message, [
      {
        text: options.confirmButtonText ?? "OK",
        onPress: () => resolve(true),
      },
      {
        text: "Cancel",
        onPress: () => resolve(false),
        style: "cancel",
      },
    ]);
  });
}
