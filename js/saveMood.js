export function saveLocalMood(data) {
  const moods = JSON.parse(localStorage.getItem("moodHistory") || "[]");

  const entry = {
    mood: data.mood,
    note: data.note || "",
    date: new Date().toISOString()
  };

  moods.push(entry);

  localStorage.setItem("moodHistory", JSON.stringify(moods));
}