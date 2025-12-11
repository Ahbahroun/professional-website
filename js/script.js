document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("contact-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // stop redirect

    if (!status) return;

    status.textContent = "Sending...";
    status.style.color = "var(--muted)";
    status.style.opacity = "1";
    status.style.transform = "translateY(0)";

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json", // ensures JSON response from Web3Forms
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          status.textContent = "Thanks! Your message has been sent.";
          status.style.color = "var(--accent)";
          // Uncomment this if you want to clear the fields:
          // form.reset();
        } else {
          status.textContent =
            "Something went wrong. Please try again.";
          status.style.color = "#f66";
        }
      })
      .catch(() => {
        status.textContent = "Network error. Please try again.";
        status.style.color = "#f66";
      });
  });
});
