function submitContactForm(event) {
  event.preventDefault(); // stop redirect

  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  // show "Sending..." state
  status.textContent = "Sending...";
  status.style.color = "var(--muted)";
  status.style.opacity = "1";
  status.style.transform = "translateY(0)";

  const formData = new FormData(form);

  fetch(form.action, {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        status.textContent = "Thanks! Your message has been sent.";
        status.style.color = "var(--accent)";
        // form.reset(); // keep or remove depending if you want fields cleared
      } else {
        status.textContent = "Something went wrong. Please try again.";
        status.style.color = "#f66";
      }
    })
    .catch(() => {
      status.textContent = "Network error. Please try again.";
      status.style.color = "#f66";
    });

  return false;
}
