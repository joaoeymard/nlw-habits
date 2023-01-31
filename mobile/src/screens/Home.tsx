import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { api } from "../lib/axios";
import { generateRangeDatesFromYearStart } from "../utils/generate-range-between-dates";

import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";
import { sortList } from "../utils/sort-list";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const datesFromYearStart = generateRangeDatesFromYearStart();
const minimumSummaryDatesSizes = 10 * 7;
const amountOfDatesToFill =
  minimumSummaryDatesSizes - datesFromYearStart.length;

type SummaryProps = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}[];

export function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryProps | null>(null);
  const { navigate } = useNavigation();

  async function fetchData() {
    try {
      setLoading(true);

      const response = await api.get("/summary");
      setSummary(response.data);
    } catch (error) {
      Alert.alert("Ops", "Não foi possível carregar o sumário de hábitos");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) return <Loading />;

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {sortList(datesFromYearStart, null, -1)
          .slice(0, 7)
          .map((day, ind) => (
            <Text
              key={ind}
              className="text-zinc-400 text-xl font-bold text-center mx-1"
              style={{ width: DAY_SIZE }}
            >
              {dayjs(day).format("ddd")}
            </Text>
          ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {sortList(datesFromYearStart, null, -1)
              .slice(0, minimumSummaryDatesSizes)
              .map((date, ind) => {
                const dayWithHabit = summary.find((day) => {
                  return dayjs(date).isSame(day.date, "day");
                });

                return (
                  <HabitDay
                    key={ind}
                    date={date}
                    amountOfHabits={dayWithHabit?.amount}
                    amountCompleted={dayWithHabit?.completed}
                    onPress={() =>
                      navigate("habit", { date: date.toISOString() })
                    }
                  />
                );
              })}

            {amountOfDatesToFill > 0 &&
              Array.from({ length: amountOfDatesToFill }).map((_, ind) => (
                <TouchableOpacity
                  key={ind}
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
