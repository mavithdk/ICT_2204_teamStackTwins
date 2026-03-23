function submitForm() {

  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('emailAddr').value.trim();
  const subject = document.getElementById('msgSubject').value;
  const message = document.getElementById('msgBody').value.trim();

  if (!name || !email || !subject || !message) {
    alert("Please fill all fields!");
    return;
  }

  if (!email.includes("@")) {
    alert("Enter valid email!");
    return;
  }

  alert("Message sent successfully!");
}