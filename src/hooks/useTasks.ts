import { useLiveQuery } from 'dexie-react-hooks';
import { db, INITIAL_USER_PROFILE } from '../db/db';
import { getTodayDateString } from '../utils/dates';
import { calculateStatsUpdate } from '../utils/gamification';

export function useTasks() {
  const todayStr = getTodayDateString();

  const tasks = useLiveQuery(async () => {
    return await db.tasks.where('date').equals(todayStr).sortBy('startTime');
  }, [todayStr]);

  const toggleTask = async (id: number): Promise<{ completed: boolean; leveledUp: boolean }> => {
    const task = await db.tasks.get(id);
    if (!task) return { completed: false, leveledUp: false };

    const newCompleted = !task.completed;
    await db.tasks.update(id, { completed: newCompleted });

    const profile = (await db.userProfile.toCollection().first()) ?? INITIAL_USER_PROFILE;
    const xpDelta = newCompleted ? 15 : -15;
    const goldDelta = newCompleted ? 5 : -5;

    const { updated, leveledUp } = calculateStatsUpdate(profile, xpDelta, goldDelta);
    await db.userProfile.put(updated);

    return { completed: newCompleted, leveledUp };
  };

  const createTask = async (data: {
    title: string;
    startTime?: string;
    durationMinutes?: number;
  }) => {
    return await db.tasks.add({
      title: data.title,
      date: todayStr,
      startTime: data.startTime || '09:00',
      durationMinutes: data.durationMinutes || 30,
      completed: false,
      createdAt: new Date().toISOString()
    });
  };

  const deleteTask = async (id: number) => {
    await db.tasks.delete(id);
  };

  return {
    tasks: tasks ?? [],
    toggleTask,
    createTask,
    deleteTask
  };
}
