export async function requestPermission() {
  if ("Notification" in window) {
    await Notification.requestPermission()
  }
}

export function notify(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body })
  }
}
