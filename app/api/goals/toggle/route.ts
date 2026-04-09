import { NextResponse } from "next/server";
import { getStore } from "../../lib/store";

export async function POST(request: Request) {
  try {
    const { index } = await request.json();
    const store = getStore();

    if (typeof index !== "number" || index < 0 || index >= store.goals.length) {
      return NextResponse.json({ error: "Invalid goal index" }, { status: 400 });
    }

    // Toggle the goal
    store.goals[index].done = !store.goals[index].done;

    const completed = store.goals.filter(g => g.done).length;
    const total = store.goals.length;

    return NextResponse.json({
      success: true,
      goals: {
        completed,
        total,
        tasks: store.goals,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
