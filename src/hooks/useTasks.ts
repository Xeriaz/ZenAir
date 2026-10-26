import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { getTodayDateString } from '../utils/dates';

export function useTasks() {
  const todayStr = getTodayDateString();

  const tasks = useLiveQuery(async () => {
    return await db.tasks.where('date').equals(todayStr).sortBy('startTime');
  }, [todayStr]);

  const toggleTask = async (id: number): Promise<{ completed: boolean }> => {
    const task = await db.tasks.get(id);
    if (!task) return { completed: false };

    const newCompleted = !task.completed;
    await db.tasks.update(id, { completed: newCompleted });

    return { completed: newCompleted };
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
