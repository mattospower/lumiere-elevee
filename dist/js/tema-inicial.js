// Aplica o tema salvo antes da primeira pintura da página, sem JavaScript inline.
try {
  const temaSalvo = localStorage.getItem("le_theme");
  document.documentElement.dataset.theme =
    temaSalvo === "dark" ? "dark" : "light";
} catch {
  document.documentElement.dataset.theme = "light";
}
