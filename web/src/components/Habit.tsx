interface HabitProps {
  completed: number;
}

export function Habit(props: HabitProps) {
  return (
    <div className="bg-zinc-988 w-10 h-10 text-white rounded m-2 flex items-center justify-center">
      My Habit {props.completed}
    </div>
  );
}
