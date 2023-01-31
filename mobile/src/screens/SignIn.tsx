import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as AuthSession from "expo-auth-session";

import Logo from "../assets/logo.svg";
import { api } from "../lib/axios";

type AuthResponse = {
  type: string;
  params: {
    access_token: string;
  };
};

export function SignIn() {
  const { navigate } = useNavigation();

  async function handleSignIn() {
    const CLIENT_ID =
      "529650612576-lloqe6gqsioc2jrpj8cgo7kjb4irkec7.apps.googleusercontent.com";
    const REDIRECT_URI = "https://auth.expo.io/@joaoeymard/nlwhabits";
    const RESPONSE_TYPE = "token";
    const SCOPE = encodeURI("profile email openid");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

    const { type, params } = (await AuthSession.startAsync({
      authUrl,
    })) as AuthResponse;

    if (type === "success") {
      api.defaults.headers.common["Authorization"] = params.access_token;

      navigate("home");
    }
  }

  return (
    <>
      <View className="flex-1 justify-center items-center bg-background px-8 pt-16">
        <View className="mt-6 mb-2">
          <Logo />
        </View>
      </View>
      <View className="bg-background pb-20 items-center">
        <TouchableOpacity
          className="flex-row w-1/2 justify-center h-11 px-4 bg-violet-500 rounded-lg items-center"
          onPress={handleSignIn}
        >
          <Text className="text-white font-semibold text-base">
            Entrar com Google
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
