import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import dayjs from "dayjs";
import axios from "axios";

export async function appRoutes(app: FastifyInstance) {
  app.post("/habits", async (request, response) => {
    const createHabitSchema = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)), // [ 0,1,2 ]
    });

    const { title, weekDays } = createHabitSchema.parse(request.body);
    const today = dayjs().startOf("day").toDate();

    const { authorization } = request.headers;
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" +
        authorization
    );
    const { id: userId } = data;

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        user_id: userId,
        weekDays: {
          create: weekDays.map((day) => ({ week_day: day })),
        },
      },
    });
  });

  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(), // converte a string para um objeto Date
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf("day");
    const weekDay = parsedDate.get("day");

    const { authorization } = request.headers;
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" +
        authorization
    );
    const { id: userId } = data;

    const possibleHabits = await prisma.habit.findMany({
      where: {
        user_id: userId,
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits =
      day?.dayHabits.map((dayHabit) => dayHabit.habit_id) || [];

    return { possibleHabits, completedHabits };
  });

  app.patch("/habits/:id/toggle", async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });
    const toggleHabitQuery = z.object({
      date: z.coerce.date(),
    });

    const { id } = toggleHabitParams.parse(request.params);
    const { date } = toggleHabitQuery.parse(request.body);

    let day = await prisma.day.findUnique({
      where: {
        date: date,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: date,
        },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      // Remover a marcação de completo do hábito
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      // Completar o hábito
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  app.get("/summary", async (request) => {
    const { authorization } = request.headers;

    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" +
        authorization
    );

    const { id: userId } = data;

    const summary = await prisma.$queryRaw`
      select 
        d.id, 
        d.date,
        (
          select cast(count(*) as float) 
          from day_habits dh 
          join habits h on h.id = dh.habit_id and h.user_id = ${userId}
          where dh.day_id = d.id
        ) as completed,
        (
          select cast(count(*) as float) 
          from habit_week_days hwd 
          join habits h on h.id = hwd.habit_id
          where hwd.week_day = cast(strftime('%w', d.date / 1000, 'unixepoch') as int)
            and h.user_id = ${userId}
            and h.created_at <= d.date
        ) as amount
      from days d
    `;

    return summary;
  });
}
