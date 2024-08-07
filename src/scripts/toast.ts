export const successToast = (message: string) => showToast(message, 'green');
export const errorToast = (message: string) => showToast(message, 'red');

function showToast(message: string, color: "green" | "red") {
  const toast = document.getElementById("toast")!;
  toast.textContent = message;
  // Remove any existing color classes
  toast.classList.remove(
    "bg-green-500",
    "bg-red-500",
    "bg-blue-500",
    "bg-yellow-500"
  );

  // Add the new color class
  toast.classList.add(`bg-${color}-500`);
  toast.classList.remove("-translate-y-full");
  setTimeout(() => {
    toast.classList.add("-translate-y-full");
  }, 3000);
}
